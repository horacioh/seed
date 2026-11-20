#!/usr/bin/env bash
# Recreates Coolify services with freshly pulled images, so stacks that follow a rolling tag
# (ghcr.io/horacioh/seed-*:main) pick up the build that was just pushed.
#
# A plain `/deploy` of a running service keeps the image it already has; only a restart with
# `latest=true` pulls the tag again.
#
# Env: COOLIFY_URL (e.g. https://coolify.example.com), COOLIFY_API_TOKEN (deploy permission),
# COOLIFY_SERVICES (space- or comma-separated service UUIDs). Skips with a notice when any is unset.
set -euo pipefail

if [[ -z "${COOLIFY_URL:-}" || -z "${COOLIFY_API_TOKEN:-}" || -z "${COOLIFY_SERVICES:-}" ]]; then
  echo "::notice::Coolify redeploy skipped: set the COOLIFY_URL and service-UUID repository variables and the COOLIFY_API_TOKEN secret."
  exit 0
fi

for uuid in ${COOLIFY_SERVICES//,/ }; do
  echo "Restarting Coolify service $uuid with latest images"
  curl -fsS --retry 3 -X POST \
    -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
    -H 'Accept: application/json' \
    "${COOLIFY_URL%/}/api/v1/services/$uuid/restart?latest=true"
  echo
done
