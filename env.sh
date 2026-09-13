#!/bin/bash
# Kelola environment variables project Vercel (apps/api & apps/web) dari CLI.
#
# Usage:
#   ./env.sh <api|web> list                      — tampilkan env di Vercel
#   ./env.sh <api|web> push [file]               — upload semua KEY=VALUE dari file (default: apps/<app>/.env.production)
#   ./env.sh <api|web> pull [file]               — download env Vercel ke file (default: apps/<app>/.env.production)
#   ./env.sh <api|web> set KEY VALUE             — set satu variabel (timpa jika sudah ada)
#   ./env.sh <api|web> rm KEY                    — hapus satu variabel
#
# Target environment Vercel diatur lewat VERCEL_ENV (default: production), contoh:
#   VERCEL_ENV=preview ./env.sh api push
#
# Kredensial (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_*_PROJECT_ID) dibaca dari .env di root — sama seperti deploy.sh.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"
VERCEL_ENV="${VERCEL_ENV:-production}"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
else
  echo "Error: .env not found at $ENV_FILE"
  exit 1
fi

required_vars=(VERCEL_TOKEN VERCEL_ORG_ID VERCEL_API_PROJECT_ID VERCEL_WEB_PROJECT_ID)
for var in "${required_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "Error: $var is not set in .env"
    exit 1
  fi
done

if ! command -v vercel &>/dev/null; then
  echo "Error: vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

usage() {
  sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
}

APP="${1:-}"
CMD="${2:-}"

case "$APP" in
  api) PROJECT_ID="$VERCEL_API_PROJECT_ID" ;;
  web) PROJECT_ID="$VERCEL_WEB_PROJECT_ID" ;;
  *) usage ;;
esac

APP_DIR="$ROOT_DIR/apps/$APP"
DEFAULT_FILE="$APP_DIR/.env.production"

# Semua perintah vercel dijalankan dengan project ID di env — tidak perlu `vercel link` / folder .vercel
vc() {
  VERCEL_ORG_ID="$VERCEL_ORG_ID" VERCEL_PROJECT_ID="$PROJECT_ID" \
    vercel "$@" --token="$VERCEL_TOKEN" --cwd "$APP_DIR"
}

# Hapus dulu jika ada (vercel env add menolak key yang sudah ada), lalu tambah.
set_var() {
  local key="$1" value="$2"
  vc env rm "$key" "$VERCEL_ENV" --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | vc env add "$key" "$VERCEL_ENV" >/dev/null
  echo "  ✔ $key"
}

case "$CMD" in
  list)
    vc env ls "$VERCEL_ENV"
    ;;

  push)
    FILE="${3:-$DEFAULT_FILE}"
    [ -f "$FILE" ] || { echo "Error: file not found: $FILE"; exit 1; }
    echo "==> Push $FILE → apps/$APP ($VERCEL_ENV)"
    while IFS= read -r line || [ -n "$line" ]; do
      # skip baris kosong & komentar
      [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
      key="${line%%=*}"
      value="${line#*=}"
      # buang tanda kutip pembungkus jika ada
      value="${value%\"}"; value="${value#\"}"
      value="${value%\'}"; value="${value#\'}"
      [ -n "$key" ] || continue
      set_var "$key" "$value"
    done < "$FILE"
    echo "==> Done. Redeploy agar perubahan aktif: make deploy-$APP"
    ;;

  pull)
    FILE="${3:-$DEFAULT_FILE}"
    echo "==> Pull apps/$APP ($VERCEL_ENV) → $FILE"
    vc env pull "$FILE" --environment "$VERCEL_ENV" --yes
    ;;

  set)
    [ $# -ge 4 ] || usage
    echo "==> Set $3 di apps/$APP ($VERCEL_ENV)"
    set_var "$3" "$4"
    echo "==> Redeploy agar perubahan aktif: make deploy-$APP"
    ;;

  rm)
    [ $# -ge 3 ] || usage
    echo "==> Hapus $3 dari apps/$APP ($VERCEL_ENV)"
    vc env rm "$3" "$VERCEL_ENV" --yes
    ;;

  *) usage ;;
esac
