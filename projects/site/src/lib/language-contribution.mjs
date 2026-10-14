// A draft link only: opening it never submits an issue or uploads a recording.
export function languageContributionURL(language = '') {
 const body = [
  'Language / preferred name: ' + language,
  'Local variety and broad locality (no private address):',
  '',
  'Proposal: correction, reading recommendation, story, or recording idea?',
  'Page URL and what should change:',
  '',
  'Source / edition / page, or firsthand context (label memories and uncertainty):',
  'Speaker, author or teller’s chosen public credit:',
  '',
  'For a recording proposal: publicly shareable link, recording date, language/variety, transcript, separate translation and translator credit:',
  'Permission from the speaker and other rights holders; permitted public uses and any restrictions:',
  'Who can review the language and local context?',
  '',
  'This issue becomes public only when you submit it on GitHub. Do not include private contact details, consent documents, restricted knowledge or unapproved recordings. Public availability is not permission to reuse. Editorial review and Founder approval are required before encyclopedia publication.'
 ].join('\n');
 return 'https://github.com/ahimanikya/project-odisha/issues/new?' + new URLSearchParams({title: '[Language] ' + (language || 'Contribution proposal'), body});
}
