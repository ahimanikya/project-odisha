import {allowsPage} from './edition';
import deomaliImage from '../../../../kb/research/destinations/deomali-image.json';

export const deomaliGuide = {
 title: 'Deomali',
 odia: 'ଦେଓମାଳୀ',
 summary: 'Grasslands, mountain views and a journey through Koraput’s high country.',
 href: '/destinations/deomali/',
 photo: deomaliImage,
 regions: ['Koraput'],
 aliases: ['Deomali Hills', 'Eastern Ghats', 'ଦେଓମାଳୀ'],
};

export const hillDestinationGuides = [deomaliGuide].filter(guide => allowsPage(guide.href));
