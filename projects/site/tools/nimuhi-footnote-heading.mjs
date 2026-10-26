// Scope the visible source heading to the approved reference article.
export default function nimuhiFootnoteHeading({fileURL}) {
  if (!['/stories/buddhist-triangle/lalitgiri.md', '/stories/buddhist-triangle/udayagiri.md', '/stories/buddhist-triangle/ratnagiri.md', '/culture/sashisena-and-nimuhi-temple.md', '/culture/odia-cultural-identity.md', '/culture/rise-children-of-utkal.md', '/culture/a-place-to-learn-together.md', '/stories/bhubaneswar-week.md'].some(path => fileURL?.pathname.endsWith(path))) return null;
  return {
    name: 'nimuhi-footnote-heading',
    element: {
      filter: ['h2'],
      visit(node, ctx) {
        if (node.properties?.id === 'footnote-label') {
          ctx.replaceNode(node, {type:'element', tagName:'h2', properties:{...node.properties}, children:[{type:'text', value:'Footnotes & Sources'}]});
        }
      }
    }
  };
}
