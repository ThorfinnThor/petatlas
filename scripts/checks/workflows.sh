#!/usr/bin/env bash
# Härtung der Workflow-Dateien.
#
# Diese Prüfungen liefen früher nur als Schritte in security.yml. Damit fielen
# sie erst nach dem Push auf, und der Prüfstand stand vier Commits lang auf rot,
# ohne dass es lokal sichtbar war. Deshalb sind sie hier als ein Skript
# zusammengefasst: `npm run check:workflows` läuft in der lokalen Prüfkette,
# und security.yml ruft dasselbe Skript auf. Ein Ergebnis, zwei Aufrufer.
#
# Das Skript braucht bewusst keine Abhängigkeiten, damit der Workflow-Job ohne
# Installation auskommt.
set -uo pipefail

verzeichnis="${1:-.github/workflows}"
fehler=0

melde() {
  echo "$1" >&2
  fehler=1
}

# Ein Tag lässt sich verschieben, ein Commit-SHA nicht. Ein ungepinnter
# Verweis ist der klassische Weg, fremden Code in einen Build zu bringen.
# Das Muster muss den Listenstrich mitnehmen: Schritte stehen als
# `- uses: ...` in der Datei. Ohne ihn traf die Prüfung keine einzige Zeile
# und war damit immer grün.
muster='^[[:space:]]*(-[[:space:]]+)?uses:[[:space:]]*[^[:space:]]+'
gefunden=$(grep -rhoE "$muster" "$verzeichnis" | wc -l | tr -d ' ')
if [ "$gefunden" -eq 0 ]; then
  melde "Keine einzige uses-Zeile gefunden; die Pin-Prüfung liefe ins Leere."
fi
ungepinnt=$(grep -rhoE "$muster" "$verzeichnis" \
  | sed -E 's/^[[:space:]]*(-[[:space:]]+)?uses:[[:space:]]*//' \
  | grep -vE '@[0-9a-f]{40}$' || true)
if [ -n "$ungepinnt" ]; then
  melde "Nicht auf einen Commit-SHA gepinnt:"
  melde "$ungepinnt"
fi

# pull_request_target läuft mit den Rechten des Zielrepos und hat Zugriff auf
# Secrets. Zusammen mit einem Checkout des PR-Codes ist das die bekannteste
# Rechteausweitung in GitHub Actions. Gesucht wird der Trigger selbst, also die
# Zeile am Zeilenanfang, nicht die Erwähnung in einem Kommentar.
if treffer=$(grep -rnE '^[[:space:]]{0,4}pull_request_target:' "$verzeichnis"); then
  melde "pull_request_target ist in diesem Repository nicht zugelassen:"
  melde "$treffer"
fi

# Ein Verweis auf ein Secret ist erklärungsbedürftig, nicht verboten.
# Erklärt und deshalb zugelassen ist genau einer:
#
#   GITHUB_TOKEN - kein hinterlegtes Secret, sondern ein pro Lauf neu
#   ausgestelltes Token, dessen Rechte der Workflow ausdrücklich setzt (siehe
#   die Berechtigungsprüfung unten). Es verlässt den Lauf nicht und steht
#   Forks nur lesend zur Verfügung.
#
#   CLOUDFLARE_DEPLOY_HOOK - die Adresse, die einen Build anstößt; ihr Token
#   steht im Pfad. Sie wird nur in rebuild-commerce.yml gesetzt, nur in einem
#   Lauf nach Zeitplan oder auf Zuruf, nie in einem Lauf, den ein fremder
#   Pull Request auslösen kann. scripts/publish/deploy-hook.ts schickt sie an
#   keinen anderen Host als api.cloudflare.com und protokolliert nur den
#   Ursprung, nie den Pfad.
#
# Jeder weitere Name muss hier bewusst eingetragen werden. Wer ein Secret
# ergänzt, ohne diese Liste anzufassen, bekommt einen roten Lauf - genau das
# ist der Zweck.
if unerklaert=$(grep -rnE '\$\{\{[[:space:]]*secrets\.' "$verzeichnis" \
  | grep -vE '\$\{\{[[:space:]]*secrets\.(GITHUB_TOKEN|CLOUDFLARE_DEPLOY_HOOK)[[:space:]]*\}\}'); then
  melde "Nicht erklärter Secret-Verweis; erklärt sind nur GITHUB_TOKEN und CLOUDFLARE_DEPLOY_HOOK:"
  melde "$unerklaert"
fi

# Ohne ausdrückliche Berechtigungen gilt die Voreinstellung des Repositories,
# und die kann sich ändern, ohne dass eine Datei angefasst wird.
for datei in "$verzeichnis"/*.yml; do
  [ -e "$datei" ] || continue
  if ! grep -q '^permissions:' "$datei"; then
    melde "$datei setzt keine permissions auf oberster Ebene."
  fi
done

if [ "$fehler" -ne 0 ]; then
  exit 1
fi

echo "Workflow-Härtung: Actions gepinnt, kein pull_request_target, nur erklärte Secrets, permissions gesetzt."
