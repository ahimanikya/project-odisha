import {allowsPage} from './edition';
import deomaliImage from '../../../../kb/research/destinations/deomali-image.json';
import daringbadiImage from '../../../../kb/research/destinations/daringbadi-image.json';
import putsilImage from '../../../../kb/research/destinations/putsil-image.json';
import mandasaruImage from '../../../../kb/research/destinations/mandasaru-image.json';
import mahendragiriImage from '../../../../kb/research/destinations/mahendragiri-image.json';
import taptapaniImage from '../../../../kb/research/destinations/taptapani-image.json';
import jirangChandragiriImage from '../../../../kb/research/destinations/jirang-chandragiri-image.json';
import panchalingeswarImage from '../../../../kb/research/destinations/panchalingeswar-image.json';
import kapilashImage from '../../../../kb/research/destinations/kapilash-image.json';
import belgharTumudibandhaImage from '../../../../kb/research/destinations/belghar-tumudibandha-image.json';
import kalingaGhatiImage from '../../../../kb/research/destinations/kalinga-ghati-image.json';
import gandhamardanImage from '../../../../kb/research/destinations/gandhamardan-image.json';

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

export const putsilGuide = {
 title: 'Putsil',
 odia: '',
 summary: 'A valley landscape in Koraput’s hills.',
 href: '/destinations/putsil/',
 photo: putsilImage,
 regions: ['Koraput'],
 aliases: ['Putsil Valley'],
};

export const mandasaruGuide = {
 title: 'Mandasaru',
 odia: '',
 summary: 'A gorge and its conservation story.',
 href: '/destinations/mandasaru/',
 photo: mandasaruImage,
 regions: ['Kandhamal'],
 aliases: ['Mandasaru Gorge'],
};

export const mahendragiriGuide = {
 title: 'Mahendragiri',
 odia: '',
 summary: 'Mountain shrines and forest life in Gajapati.',
 href: '/destinations/mahendragiri/',
 photo: mahendragiriImage,
 regions: ['Gajapati'],
 aliases: ['Mahendragiri Hills', 'Mahendra Giri'],
};

export const taptapaniGuide = {
 title: 'Taptapani',
 odia: '',
 summary: 'A hot spring and a place of worship in Ganjam’s wooded hills.',
 href: '/destinations/taptapani/',
 photo: taptapaniImage,
 regions: ['Ganjam'],
 aliases: ['Taptapani Hot Water Spring', 'Tapta Pani'],
};

export const jirangChandragiriGuide = {
 title: 'Jirang–Chandragiri',
 odia: '',
 summary: 'A monastery and Tibetan settlement history in Gajapati’s hills.',
 href: '/destinations/jirang-chandragiri/',
 photo: jirangChandragiriImage,
 regions: ['Gajapati'],
 aliases: ['Jirang', 'Jeerang', 'Jirango', 'Chandragiri', 'Padmasambhava Mahavihara', 'Rigon Thupten Mindrolling', 'Phuntsokling'],
};

export const panchalingeswarGuide = {
 title: 'Panchalingeswar',
 odia: '',
 summary: 'A hill shrine where flowing water covers five Shiva lingas.',
 href: '/destinations/panchalingeswar/',
 photo: panchalingeswarImage,
 regions: ['Balasore'],
 aliases: ['Panchalingeswar Temple', 'Panchalingeshwar', 'Panchalingeswara', 'Devagiri'],
};

export const kapilashGuide = {
 title: 'Kapilash',
 odia: '',
 summary: 'Chandrasekhar’s hill shrine and traces of an older temple.',
 href: '/destinations/kapilash/',
 photo: kapilashImage,
 regions: ['Dhenkanal'],
 aliases: ['Kapilas', 'Kapilash Temple', 'Chandrasekhar Temple'],
};

export const gandhamardanGuide = {
 title: 'Gandhamardan',
 odia: '',
 summary: 'Two pilgrimage approaches and a history of forest protection.',
 href: '/destinations/gandhamardan/',
 photo: gandhamardanImage,
 regions: ['Bargarh', 'Balangir'],
 aliases: ['Gandhamardan Hills', 'Gandhamardhan', 'Harishankar', 'Harisankar', 'Nrusinghanath'],
};

export const belgharTumudibandhaGuide = {
 title: 'Belghar–Tumudibandha',
 odia: '',
 summary: 'A forest destination within Tumudibandha block.',
 href: '/destinations/belghar-tumudibandha/',
 photo: belgharTumudibandhaImage,
 regions: ['Kandhamal'],
 aliases: [],
};

export const kalingaGhatiGuide = {
 title: 'Kalinga Ghati',
 odia: '',
 summary: 'A forested road between Ganjam and Kandhamal.',
 href: '/destinations/kalinga-ghati/',
 photo: kalingaGhatiImage,
 regions: ['Ganjam', 'Kandhamal'],
 aliases: ['Kalinga Ghat'],
};

export const hillDestinationGuides = [deomaliGuide,daringbadiGuide,putsilGuide,mandasaruGuide,mahendragiriGuide,taptapaniGuide,jirangChandragiriGuide,panchalingeswarGuide,kapilashGuide,gandhamardanGuide,belgharTumudibandhaGuide,kalingaGhatiGuide].filter(guide => allowsPage(guide.href));
