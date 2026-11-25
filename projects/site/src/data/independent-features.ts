import collection from '../../../../kb/research/stories/independent-features/collection.json';
import images from '../../../../kb/research/stories/independent-features/images.json';

export interface IndependentFeatureImage {
  src: string; width: number; height: number; alt: string; caption: string;
  title: string; creator: string; source: string; license: string; license_url: string | null; changes: string; kind: string;
  small_src?: string; small_width?: number; small_height?: number; srcset?: string; fit?: 'contain' | 'cover';
}
const imageBySlug = images as Record<string, IndependentFeatureImage>;

export const independentFeatureCollection = collection;
export const independentFeatures = collection.articles.map(article => {
  const image = imageBySlug[article.slug];
  if (!image) throw Error(`Missing reviewed article image: ${article.slug}`);
  return {...article, image};
});
export const independentFeaturePreview = (image: IndependentFeatureImage): IndependentFeatureImage => {
  const preview = {...image, fit: 'contain' as const};
  return image.small_src && image.small_width && image.small_height
    ? {...preview, src: image.small_src, width: image.small_width, height: image.small_height, srcset: `${image.small_src} ${image.small_width}w, ${image.src} ${image.width}w`}
    : preview;
};
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
    aliases: ['Odisha essays', 'Places, work and living traditions'],
    image: independentFeaturePreview(independentFeatures[0].image)
  },
  ...independentFeatures.map(article => ({
    label: article.title,
    category: publicCategories[article.subject],
    dek: article.description,
    href: article.href,
    regions: article.regions,
    aliases: article.aliases,
    image: independentFeaturePreview(article.image)
  }))
];
