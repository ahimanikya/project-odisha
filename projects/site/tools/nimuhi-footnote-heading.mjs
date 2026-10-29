// Scope the visible source heading to the approved reference article.
export default function nimuhiFootnoteHeading({fileURL}) {
  if (!['/culture/essential-odia-dhaga.md', '/culture/odia-dhaga.md', '/stories/buddhist-triangle/diamond-triangle.md', '/stories/buddhist-triangle/lalitgiri.md', '/stories/buddhist-triangle/udayagiri.md', '/stories/buddhist-triangle/ratnagiri.md', '/culture/sashisena-and-nimuhi-temple.md', '/culture/odia-cultural-identity.md', '/culture/rise-children-of-utkal.md', '/culture/a-place-to-learn-together.md', '/stories/bhubaneswar-week.md'].some(path => fileURL?.pathname.endsWith(path))) return null;
  return {
    name: 'nimuhi-footnote-heading',
    element: {
      filter: ['h2', 'p'],
      visit(node, ctx) {
        if(['/culture/odia-dhaga.md','/culture/essential-odia-dhaga.md'].some(path=>fileURL?.pathname.endsWith(path)) && node.tagName==='p') {
          const children=node.children.flatMap(child=>child.type==='text'?child.value.split(/([\u0b00-\u0b7f][\u0b00-\u0b7f\s।,?!…]*)/g).filter(Boolean).map(value=>/^[\u0b00-\u0b7f]/.test(value)?{type:'element',tagName:'span',properties:{lang:'or'},children:[{type:'text',value}]}:{type:'text',value}):[child]);
          if(fileURL.pathname.endsWith('/culture/essential-odia-dhaga.md'))ctx.replaceNode(node,{...node,children});
          else node.children=children;
        }

        if (node.properties?.id === 'footnote-label') {
          ctx.replaceNode(node, {type:'element', tagName:'h2', properties:{...node.properties}, children:[{type:'text', value:'Footnotes & Sources'}]});
        }
      }
    }
  };
}
