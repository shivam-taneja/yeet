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

echo "Pushing tag to origin to ensure GitHub CLI can see it..."
git push origin "$TAG"

# CI may have already created this release (with zips). Recreate so you get the
# same interactive notes prompt — assets are downloaded and re-attached.
if gh release view "$TAG" >/dev/null 2>&1; then
  echo "Release already exists — keeping assets, recreating so you can set notes..."
  ASSET_DIR=$(mktemp -d)
  trap 'rm -rf "$ASSET_DIR"' EXIT
  gh release download "$TAG" -D "$ASSET_DIR" 2>/dev/null || true
  gh release delete "$TAG" --yes

  shopt -s nullglob
  ASSETS=("$ASSET_DIR"/*)
  echo "Opening GitHub CLI interactive release creator..."
  if ((${#ASSETS[@]})); then
    gh release create "$TAG" --title "Yeet $TAG" "${ASSETS[@]}"
  else
    gh release create "$TAG" --title "Yeet $TAG"
  fi
else
  echo "Opening GitHub CLI interactive release creator..."
  gh release create "$TAG" --title "Yeet $TAG"
fi
