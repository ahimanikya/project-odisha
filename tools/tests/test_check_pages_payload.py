#!/usr/bin/env python3
"""Pages acceptance regressions; no network or build required."""
import contextlib
import io
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / 'check_pages_payload.py'
spec = importlib.util.spec_from_file_location('check_pages_payload', SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PagesPayloadTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'payload'
        self.root.mkdir()
        (self.root / 'index.html').write_bytes(b'ok')

    def refuses(self, text):
        with self.assertRaisesRegex(module.PayloadError, text):
            module.inspect_payload(self.root)

    def test_valid_nested_and_hidden_regular_files_are_counted(self):
        (self.root / 'assets').mkdir()
        (self.root / 'assets/x').write_bytes(b'12345')
        (self.root / '.nojekyll').write_bytes(b'')
        report = module.inspect_payload(self.root)
        self.assertEqual((report['regular_file_bytes'], report['regular_files'], report['directories']), (7, 3, 1))
        self.assertEqual(report['largest_files'][0], {'path': 'assets/x', 'bytes': 5})

    def test_missing_and_empty_index_refused(self):
        (self.root / 'index.html').unlink()
        self.refuses('nonempty root index')
        (self.root / 'index.html').touch()
        self.refuses('nonempty root index')

    def test_file_symlink_refused(self):
        (self.root / 'linked').symlink_to('index.html')
        self.refuses('Symbolic link')

    def test_directory_symlink_refused(self):
        outside = Path(self.temp.name) / 'outside'
        outside.mkdir()
        (self.root / 'linked').symlink_to(outside, target_is_directory=True)
        self.refuses('Symbolic link')

    def test_broken_symlink_refused(self):
        (self.root / 'broken').symlink_to('absent')
        self.refuses('Symbolic link')

    def test_root_symlink_refused(self):
        link = Path(self.temp.name) / 'root-link'
        link.symlink_to(self.root, target_is_directory=True)
        with self.assertRaisesRegex(module.PayloadError, 'real directory'):
            module.inspect_payload(link)

    def test_hardlink_to_outside_payload_refused(self):
        outside = Path(self.temp.name) / 'outside-file'
        outside.write_bytes(b'x')
        os.link(outside, self.root / 'hardlink')
        self.refuses('Hard-linked file')

    def test_fifo_refused_without_reading(self):
        os.mkfifo(self.root / 'pipe')
        self.refuses('Only regular files')

    def test_sparse_limit_and_aggregate_boundary(self):
        large = self.root / 'large'
        with large.open('wb') as stream:
            stream.truncate(module.MAX_BYTES - 3)
        self.assertEqual(module.inspect_payload(self.root)['regular_file_bytes'], module.MAX_BYTES - 1)
        with large.open('wb') as stream:
            stream.truncate(module.MAX_BYTES - 2)
        self.refuses('1 GB limit')

    def test_optimized_cli_refuses_without_mutating_files(self):
        (self.root / 'linked').symlink_to('index.html')
        result = subprocess.run([sys.executable, '-O', str(SCRIPT), str(self.root)], capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(json.loads(result.stdout)['status'], 'FAIL')
        self.assertTrue((self.root / 'linked').is_symlink())
        self.assertEqual((self.root / 'index.html').read_bytes(), b'ok')

    def test_cli_success_is_json(self):
        result = subprocess.run([sys.executable, str(SCRIPT), str(self.root)], capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(json.loads(result.stdout)['regular_file_bytes'], 2)


class FailureDiagnosticsTests(unittest.TestCase):
    def run_diagnostic(self, response=None, timeout=False):
        workflow = SCRIPT.parents[1] / '.github/workflows/publish-site.yml'
        text = workflow.read_text()
        script = text.split("          python3 - <<'PYTHON'\n", 1)[1].split('          PYTHON', 1)[0]
        script = '\n'.join(line[10:] for line in script.splitlines())
        output = io.StringIO()
        with patch.dict(os.environ, {'GITHUB_REPOSITORY': 'owner/repo', 'GITHUB_SHA': 'a' * 40, 'GITHUB_RUN_ID': '123', 'GH_TOKEN': 'SECRET_TOKEN'}), patch('subprocess.run') as run, contextlib.redirect_stdout(output):
            if timeout:
                run.side_effect = subprocess.TimeoutExpired('gh', 20)
            else:
                run.return_value = response
            exec(compile(script, '<workflow-diagnostic>', 'exec'), {})
        self.assertNotIn('SECRET', output.getvalue())
        return json.loads(output.getvalue()), run.call_args

    def test_blank_status_and_request_id_are_retained_without_secrets(self):
        response = subprocess.CompletedProcess([], 0, 'HTTP/2.0 200 OK\nX-GitHub-Request-Id: ABC-123\nAuthorization: SECRET_HEADER\n\n{"status":"","oidc":"SECRET_BODY"}', 'SECRET_STDERR')
        result, call = self.run_diagnostic(response)
        self.assertEqual(result['pages_status'], '')
        self.assertEqual(result['request_id'], 'ABC-123')
        self.assertEqual(call.kwargs['timeout'], 20)

    def test_api_error_is_recorded_without_body_or_stderr(self):
        response = subprocess.CompletedProcess([], 1, 'HTTP/2.0 403 Forbidden\nX-GitHub-Request-Id: DENIED\n\n{"message":"SECRET_BODY"}', 'SECRET_STDERR')
        result, _ = self.run_diagnostic(response)
        self.assertEqual(result['api_exit_code'], 1)
        self.assertIsNone(result['pages_status'])

    def test_diagnostic_timeout_is_bounded(self):
        result, _ = self.run_diagnostic(timeout=True)
        self.assertEqual(result['diagnostic_timeout_seconds'], 20)


if __name__ == '__main__':
    unittest.main()
