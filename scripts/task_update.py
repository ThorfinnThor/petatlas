#!/usr/bin/env python3
"""Aufgabenstatus in project/tasks.json ändern, ohne vorhandene Nachweise zu verlieren.

Das Manifest ist die einzige maschinenlesbare Statusquelle (M02-01). Dieses
Werkzeug schreibt ausschließlich `status`, `current_task`, angehängte
`evidence`-Einträge, `blocker` und `notes`. Es legt keine Aufgaben an, löscht
keine und überschreibt keinen bestehenden Nachweis.

Beispiele:
  python3 scripts/task_update.py M01-01 --status in_progress --current
  python3 scripts/task_update.py M01-01 --status done \\
      --evidence "Build erzeugt statisches HTML" --reference "dist/index.html" \\
      --verified-at 2026-09-06 --command "npm run build" --exit-code 0
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

MANIFEST = Path(__file__).resolve().parents[1] / "project" / "tasks.json"
ALLOWED = {"todo", "in_progress", "blocked", "done", "deferred"}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("task_id")
    ap.add_argument("--status", required=True, choices=sorted(ALLOWED))
    ap.add_argument("--current", action="store_true", help="Aufgabe als current_task setzen")
    ap.add_argument("--evidence", help="Beschreibung des tatsächlich erbrachten Nachweises")
    ap.add_argument("--reference", help="Datei, Commit oder Report zum Nachweis")
    ap.add_argument("--verified-at", help="Datum der Prüfung, ISO")
    ap.add_argument("--command", help="tatsächlich ausgeführter Befehl")
    ap.add_argument("--exit-code", type=int)
    ap.add_argument("--note", help="Zusatznotiz, wird angehängt")
    ap.add_argument("--blocker-reason")
    ap.add_argument("--blocker-action")
    ap.add_argument("--blocker-owner")
    args = ap.parse_args()

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    task = next((t for t in data["tasks"] if t.get("id") == args.task_id), None)
    if task is None:
        print(f"Unbekannte Aufgabe: {args.task_id}", file=sys.stderr)
        return 2

    if args.status == "done":
        has_new = bool(args.evidence and args.reference and args.verified_at)
        if not has_new and not task.get("evidence"):
            print("done benötigt --evidence, --reference und --verified-at.", file=sys.stderr)
            return 2
    if args.status == "blocked" and not all((args.blocker_reason, args.blocker_action, args.blocker_owner)):
        if not task.get("blocker"):
            print("blocked benötigt --blocker-reason, --blocker-action und --blocker-owner.", file=sys.stderr)
            return 2

    task["status"] = args.status

    if args.evidence:
        if not (args.reference and args.verified_at):
            print("--evidence benötigt --reference und --verified-at.", file=sys.stderr)
            return 2
        entry = {"description": args.evidence, "reference": args.reference, "verified_at": args.verified_at}
        if args.command:
            entry["command"] = args.command
        if args.exit_code is not None:
            entry["exit_code"] = args.exit_code
        # Anhängen, niemals ersetzen: alte Nachweise bleiben nachvollziehbar.
        task.setdefault("evidence", []).append(entry)

    if args.note:
        task.setdefault("notes", []).append(args.note)

    if args.blocker_reason:
        task["blocker"] = {
            "reason": args.blocker_reason,
            "required_action": args.blocker_action,
            "owner": args.blocker_owner,
        }
    elif args.status != "blocked":
        task["blocker"] = None

    if args.current:
        data["current_task"] = args.task_id
    elif data.get("current_task") == args.task_id and args.status != "in_progress":
        data["current_task"] = None

    MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{args.task_id} -> {args.status}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
