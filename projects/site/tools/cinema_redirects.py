"""Validate only the three reviewed DAMaN profile aliases; never general redirects."""
from urllib.parse import urlsplit

ORIGIN = 'https://projectodisha.org'
TEAM = '/cinema/daman-team/'
REDIRECTS = {
    '/people/vishal-mourya/': TEAM + '#vishal-mourya',
    '/people/debi-prasad-lenka/': TEAM + '#debi-prasad-lenka',
    '/people/deependra-samal/': TEAM + '#deependra-samal',
}


def expected_canonical(route, nodes):
    """Return canonical and validation errors without relaxing ordinary pages."""
    target = REDIRECTS.get(route)
    if target is None:
        return ORIGIN + route, []
    errors = []
    metas = [a for tag, a in nodes if tag == 'meta']
    refresh = [a.get('content', '') for a in metas
               if a.get('http-equiv', '').lower() == 'refresh']
    if len(refresh) != 1:
        errors.append('Approved alias needs exactly one immediate refresh')
    else:
        prefix, separator, raw = refresh[0].partition(';url=')
        try:
            parsed = urlsplit(raw)
        except ValueError:
            errors.append('Approved alias malformed refresh URL')
            return ORIGIN + TEAM, errors
        # Exact reviewed strings reject encoded paths, traversal, queries,
        # scheme-relative URLs, credentials and unreviewed person fragments.
        if (prefix != '0' or not separator
                or raw not in (target, ORIGIN + target)
                or parsed.query or parsed.username or parsed.password
                or (parsed.netloc and (parsed.scheme, parsed.netloc) != ('https', 'projectodisha.org'))):
            errors.append('Approved alias refresh destination mismatch')
    robots = [a.get('content') for a in metas if a.get('name') == 'robots']
    if robots != ['noindex, nofollow']:
        errors.append('Approved alias preview robots mismatch')
    if not any(tag == 'a' and a.get('href') in (target, ORIGIN + target)
               and 'hidden' not in a and a.get('aria-hidden') != 'true'
               for tag, a in nodes):
        errors.append('Approved alias visible fallback link missing')
    return ORIGIN + TEAM, errors
