#!/usr/bin/env python3
"""Regression checks for repository config versus portable KB boundaries."""
import copy
import json
import shutil
import tempfile
from pathlib import Path
import check_bundle
import registers

root = Path(__file__).resolve().parents[1]
config = json.loads((root/'utkal.config.json').read_text())
with tempfile.TemporaryDirectory() as temp:
    base = Path(temp)
    kb = base/'kb'
    shutil.copytree(root/'kb', kb)
    assert check_bundle.check(kb)['result'] == 'PASS'  # No config accompanies this export.
    assert check_bundle.check(kb, config)['result'] == 'PASS'
    # Root-relative article links are public routes, not filesystem paths.
    probe=kb/'public-route-probe.md'
    probe.write_text('---\ntype: Test\n---\n[Cinema](/cinema/odia-cinema/)\n')
    assert check_bundle.check(kb)['result']=='PASS'
    probe.write_text('---\ntype: Test\n---\n[Unknown](/not-a-declared-public-route/)\n')
    assert check_bundle.check(kb)['result']=='FAIL'
    probe.unlink()
    for field, value in [('prefix', 'BAD'), ('artifact_kind', 'unexpected'), ('record_directory', '../outside')]:
        bad = copy.deepcopy(config)
        bad[field] = value
        try:
            result = check_bundle.check(kb, bad)
            assert result['result'] == 'FAIL', field
        except (OSError, ValueError):
            pass
    try:
        registers.run(kb, True)
    except FileNotFoundError:
        pass
    else:
        raise AssertionError('Repository tooling accepted missing root config')
    (base/'utkal.config.json').write_text(json.dumps(config))
    registers.run(kb, True)
    (kb/'project.json').write_text(json.dumps(config))
    assert check_bundle.check(kb, config)['result'] == 'FAIL'
print('PASS: standalone KB; matching config; wrong prefix/kind/path; missing root config; config inside KB')
