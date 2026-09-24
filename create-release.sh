#!/bin/bash

set -e

# Extract the current version directly from package.json
VERSION=$(node -e "console.log(require('./package.json').version)")
TAG="v$VERSION"

echo "🚀 Preparing to create GitHub Release for $TAG..."

# Verify the tag actually exists in Git
if ! git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "⚠️  Error: Tag $TAG does not exist locally."
  echo "Make sure you run 'pnpm version patch' first before creating the release!"
  exit 1
fi

echo "Opening GitHub CLI interactive release creator..."
# Launch the interactive gh CLI tool
gh release create "$TAG" --title "Yeet $TAG"
