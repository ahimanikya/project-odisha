const sections = [
 ['/global-connections/', 'Global Connections'],
 ['/languages/', 'Languages of Odisha'], ['/literature/', 'Odia literature'],
 ['/crafts/', 'Crafts of Odisha'], ['/textiles/', 'Woven in Odisha'],
 ['/food/', 'Food & flavours'], ['/destinations/', 'Destinations'],
];
const cinemaPeople = new Set(['/people/bijaya-jena/', '/people/bijay-mishra/', '/people/manglu-charan-biswal/', '/people/kanhu-charan-mohanty/', '/people/tapu-mishra/', '/people/pranab-patnaik/', '/people/prafulla-kar/', '/people/kalindi-charan-panigrahi/', '/people/basanta-kumari-patnaik/', '/people/gopal-chhotray/', '/people/akshaya-mohanty/', '/people/surya-deo/', '/people/nirad-mohapatra/', '/people/sabyasachi-mohapatra/', '/people/ak-bir/', '/people/gour-prasad-ghose/', '/people/deependra-samal/', '/people/vishal-mourya/', '/people/debi-prasad-lenka/', '/people/anupam-patnaik/']);
export function pageContext(path, title) {
 const section = (cinemaPeople.has(path) ? ['/cinema/', 'Odia cinema'] : null) || (path === '/knowledge/kotpad/' ? ['/textiles/', 'Woven in Odisha'] : null) || (path === '/people/subhas-chandra-bose/' ? ['/destinations/cuttack/', 'Cuttack'] : null) || sections.find(([href]) => path.startsWith(href))
  || (path.startsWith('/people/') ? sections.find(([href])=>href==='/literature/') : null)
  || (['/knowledge/chilika/', '/knowledge/konark/'].includes(path) ? sections.find(([href])=>href==='/destinations/') : null);
 if (!section) return [];
 return [{href:'/explore/',label:'Explore'}, ...(section[0] === path ? [] : [{href:section[0],label:section[1]}]), {href:path,label:title,current:true}];
}
// A page's existing, credited image is preferred. A script SVG is not converted
// into a social image, and a missing portrait never receives a substitute face.
export function sharingImage(image) {
 if (image?.src?.startsWith('/') && /\.(?:png|jpe?g|webp)$/i.test(image.src) && image.alt && image.width && image.height) return image;
 return {src:'/assets/coast-natural-fallback-v2.png',alt:'Project Odisha brand illustration: two people tending a wooden boat on an imagined Odisha-inspired shore, not a documentary view of this subject.',width:1536,height:1024};
}
