"""Bounded alias validation, including spoofed/unsafe destination regressions."""
import sys
from pathlib import Path
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cinema_redirects import expected_canonical, REDIRECTS, ORIGIN, TEAM

class RedirectChecks(unittest.TestCase):
    def nodes(self, target):
        return [('meta', {'http-equiv': 'refresh', 'content': '0;url=' + target}),
                ('meta', {'name': 'robots', 'content': 'noindex, nofollow'}),
                ('a', {'href': target})]

    def test_all_three_exact_destinations(self):
        for route, target in REDIRECTS.items():
            for value in (target, ORIGIN + target):
                self.assertEqual(expected_canonical(route, self.nodes(value)), (ORIGIN + TEAM, []))

    def test_ordinary_page_remains_self_canonical_even_with_refresh(self):
        self.assertEqual(expected_canonical('/cinema/daman/', self.nodes(TEAM)),
                         (ORIGIN + '/cinema/daman/', []))

    def test_invalid_refresh_destinations(self):
        route, target = next(iter(REDIRECTS.items()))
        for value in ['https://evil.invalid' + target, '//projectodisha.org' + target,
                      '/cinema/../cinema/daman-team/#vishal-mourya',
                      '/cinema/%64aman-team/#vishal-mourya', TEAM + '#deependra-samal',
                      TEAM + '?x=1#vishal-mourya', 'https://x@projectodisha.org' + target,
                      'http://projectodisha.org' + target]:
            with self.subTest(value=value):
                self.assertTrue(expected_canonical(route, self.nodes(value))[1])

    def test_missing_duplicate_or_delayed_refresh_rejected(self):
        route, target = next(iter(REDIRECTS.items()))
        nodes = self.nodes(target)
        for changed in [nodes[1:], nodes + nodes[:1],
                        [('meta', {'http-equiv': 'refresh', 'content': '5;url=' + target})] + nodes[1:]]:
            self.assertTrue(expected_canonical(route, changed)[1])

    def test_noindex_and_visible_fallback_required(self):
        route, target = next(iter(REDIRECTS.items()))
        for value in ['index, follow', 'noindex, follow', '']:
            nodes = self.nodes(target); nodes[1][1]['content'] = value
            self.assertTrue(expected_canonical(route, nodes)[1])
        for link in [None, {'href': target, 'hidden': ''}, {'href': TEAM},
                     {'href': target, 'aria-hidden': 'true'}]:
            nodes = self.nodes(target)[:2]
            if link is not None: nodes.append(('a', link))
            self.assertTrue(expected_canonical(route, nodes)[1])

if __name__ == '__main__': unittest.main()
