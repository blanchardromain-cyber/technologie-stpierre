---
name: linting
description: Python linting with Ruff - an extremely fast linter written in Rust. Use when: (1) Standardizing code quality, (2) Fixing style warnings, (3) Enforcing rules in CI, (4) Replacing flake8/isort/pyupgrade/autoflake, (5) Configuring lint rules and suppressions.
---

# Ruff Linting

Ruff is an extremely fast Python linter designed as a drop-in replacement for Flake8 (plus dozens of plugins), isort, pydocstyle, pyupgrade, autoflake, and more. Written in Rust, it offers 10-100x performance improvements over traditional Python linters.

## Overview

Ruff provides a single CLI for linting with optional auto-fix. It supports an extensive rule set with 800+ built-in rules and integrates cleanly with pre-commit, CI systems, and modern editors.

### Key Features

- **Extremely Fast**: 10-100x faster than Flake8, Black, isort
- **Drop-in Replacement**: Compatible with existing Flake8 plugins and configurations
- **Auto-fix Support**: Automatically fix many common issues
- **Comprehensive Rules**: 800+ built-in rules from popular linters
- **Single Tool**: Replaces flake8, isort, pyupgrade, autoflake, pydocstyle, and more

## When to Use

- Standardizing code quality across a project or team
- Enforcing consistent coding rules in CI/CD pipelines
- Replacing multiple linting tools with a single fast solution
- Auto-fixing common code style issues
- Migrating from Flake8, isort, or other legacy linters

## Quick Start

```
# Install Ruff
uv pip install ruff
# or
pip install ruff

# Run linting on current directory
ruff check .

# Run linting with auto-fix
ruff check . --fix

# Watch mode for development
ruff check --watch
```

## Core Patterns

1. **Start minimal**: Enable `E` and `F` rules first, then gradually expand
2. **Auto-fix safely**: Use `ruff check --fix` for safe fixes only
3. **Per-file ignores**: Use sparingly for generated code or special cases
4. **CI integration**: Use `ruff check --output-format github` for GitHub Actions
5. **Single source of truth**: Configure via `pyproject.toml` or `ruff.toml`

## Rule Selection

Ruff uses a code system where each rule consists of a 1-3 letter prefix followed by digits (e.g., `F401`). Rules are controlled via `lint.select`, `lint.extend-select`, and `lint.ignore`.

### Recommended Rule Sets

**Minimal (Start Here)**:

```toml
[tool.ruff.lint]
select = ["E", "F"]  # pycodestyle errors + Pyflakes
```

**Balanced (Recommended)**:

```toml
[tool.ruff.lint]
select = [
    "E",    # pycodestyle errors
    "F",    # Pyflakes
    "UP",   # pyupgrade
    "B",    # flake8-bugbear
    "SIM",  # flake8-simplify
    "I",    # isort
]
```

**Comprehensive**:

```toml
[tool.ruff.lint]
select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # Pyflakes
    "UP",   # pyupgrade
    "B",    # flake8-bugbear
    "SIM",  # flake8-simplify
    "I",    # isort
    "N",    # pep8-naming
    "S",    # flake8-bandit (security)
    "C4",   # flake8-comprehensions
    "DTZ",  # flake8-datetimez
    "T20",  # flake8-print
    "RUF",  # Ruff-specific rules
]
ignore = ["E501"]  # Line too long (handled by formatter)
```

## Configuration

### pyproject.toml (Recommended)

```toml
[tool.ruff]
line-length = 88
target-version = "py311"
exclude = [".venv", "dist", "build", "*.pyi"]

[tool.ruff.lint]
select = ["E", "F", "UP", "B", "SIM", "I"]
ignore = ["E501"]
fixable = ["ALL"]
unfixable = []

[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = ["S101"]      # Allow assert in tests
"__init__.py" = ["F401"]        # Allow unused imports

[tool.ruff.lint.isort]
known-first-party = ["myproject"]
```

### ruff.toml Alternative

```toml
line-length = 88
target-version = "py311"

[lint]
select = ["E", "F", "UP", "B", "SIM", "I"]
ignore = ["E501"]

[lint.per-file-ignores]
"tests/**/*.py" = ["S101"]
```

## Fix Safety

Ruff categorizes fixes as **safe** or **unsafe**:

| Type | Behavior | Default |
|------|----------|---------|
| **Safe** | Preserves code semantics | Enabled |
| **Unsafe** | May change runtime behavior | Disabled |

```bash
# Apply only safe fixes (default)
ruff check --fix

# Apply all fixes including unsafe
ruff check --fix --unsafe-fixes

# Show what unsafe fixes are available
ruff check --unsafe-fixes
```

## Error Suppression

### Line-Level (noqa)

```python
x = 1  # noqa: F841           # Ignore specific rule
i = 1  # noqa: E741, F841     # Ignore multiple rules
x = 1  # noqa                  # Ignore all rules (avoid this)
```

### File-Level

```python
# ruff: noqa                   # Ignore all rules in file
# ruff: noqa: F841             # Ignore specific rule in file
```

## CLI Commands

```bash
# Basic linting
ruff check .                           # Lint current directory
ruff check path/to/file.py             # Lint specific file
ruff check . --fix                     # Lint and auto-fix
ruff check . --fix --unsafe-fixes      # Include unsafe fixes

# Output formats
ruff check . --output-format text      # Default human-readable
ruff check . --output-format github    # GitHub Actions annotations
ruff check . --output-format json      # JSON output

# Inspection
ruff check . --diff                    # Show what would change
ruff check . --show-fixes              # Show available fixes
ruff check . --statistics              # Show rule statistics
ruff rule F401                         # Explain a specific rule

# Development
ruff check --watch                     # Watch mode
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | No violations found, or all fixed |
| 1 | Violations found |
| 2 | Configuration error or internal error |

## CI Integration

### GitHub Actions

```yaml
name: Lint
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/ruff-action@v3
        with:
          args: "check --output-format github"
```

### Pre-commit

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Rule conflicts with formatter | Ignore formatting rules (E501) when using ruff format |
| Too many violations | Start with minimal rules (E, F), expand gradually |
| Too many per-file ignores | Review rule selection, consider disabling noisy rules |
| Slow on large codebase | Ensure .venv excluded, check for recursive symlinks |
| noqa not working | Check syntax: `# noqa: F401` (colon required) |

## Common Rule Prefixes

| Prefix | Source | Description |
|--------|--------|-------------|
| E/W | pycodestyle | Style errors/warnings |
| F | Pyflakes | Logical errors |
| B | flake8-bugbear | Common bugs |
| I | isort | Import sorting |
| UP | pyupgrade | Python version upgrades |
| SIM | flake8-simplify | Code simplification |
| N | pep8-naming | Naming conventions |
| S | flake8-bandit | Security issues |
| C4 | flake8-comprehensions | Comprehension style |
| RUF | Ruff | Ruff-specific rules |

## References

- Official Documentation: https://docs.astral.sh/ruff/
- Full Rules Reference: https://docs.astral.sh/ruff/rules/
- Source skill: https://github.com/jiatastic/open-python-skills/tree/main/skills/ruff-linter
