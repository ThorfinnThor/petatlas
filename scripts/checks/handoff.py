#!/usr/bin/env python3
"""M02-06 — Prüft, ob der Handoff eine frische Sitzung korrekt weiterführt.

Eine neue Sitzung liest CLAUDE.md, docs/STATUS.md, docs/HANDOFF.md und das
Manifest. Sie darf daraus denselben nächsten Schritt ableiten wie das
Aufgabenmanifest. Dieser Check vergleicht beides maschinell, damit ein
veralteter Handoff auffällt, bevor jemand ihm folgt.

Ausführen: python3 scripts/checks/handoff.py
Exit 0 = konsistent, 1 = Abweichung.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import project_status as status  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
TASK_ID = re.compile(r"\bM\d{2}-\d{2}\b")


def main() -> int:
    data = status.load_manifest(ROOT / "project" / "tasks.json")
    errors = status.validate(data)
    if errors:
        print("Manifest ist nicht konsistent; Handoff kann nicht geprüft werden:")
        for error in errors:
            print(f"  {error}")
        return 1

    actionable = {task["id"] for task in status.summarize(data)["ready"]}
    active = {t["id"] for t in data["tasks"] if t.get("status") == "in_progress"}
    expected = active or actionable

    handoff = (ROOT / "docs" / "HANDOFF.md").read_text(encoding="utf-8")
    mentioned = set(TASK_ID.findall(handoff))

    problems: list[str] = []
    if not expected & mentioned:
        problems.append(
            "docs/HANDOFF.md nennt keine der ausführbaren Aufgaben "
            f"({', '.join(sorted(expected)) or 'keine'})."
        )

    done = {t["id"] for t in data["tasks"] if t.get("status") == "done"}
    stale = {
        task_id
        for task_id in mentioned & done
        if re.search(rf"[Nn]ächster ausführbarer Schritt.*{task_id}", handoff, re.S | re.M)
        and task_id not in expected
    }
    if stale:
        problems.append(
            f"docs/HANDOFF.md nennt als nächsten Schritt bereits erledigte Aufgaben: {', '.join(sorted(stale))}."
        )

    for required in ("## Tatsächlicher Zustand", "## Nächster ausführbarer Schritt"):
        if required not in handoff:
            problems.append(f"docs/HANDOFF.md fehlt der Abschnitt '{required}'.")

    if problems:
        print("Handoff-Prüfung fehlgeschlagen:")
        for problem in problems:
            print(f"  {problem}")
        return 1

    print(
        "Handoff konsistent: nennt "
        f"{', '.join(sorted(expected & mentioned))} von {len(expected)} ausführbaren Aufgabe(n)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
