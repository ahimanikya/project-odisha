import collection from '../../../../kb/research/stories/independent-features/collection.json';

export const independentFeatureCollection = collection;
export const independentFeatures = collection.articles;
const publicCategories: Record<string, string> = {
  food: 'Food',
  arts: 'Living culture',
  places: 'Places',
  nature: 'Nature and environment',
  history: 'History and heritage',
  economy: 'Economy, livelihoods and infrastructure'
};
export const independentFeatureDiscovery = [
  {
    label: collection.title,
    category: 'History and heritage',
    dek: collection.description,
    href: collection.href,
    regions: ['Across Odisha'],
    aliases: ['Odisha essays', 'Places, work and living traditions']
  },
  ...collection.articles.map(article => ({
    label: article.title,
    category: publicCategories[article.subject],
    dek: article.description,
    href: article.href,
    regions: article.regions,
    aliases: article.aliases
  }))
];
