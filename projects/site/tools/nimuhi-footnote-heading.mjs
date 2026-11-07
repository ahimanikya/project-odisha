// Scope the visible source heading to the approved reference article.
export default function nimuhiFootnoteHeading({fileURL}) {
  if (!fileURL?.pathname.includes('/content/dongariya/') && !['/culture/essential-odia-dhaga.md', '/culture/odia-dhaga.md', '/stories/buddhist-triangle/diamond-triangle.md', '/stories/buddhist-triangle/lalitgiri.md', '/stories/buddhist-triangle/udayagiri.md', '/stories/buddhist-triangle/ratnagiri.md', '/culture/sashisena-and-nimuhi-temple.md', '/culture/odia-cultural-identity.md', '/culture/rise-children-of-utkal.md', '/culture/a-place-to-learn-together.md', '/stories/bhubaneswar-week.md'].some(path => fileURL?.pathname.endsWith(path))) return null;
  return {
    name: 'nimuhi-footnote-heading',
    after(root, ctx) {
      if (!fileURL?.pathname.includes('/content/dongariya/')) return;
      const nodes = [...root.children];
      const start = nodes.findIndex(n => n.tagName === 'h2' && (n.properties?.id === 'footnotes-and-sources' || n.children?.map(c => c.value || '').join('') === 'Footnotes and sources'));
      const section = nodes.find(n => n.tagName === 'section' && n.children?.some(c => c.properties?.id === 'footnote-label'));
      if (start < 0 || !section) return;
      let end = start + 1;
      while (end < nodes.length && nodes[end].tagName !== 'h2' && nodes[end] !== section) end++;
      const credits = nodes.slice(start + 1, end);
      const headingIndex = section.children.findIndex(n => n.properties?.id === 'footnote-label');
      const children = [...section.children];
      children.splice(headingIndex + 1, 0,
        {type:'element', tagName:'span', properties:{id:'footnotes-and-sources'}, children:[]}, ...credits);
      const updated = nodes.filter((_, i) => i < start || i >= end).map(n => n === section ? {...section, children} : n);
      ctx.replaceNode(root, {...root, children:updated});
    },
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
