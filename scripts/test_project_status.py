#!/usr/bin/env python3
"""Tests for the planning bundle's status helper, not tests of the future website."""
from __future__ import annotations
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import project_status as status

def make_fixture():
    """Isolated synthetic task graph; tests must still pass as real work progresses."""
    milestones = [{"id": f"M{i:02d}", "title": f"Test milestone {i}"} for i in range(20)]
    tasks = []
    for milestone in milestones:
        for number in range(1, 7):
            task_id = f"{milestone['id']}-{number:02d}"
            tasks.append({
                "id": task_id, "milestone": milestone["id"], "title": f"Test task {task_id}",
                "status": "todo", "depends_on": [tasks[-1]["id"]] if tasks else [],
                "kind": "implementation", "evidence": [], "blocker": None, "notes": []
            })
    return {"schema_version": 1, "project": "Synthetic status test", "current_task": None,
            "implementation_state": "not_started", "milestones": milestones, "tasks": tasks}


class StatusTests(unittest.TestCase):
    def setUp(self):
        self.data = make_fixture()

    def test_initial_plan_valid(self):
        self.assertEqual(status.validate(self.data), [])
        self.assertEqual(len(self.data['tasks']), 120)
        self.assertEqual(len(self.data['milestones']), 20)

    def test_no_fabricated_progress(self):
        result = status.summarize(self.data)
        self.assertEqual(result['counts']['done'], 0)
        self.assertEqual(result['ready'][0]['id'], 'M00-01')

    def test_milestone_filter(self):
        self.assertEqual(status.summarize(self.data, 'M12')['total'], 6)
        with self.assertRaises(ValueError):
            status.summarize(self.data, 'M99')

    def test_done_requires_evidence(self):
        self.data['tasks'][0]['status'] = 'done'
        self.assertTrue(any('ohne Nachweis' in e for e in status.validate(self.data)))

    def test_unknown_dependency(self):
        self.data['tasks'][0]['depends_on'] = ['M99-99']
        self.assertTrue(any('unbekannte Abhängigkeit' in e for e in status.validate(self.data)))

    def test_cycle(self):
        self.data['tasks'][0]['depends_on'] = ['M00-02']
        self.assertTrue(any('Zyklische' in e for e in status.validate(self.data)))

    def test_blocker_required(self):
        self.data['tasks'][0]['status'] = 'blocked'
        self.assertTrue(any('Blocker benötigt' in e for e in status.validate(self.data)))

    def test_valid_completed_task(self):
        first=self.data['tasks'][0]
        first['status']='done'
        first['evidence']=[{'description':'Synthetic unit test only','reference':'test-fixture','verified_at':'2026-09-06'}]
        self.assertEqual(status.validate(self.data), [])

    def test_cli_json(self):
        with tempfile.TemporaryDirectory() as directory:
            manifest = Path(directory)/"tasks.json"
            manifest.write_text(json.dumps(self.data), encoding="utf-8")
            p = subprocess.run(
                [sys.executable, str(Path(status.__file__)), "--file", str(manifest),
                 "--json", "--milestone", "M08"], capture_output=True, text=True, check=False
            )
            self.assertEqual(p.returncode, 0, p.stderr)
            self.assertEqual(json.loads(p.stdout)["total"], 6)

    def test_multiple_active_tasks_rejected(self):
        self.data['tasks'][0]['status']='in_progress'
        self.data['tasks'][1]['status']='in_progress'
        self.assertTrue(any('Mehr als eine' in e for e in status.validate(self.data)))

    def test_current_task_must_be_known(self):
        self.data['current_task'] = 'M99-99'
        self.assertTrue(any('current_task ist unbekannt' in e for e in status.validate(self.data)))

    def test_current_task_must_be_in_progress(self):
        self.data['current_task'] = self.data['tasks'][0]['id']
        self.assertTrue(any('in_progress-Aufgabe' in e for e in status.validate(self.data)))

    def test_current_task_must_match_active_task(self):
        self.data['tasks'][0]['status'] = 'in_progress'
        self.data['current_task'] = None
        self.assertTrue(any('stimmt nicht' in e for e in status.validate(self.data)))

    def test_done_needs_complete_evidence_fields(self):
        first = self.data['tasks'][0]
        first['status'] = 'done'
        first['evidence'] = [{'description': 'Synthetic', 'reference': 'test-fixture'}]
        self.assertTrue(any('verified_at' in e for e in status.validate(self.data)))

    def test_done_despite_unfinished_dependency(self):
        second = self.data['tasks'][1]
        second['status'] = 'done'
        second['evidence'] = [{'description': 'Synthetic', 'reference': 'f', 'verified_at': '2026-09-06'}]
        self.assertTrue(any('nicht erledigter Abhängigkeit' in e for e in status.validate(self.data)))

    def test_deferred_needs_reason(self):
        self.data['tasks'][0]['status'] = 'deferred'
        self.assertTrue(any('deferred benötigt' in e for e in status.validate(self.data)))

    def test_validate_cli_exits_nonzero_on_invalid_manifest(self):
        self.data['tasks'][0]['status'] = 'done'
        with tempfile.TemporaryDirectory() as directory:
            manifest = Path(directory) / "tasks.json"
            manifest.write_text(json.dumps(self.data), encoding="utf-8")
            p = subprocess.run(
                [sys.executable, str(Path(status.__file__)), "--file", str(manifest), "--validate"],
                capture_output=True, text=True, check=False,
            )
            self.assertNotEqual(p.returncode, 0)


class TaskUpdateTests(unittest.TestCase):
    """Das Schreibwerkzeug darf keinen unbelegten Fortschritt erzeugen."""

    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        root = Path(self.directory.name)
        (root / "project").mkdir()
        (root / "scripts").mkdir()
        self.manifest = root / "project" / "tasks.json"
        self.manifest.write_text(json.dumps(make_fixture()), encoding="utf-8")
        self.tool = root / "scripts" / "task_update.py"
        self.tool.write_bytes((Path(status.__file__).parent / "task_update.py").read_bytes())

    def run_tool(self, *args):
        return subprocess.run(
            [sys.executable, str(self.tool), *args], capture_output=True, text=True, check=False
        )

    def read(self):
        return json.loads(self.manifest.read_text(encoding="utf-8"))

    def test_done_without_evidence_is_refused(self):
        result = self.run_tool("M00-01", "--status", "done")
        self.assertEqual(result.returncode, 2)
        self.assertEqual(self.read()["tasks"][0]["status"], "todo")

    def test_blocked_without_reason_is_refused(self):
        result = self.run_tool("M00-01", "--status", "blocked")
        self.assertEqual(result.returncode, 2)

    def test_existing_evidence_is_appended_not_replaced(self):
        for reference in ("erster-nachweis", "zweiter-nachweis"):
            result = self.run_tool(
                "M00-01", "--status", "done", "--evidence", "Synthetisch",
                "--reference", reference, "--verified-at", "2026-09-06",
            )
            self.assertEqual(result.returncode, 0, result.stderr)
        evidence = self.read()["tasks"][0]["evidence"]
        self.assertEqual([e["reference"] for e in evidence], ["erster-nachweis", "zweiter-nachweis"])

    def test_implementation_state_follows_actual_tasks(self):
        self.assertEqual(self.read()["implementation_state"], "not_started")
        self.run_tool("M00-01", "--status", "in_progress", "--current")
        self.assertEqual(self.read()["implementation_state"], "in_progress")
        self.assertEqual(self.read()["current_task"], "M00-01")

    def test_unknown_task_is_refused(self):
        self.assertEqual(self.run_tool("M99-99", "--status", "todo").returncode, 2)


if __name__ == '__main__':
    unittest.main(verbosity=2)
