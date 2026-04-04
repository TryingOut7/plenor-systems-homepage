#!/usr/bin/env bash
# Installs project git hooks from .githooks/ into .git/hooks/.
#
# Git does not automatically use .githooks/; this script wires them up.
# Run once after cloning (or after hooks are updated).
#
# Usage: npm run hooks:install

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
HOOKS_SRC="$ROOT/.githooks"
HOOKS_DST="$ROOT/.git/hooks"

if [ ! -d "$HOOKS_SRC" ]; then
  echo "No .githooks/ directory found. Nothing to install."
  exit 0
fi

installed=0
skipped=0

for src in "$HOOKS_SRC"/*; do
  [ -f "$src" ] || continue
  hook_name="$(basename "$src")"
  dst="$HOOKS_DST/$hook_name"

  if [ -f "$dst" ] && [ ! -L "$dst" ]; then
    echo "⚠️  $hook_name: a non-symlink hook already exists at $dst — skipping."
    echo "   To replace it: rm $dst && npm run hooks:install"
    skipped=$((skipped + 1))
    continue
  fi

  ln -sf "$src" "$dst"
  chmod +x "$src"
  echo "✓  $hook_name → .git/hooks/$hook_name"
  installed=$((installed + 1))
done

echo ""
echo "Installed $installed hook(s), skipped $skipped."
echo "Run 'git push --no-verify' to bypass hooks in an emergency."
