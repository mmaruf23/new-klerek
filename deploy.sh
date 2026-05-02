#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"

# Load .env from project root
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
else
  echo "Error: .env not found at $ROOT_DIR/.env"
  exit 1
fi

# Validate required vars
required_vars=(
  VERCEL_TOKEN
  VERCEL_ORG_ID
  VERCEL_API_PROJECT_ID
  VERCEL_WEB_PROJECT_ID
)
for var in "${required_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "Error: $var is not set in .env"
    exit 1
  fi
done

# Check vercel CLI is installed
if ! command -v vercel &>/dev/null; then
  echo "Error: vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

# Deploy from monorepo root so pnpm can resolve workspace:* packages.
# Each Vercel project must have "Root Directory" set in project settings
# (apps/api or apps/web) so Vercel builds from the correct subdirectory.
deploy() {
  local name="$1"
  local project_id="$2"

  echo ""
  echo "==> Deploying $name..."
  VERCEL_ORG_ID="$VERCEL_ORG_ID" \
  VERCEL_PROJECT_ID="$project_id" \
  vercel deploy "$ROOT_DIR" --prod --yes --token="$VERCEL_TOKEN"
  echo "==> $name deployed."
}

TARGET="${1:-all}"

case "$TARGET" in
  api)
    deploy "apps/api" "$VERCEL_API_PROJECT_ID"
    ;;
  web)
    deploy "apps/web" "$VERCEL_WEB_PROJECT_ID"
    ;;
  all)
    deploy "apps/api" "$VERCEL_API_PROJECT_ID"
    deploy "apps/web" "$VERCEL_WEB_PROJECT_ID"
    ;;
  *)
    echo "Usage: $0 [api|web|all]"
    echo "  api  — deploy apps/api only"
    echo "  web  — deploy apps/web only"
    echo "  all  — deploy both (default)"
    exit 1
    ;;
esac

echo ""
echo "Done."
