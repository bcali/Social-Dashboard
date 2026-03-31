#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# dashboard-starter bootstrap script
# Run once after cloning to configure your project
# ──────────────────────────────────────────────

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   dashboard-starter bootstrap          ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# 1. Project name
read -rp "Project name (e.g., loyalty-dashboard): " PROJECT_NAME
if [[ -z "$PROJECT_NAME" ]]; then
  echo "Error: Project name is required."
  exit 1
fi

# 2. GitHub username
read -rp "GitHub username (e.g., bcali): " GITHUB_USERNAME
if [[ -z "$GITHUB_USERNAME" ]]; then
  echo "Error: GitHub username is required."
  exit 1
fi

# 3. Theme selection
echo ""
echo "Available themes:"
echo "  1) minor-hotels  — Minor Hotels brand (warm white, navy, custom fonts)"
echo "  2) clean-light   — Professional blue/gray on white"
echo "  3) neutral-dark  — Muted slate/emerald, no neon"
echo "  4) tron-dark     — Neon cyan/orange on deep black"
read -rp "Select theme [1-4, default=1]: " THEME_CHOICE
case "${THEME_CHOICE:-1}" in
  1) THEME_FILE="minor-hotels" ;;
  2) THEME_FILE="clean-light" ;;
  3) THEME_FILE="neutral-dark" ;;
  4) THEME_FILE="tron-dark" ;;
  *) echo "Invalid choice"; exit 1 ;;
esac

# 4. Deploy target
echo ""
echo "Deploy target:"
echo "  1) GitHub Pages (default)"
echo "  2) Vercel"
echo "  3) Both"
read -rp "Select deploy target [1-3, default=1]: " DEPLOY_CHOICE
DEPLOY_TARGET="${DEPLOY_CHOICE:-1}"

# ── Apply configuration ──

echo ""
echo "Configuring project: $PROJECT_NAME"
echo "  GitHub user:  $GITHUB_USERNAME"
echo "  Theme:        $THEME_FILE"
echo "  Deploy:       $([ "$DEPLOY_TARGET" = "1" ] && echo "GitHub Pages" || ([ "$DEPLOY_TARGET" = "2" ] && echo "Vercel" || echo "Both"))"
echo ""

# Replace placeholders across all files
find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.html" -o -name "*.yml" -o -name "*.toml" -o -name "*.md" -o -name ".env*" \) \
  ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./bootstrap.sh" \
  -exec sed -i "s/__PROJECT_NAME__/$PROJECT_NAME/g" {} +

find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.html" -o -name "*.yml" -o -name "*.toml" -o -name "*.md" -o -name ".env*" \) \
  ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./bootstrap.sh" \
  -exec sed -i "s/__GITHUB_USERNAME__/$GITHUB_USERNAME/g" {} +

find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.html" -o -name "*.yml" -o -name "*.toml" -o -name "*.md" -o -name ".env*" \) \
  ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./bootstrap.sh" \
  -exec sed -i "s|__BASE_PATH__|$PROJECT_NAME|g" {} +

# Set theme
sed -i "s|@import \"./themes/[^\"]*\";|@import \"./themes/$THEME_FILE.css\";|" src/index.css

# Handle deploy target
if [ "$DEPLOY_TARGET" = "2" ]; then
  # Vercel only — remove GitHub Pages workflow, set base to /
  rm -f .github/workflows/deploy.yml
  sed -i "s|/$PROJECT_NAME/|/|g" vite.config.ts
elif [ "$DEPLOY_TARGET" = "3" ]; then
  # Both — keep everything as-is
  :
fi
# Deploy target 1 (Pages only) — keep everything as-is, vercel.json won't hurt

echo ""
echo "✓ Configuration complete!"
echo ""
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run dev"
echo "  3. Start building!"
echo ""
echo "Deploy:"
if [ "$DEPLOY_TARGET" != "2" ]; then
  echo "  GitHub Pages: Push to main → auto-deploys via Actions"
  echo "    → Set up: Settings → Pages → Source: GitHub Actions"
fi
if [ "$DEPLOY_TARGET" != "1" ]; then
  echo "  Vercel: Connect repo at vercel.com/new"
fi
echo ""
echo "Cloudflare Workers:"
echo "  cd workers/gamma-proxy && npx wrangler deploy"
echo "  cd workers/github-proxy && npx wrangler deploy"
echo "  Set secrets: npx wrangler secret put GAMMA_API_KEY"
echo "               npx wrangler secret put GITHUB_PAT"
echo ""

# Self-delete
rm -- "$0"
echo "(bootstrap.sh has been removed — it's no longer needed)"
