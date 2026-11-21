import {allowsPage} from './edition';
import deomaliImage from '../../../../kb/research/destinations/deomali-image.json';
import daringbadiImage from '../../../../kb/research/destinations/daringbadi-image.json';

export const deomaliGuide = {
 title: 'Deomali',
 odia: 'ଦେଓମାଳୀ',
 summary: 'Grasslands, mountain views and a journey through Koraput’s high country.',
 href: '/destinations/deomali/',
 photo: deomaliImage,
 regions: ['Koraput'],
 aliases: ['Deomali Hills', 'Eastern Ghats', 'ଦେଓମାଳୀ'],
};

export const daringbadiGuide = {
 title: 'Daringbadi',
 odia: 'ଦାରିଙ୍ଗବାଡ଼ି',
 summary: 'Coffee, shade and hill views in Kandhamal.',
 href: '/destinations/daringbadi/',
 photo: daringbadiImage,
 regions: ['Kandhamal'],
 aliases: ['Daringibadi', 'ଦାରିଙ୍ଗବାଡ଼ି'],
};

export const hillDestinationGuides = [deomaliGuide,daringbadiGuide].filter(guide => allowsPage(guide.href));
