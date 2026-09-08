#!/usr/bin/env bash
# scripts/prod-smoke.sh <base-url>
# Runs the full health-check battery a fresh Pitchora deploy should pass.
set -u
BASE="${1:-http://localhost:3011}"
FAIL=0

hr() { printf '\n%s\n' "════ $1 ════"; }
row() { # row <label> <expected> <actual>
  local label="$1" want="$2" got="$3"
  if [[ "$got" == "$want" ]]; then
    printf "  ✓  %-42s %s\n" "$label" "$got"
  else
    printf "  ✗  %-42s want=%s got=%s\n" "$label" "$want" "$got"
    FAIL=$((FAIL+1))
  fi
}
code() { curl -sk -o /dev/null -w '%{http_code}' "$1"; }

hr "1. Marketing routes"
for p in /presentiq /presentiq/pricing /presentiq/templates /presentiq/about /presentiq/changelog /presentiq/contact; do
  row "$p" 200 "$(code $BASE$p)"
done

hr "2. Auth pages"
row "/presentiq/dashboard" 200 "$(code $BASE/presentiq/dashboard)"
row "/presentiq/projects/new" 200 "$(code $BASE/presentiq/projects/new)"

hr "3. 404 handling (SEO poison guard)"
row "/presentiq/completely/bogus" 404 "$(code $BASE/presentiq/completely/bogus)"

hr "4. SEO / AIO / PWA endpoints"
row "/robots.txt" 200 "$(code $BASE/robots.txt)"
row "/sitemap.xml" 200 "$(code $BASE/sitemap.xml)"
row "/llms.txt" 200 "$(code $BASE/llms.txt)"
row "/manifest.webmanifest" 200 "$(code $BASE/manifest.webmanifest)"

hr "5. Icons (11 sizes)"
row "/icon.svg" 200 "$(code $BASE/icon.svg)"
for s in 48 72 96 144 192 256 384 512; do
  row "/icons/icon-${s}.png" 200 "$(code $BASE/icons/icon-${s}.png)"
done
row "/icons/icon-192-maskable.png" 200 "$(code $BASE/icons/icon-192-maskable.png)"
row "/icons/icon-512-maskable.png" 200 "$(code $BASE/icons/icon-512-maskable.png)"
row "/apple-icon.png (iOS 180×180)" 200 "$(code $BASE/apple-icon.png)"
row "/og-image.png (1200×630)" 200 "$(code $BASE/og-image.png)"

hr "6. TWA Digital Asset Links"
row "/.well-known/assetlinks.json" 200 "$(code $BASE/.well-known/assetlinks.json)"
ct=$(curl -sk -o /dev/null -w '%{content_type}' $BASE/.well-known/assetlinks.json | cut -d';' -f1)
if [[ "$ct" == "application/json" ]]; then printf "  ✓  %-42s %s\n" "assetlinks Content-Type" "$ct"; else printf "  ✗  %-42s got=%s\n" "assetlinks Content-Type" "$ct"; FAIL=$((FAIL+1)); fi

hr "7. Security headers on /presentiq"
hdrs=$(curl -skI $BASE/presentiq)
check_header() { # <header-name> <expected-substring>
  local h="$1" want="$2"
  local line=$(printf '%s' "$hdrs" | grep -i "^${h}:" | head -1)
  if printf '%s' "$line" | grep -qi "$want"; then
    printf "  ✓  %-42s %s\n" "$h" "$(printf '%s' "$line" | cut -c1-80)"
  else
    printf "  ✗  %-42s want~=%s\n" "$h" "$want"
    FAIL=$((FAIL+1))
  fi
}
check_header "Content-Security-Policy"          "default-src 'self'"
check_header "Strict-Transport-Security"        "max-age="
check_header "X-Frame-Options"                  "SAMEORIGIN"
check_header "X-Content-Type-Options"           "nosniff"
check_header "Referrer-Policy"                  "strict-origin"
check_header "Permissions-Policy"               "camera=()"
check_header "Cross-Origin-Opener-Policy"       "same-origin"
check_header "Cross-Origin-Resource-Policy"     "same-origin"

hr "8. API contract sanity"
r=$(curl -sk -X POST -H 'Content-Type: application/json' -d '{}' $BASE/api/presentiq/projects)
echo "  raw: $r" | head -c 220
echo
if echo "$r" | grep -q '"fields"' && ! echo "$r" | grep -q '"expected"'; then
  printf "  ✓  %-42s (sanitised, no Zod internals on the wire)\n" "POST /api/presentiq/projects {}"
else
  printf "  ✗  %-42s Zod internals leaking\n" "POST /api/presentiq/projects {}"
  FAIL=$((FAIL+1))
fi

hr "9. Perceived response time (median of 3)"
for path in / /presentiq /presentiq/pricing; do
  t=$(for _ in 1 2 3; do curl -sk -o /dev/null -w '%{time_total}\n' $BASE$path; done | sort -n | head -2 | tail -1)
  printf "  %-42s %ss\n" "$path" "$t"
done

echo
if [[ $FAIL -eq 0 ]]; then
  echo "════════════════════════════════════════"
  echo "  ✅  ALL CHECKS PASSED (base: $BASE)"
  echo "════════════════════════════════════════"
else
  echo "════════════════════════════════════════"
  echo "  ❌  $FAIL check(s) FAILED (base: $BASE)"
  echo "════════════════════════════════════════"
  exit 1
fi
