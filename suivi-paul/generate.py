#!/usr/bin/env python3
"""
generate.py — Régénère suivi-paul/index.html selon la date du jour.

Lit unlock-config.json, calcule le statut de chaque semaine (locked/active/done/soon)
en fonction de la date courante (timezone Europe/Paris), puis rend template.html.j2.

Usage :
  python generate.py                 # utilise la date du jour (Paris)
  python generate.py --date 2026-05-11   # simule une date précise
  python generate.py --check         # affiche le diagnostic sans écrire le fichier
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from jinja2 import Environment, FileSystemLoader, select_autoescape

HERE = Path(__file__).resolve().parent
CONFIG_PATH = HERE / "unlock-config.json"
TEMPLATE_NAME = "template.html.j2"
OUTPUT_PATH = HERE / "index.html"

PARIS_TZ = ZoneInfo("Europe/Paris")


def parse_args():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--date", help="Date simulée (YYYY-MM-DD)", default=None)
    p.add_argument("--check", action="store_true", help="Diagnostic sans écriture")
    return p.parse_args()


def today_paris(override: str | None) -> date:
    if override:
        return datetime.strptime(override, "%Y-%m-%d").date()
    return datetime.now(PARIS_TZ).date()


def compute_status(week: dict, today: date) -> str:
    active_from = datetime.strptime(week["active_from"], "%Y-%m-%d").date()
    done_from = datetime.strptime(week["done_from"], "%Y-%m-%d").date()
    has_code = bool(week.get("code"))
    has_activity = bool(week.get("activity_label"))

    if today >= done_from:
        return "done"
    if today >= active_from:
        return "active"
    # Avant active_from : "locked" si la semaine a un contenu connu (code/activity),
    # "soon" si c'est juste un placeholder à venir.
    if has_activity:
        return "locked"
    return "soon"


PILL_TEXT = {
    "active": "En cours",
    "done": "Terminé ✅",
    "locked": "Code à venir",
    "soon": "À planifier",
}


def message_to_html(text: str) -> str:
    """Transforme \\n en <br> pour l'affichage HTML."""
    if not text:
        return ""
    # Échappe les < et > basiques par sécurité, mais sans casser le contenu attendu
    safe = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return safe.replace("\n", "<br>")


def message_to_js_string(text: str) -> str:
    """Échappe pour insertion dans une chaîne JavaScript single-quoted."""
    if not text:
        return ""
    return (
        text.replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\n", "\\n")
        .replace("\r", "")
    )


def build_week_view(week: dict, today: date) -> dict:
    status = compute_status(week, today)
    show_code = status in ("active", "done") and bool(week.get("code"))

    if status == "locked" and week.get("title_locked"):
        display_title = week["title_locked"]
    else:
        display_title = week.get("title") or "Activité à venir"

    return {
        "num": week["num"],
        "status": status,
        "display_title": display_title,
        "dates_label": week.get("dates_label", ""),
        "pill_text": PILL_TEXT[status],
        "activity_label": week.get("activity_label"),
        "activity_html": week.get("activity_html") or "",
        "show_code": show_code,
        "code": week.get("code") or "",
        "code_label": week.get("code_label") or "Code d'accès",
        "link_url": week.get("link_url"),
        "link_label": week.get("link_label") or "Ouvrir",
        "locked_text": week.get("locked_text")
            or "Le code d'accès te sera communiqué par M. Blanchard en début de semaine.",
        "soon_text": week.get("soon_text")
            or "Cette semaine sera mise à jour par M. Blanchard.",
        "signal_intro": week.get("signal_intro"),
        "signal_message_html": message_to_html(week.get("signal_message") or ""),
        "signal_message_js": message_to_js_string(week.get("signal_message") or ""),
        "is_open": False,  # ajusté plus bas
    }


def main():
    args = parse_args()
    today = today_paris(args.date)

    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    header = config.get("header", {})
    weeks_raw = config["weeks"]

    weeks = [build_week_view(w, today) for w in weeks_raw]

    # Choisit la semaine à ouvrir par défaut : la première active sinon la première locked
    open_idx = next((i for i, w in enumerate(weeks) if w["status"] == "active"), None)
    if open_idx is None:
        open_idx = next((i for i, w in enumerate(weeks) if w["status"] == "locked"), 0)
    weeks[open_idx]["is_open"] = True

    done_count = sum(1 for w in weeks if w["status"] == "done")
    started_count = sum(1 for w in weeks if w["status"] in ("active", "done"))
    total = len(weeks)
    progress_pct = round(started_count / total * 100, 1) if total else 0

    env = Environment(
        loader=FileSystemLoader(HERE),
        autoescape=select_autoescape(disabled_extensions=("j2",), default=False),
        trim_blocks=False,
        lstrip_blocks=False,
    )
    tmpl = env.get_template(TEMPLATE_NAME)

    rendered = tmpl.render(
        weeks=weeks,
        done_count=done_count,
        total_weeks=total,
        progress_pct=progress_pct,
        school_year=header.get("school_year", ""),
        site_url=header.get("site_url", "#"),
        site_label=header.get("site_label", "Site Technologie"),
        generated_at=datetime.now(PARIS_TZ).strftime("%d %B %Y à %Hh%M (Paris)"),
    )

    if args.check:
        print(f"Date utilisée : {today}")
        for w in weeks:
            mark = " ←" if w["is_open"] else ""
            print(f"  Semaine {w['num']}: {w['status']:<7} | {w['display_title']}{mark}")
        print(f"\nProgression : {started_count}/{total} démarrées · {done_count}/{total} complétées ({progress_pct}%)")
        print(f"\n[--check] index.html non écrit. Retire --check pour générer.")
        return 0

    # Écriture conditionnelle : ne touche au fichier que si le contenu change.
    # Ça évite les commits vides depuis GitHub Actions.
    new_content = rendered
    old_content = OUTPUT_PATH.read_text(encoding="utf-8") if OUTPUT_PATH.exists() else ""
    if new_content == old_content:
        print(f"index.html déjà à jour ({today}).")
        return 0

    OUTPUT_PATH.write_text(new_content, encoding="utf-8")
    print(f"index.html régénéré ({today}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
