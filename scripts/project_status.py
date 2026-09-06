#!/usr/bin/env python3
"""Read and validate project/tasks.json. Does not modify files or claim work is done."""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any

ALLOWED = {"todo", "in_progress", "blocked", "done", "deferred"}
DEFAULT = Path(__file__).resolve().parents[1] / "project" / "tasks.json"


def load_manifest(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Manifest kann nicht gelesen werden: {exc}") from exc
    if not isinstance(data, dict) or data.get("schema_version") != 1:
        raise ValueError("Erwartet wird ein Objekt mit schema_version=1.")
    if not isinstance(data.get("tasks"), list) or not data["tasks"]:
        raise ValueError("tasks muss eine nicht leere Liste sein.")
    return data


def validate(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    tasks = data.get("tasks", [])
    if any(not isinstance(t, dict) for t in tasks):
        return ["Jede Aufgabe muss ein Objekt sein."]
    ids = [t.get("id") for t in tasks]
    if any(not isinstance(i, str) or not i for i in ids):
        return ["Jede Aufgabe benötigt eine nicht leere String-ID."]
    if len(ids) != len(set(ids)):
        errors.append("Doppelte Aufgaben-IDs.")
    by_id = {t["id"]: t for t in tasks}
    mids = {m.get("id") for m in data.get("milestones", []) if isinstance(m, dict)}
    for t in tasks:
        tid = t["id"]
        if t.get("status") not in ALLOWED:
            errors.append(f"{tid}: ungültiger Status.")
        if t.get("milestone") not in mids:
            errors.append(f"{tid}: unbekannter Meilenstein.")
        deps = t.get("depends_on", [])
        if not isinstance(deps, list) or any(not isinstance(d, str) for d in deps):
            errors.append(f"{tid}: depends_on muss eine Liste von IDs sein.")
            continue
        for dep in deps:
            if dep not in by_id:
                errors.append(f"{tid}: unbekannte Abhängigkeit {dep}.")
            elif t.get("status") == "done" and by_id[dep].get("status") != "done":
                errors.append(f"{tid}: done trotz nicht erledigter Abhängigkeit {dep}.")
        if t.get("status") == "done":
            evidence = t.get("evidence")
            if not isinstance(evidence, list) or not evidence:
                errors.append(f"{tid}: done ohne Nachweis.")
            else:
                for e in evidence:
                    if not isinstance(e, dict) or not all(e.get(k) for k in ("description", "reference", "verified_at")):
                        errors.append(f"{tid}: Nachweis benötigt description, reference und verified_at.")
                        break
        if t.get("status") == "blocked":
            b = t.get("blocker")
            if not isinstance(b, dict) or not all(b.get(k) for k in ("reason", "required_action", "owner")):
                errors.append(f"{tid}: Blocker benötigt reason, required_action und owner.")
        if t.get("status") == "deferred" and not t.get("notes"):
            errors.append(f"{tid}: deferred benötigt dokumentierte Begründung/Freigabe in notes.")

    # Detect cycles; unknown/invalid dependency values already have their own errors.
    visiting: set[str] = set()
    visited: set[str] = set()
    def visit(tid: str) -> None:
        if tid in visited:
            return
        if tid in visiting:
            errors.append(f"Zyklische Abhängigkeit bei {tid}.")
            return
        visiting.add(tid)
        deps = by_id[tid].get("depends_on", [])
        if isinstance(deps, list):
            for dep in deps:
                if isinstance(dep, str) and dep in by_id:
                    visit(dep)
        visiting.remove(tid)
        visited.add(tid)
    for tid in by_id:
        visit(tid)
    active = [t["id"] for t in tasks if t.get("status") == "in_progress"]
    current = data.get("current_task")
    if len(active) > 1:
        errors.append("Mehr als eine koordinierende Hauptaufgabe ist in_progress.")
    if current is not None and current not in by_id:
        errors.append("current_task ist unbekannt.")
    elif current is not None and by_id[current].get("status") != "in_progress":
        errors.append("current_task muss eine in_progress-Aufgabe referenzieren.")
    if active and current != active[0]:
        errors.append("current_task stimmt nicht mit der aktiven Aufgabe überein.")
    return errors


def summarize(data: dict[str, Any], milestone: str | None = None) -> dict[str, Any]:
    all_tasks = data["tasks"]
    by_id = {t["id"]: t for t in all_tasks}
    tasks = [t for t in all_tasks if milestone is None or t["milestone"] == milestone]
    if milestone is not None and not tasks:
        raise ValueError(f"Unbekannter Meilenstein: {milestone}")
    counts = {s: 0 for s in sorted(ALLOWED)}
    counts.update(Counter(t["status"] for t in tasks))
    ready = [t for t in tasks if t["status"] == "todo" and all(by_id[d]["status"] == "done" for d in t["depends_on"])]
    rows = []
    for m in data["milestones"]:
        group = [t for t in tasks if t["milestone"] == m["id"]]
        if group:
            c = Counter(t["status"] for t in group)
            rows.append({"id": m["id"], "title": m["title"], "done": c["done"], "total": len(group),
                         "blocked": c["blocked"], "in_progress": c["in_progress"], "deferred": c["deferred"]})
    return {"project": data.get("project"), "implementation_state": data.get("implementation_state"),
            "current_task": data.get("current_task"), "filter": milestone,
            "total": len(tasks), "counts": counts, "milestones": rows,
            "ready": [{"id": t["id"], "title": t["title"]} for t in ready],
            "blocked": [{"id": t["id"], "title": t["title"], "blocker": t["blocker"]} for t in tasks if t["status"] == "blocked"],
            "external_gates_open": [t["id"] for t in tasks if t.get("kind") == "external_gate" and t["status"] != "done"],
            "tasks": tasks if milestone else []}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Arbeitsstand aus dem überprüfbaren Aufgabenmanifest lesen.")
    parser.add_argument("--file", type=Path, default=DEFAULT, help="Alternatives Aufgabenmanifest")
    parser.add_argument("--milestone", help="Beispiel: M08")
    parser.add_argument("--json", action="store_true", help="Maschinenlesbare Ausgabe")
    parser.add_argument("--validate", action="store_true", help="Nur Konsistenz prüfen")
    args = parser.parse_args(argv)
    try:
        data = load_manifest(args.file)
        errors = validate(data)
        if errors:
            raise ValueError("\n".join(errors))
        if args.validate:
            result = {"valid": True, "tasks": len(data["tasks"]), "milestones": len(data["milestones"])}
            print(json.dumps(result, ensure_ascii=False) if args.json else
                  f"Gültig: {result['tasks']} Aufgaben, {result['milestones']} Meilensteine; keine Konsistenzfehler.")
            return 0
        result = summarize(data, args.milestone)
    except (ValueError, KeyError, TypeError) as exc:
        if args.json:
            print(json.dumps({"valid": False, "error": str(exc)}, ensure_ascii=False))
        else:
            print(f"Fehler: {exc}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    c = result["counts"]
    print(f"{result['project']}\nAktuell: {result['current_task'] or 'keine Aufgabe begonnen'}")
    print(f"Erledigt: {c['done']}/{result['total']} | In Arbeit: {c['in_progress']} | Blockiert: {c['blocked']} | Zurückgestellt: {c['deferred']}")
    print("\nMeilensteine:")
    for m in result["milestones"]:
        print(f"  {m['id']}  {m['done']}/{m['total']}  {m['title']}" + (f" [blockiert: {m['blocked']}]" if m['blocked'] else ""))
    if args.milestone:
        print("\nTeilaufgaben:")
        for t in result["tasks"]:
            print(f"  {t['id']} [{t['status']}] {t['title']}")
            if t['evidence']:
                print(f"    Letzter Nachweis: {t['evidence'][-1].get('description')}")
    print("\nNächste ausführbare Aufgaben:")
    for task in result["ready"][:8]:
        print(f"  {task['id']} — {task['title']}")
    if not result["ready"]:
        print("  In dieser Auswahl ist keine neue Aufgabe ausführbar; Abhängigkeiten, aktive Aufgabe und Blocker prüfen.")
    for task in result["blocked"]:
        print(f"\nBlocker {task['id']}: {task['blocker']['reason']}\n  Benötigt: {task['blocker']['required_action']}")
    print("\nHinweis: Aufgabenfortschritt ist keine Zeitprognose und keine automatische Live-Freigabe.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
