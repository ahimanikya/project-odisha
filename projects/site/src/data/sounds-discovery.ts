import odissiMusic from '../../../../kb/research/culture/odissi-music-website.json';
import dhuduki from '../../../../kb/research/culture/dhuduki-website.json';
import prahladaNataka from '../../../../kb/research/culture/prahlada-nataka-website.json';
import dandaNata from '../../../../kb/research/culture/danda-nata-website.json';
import chaitiGhoda from '../../../../kb/research/culture/chaiti-ghoda-website.json';
import ranapa from '../../../../kb/research/culture/ranapa-website.json';
import mahuri from '../../../../kb/research/culture/mahuri-website.json';
import ghumura from '../../../../kb/research/culture/ghumura-website.json';
import kendara from '../../../../kb/research/culture/kendara-website.json';
import boatSongs from '../../../../kb/research/culture/boat-songs-website.json';
import chilikaListening from '../../../../kb/research/culture/chilika-listening-website.json';
import craftListening from '../../../../kb/research/culture/craft-listening-website.json';
import lullabies from '../../../../kb/research/culture/odia-lullabies-website.json';
import config from '../../../../kb/research/product/sounds-discovery.json';
import collection from '../../../../kb/research/culture/sounds-website.json';
import huluhuli from '../../../../kb/research/culture/huluhuli-website.json';
import sankha from '../../../../kb/research/culture/sankha-website.json';
import mardala from '../../../../kb/research/culture/mardala-website.json';
import dalkhai from '../../../../kb/research/culture/dalkhai-website.json';
import daskathia from '../../../../kb/research/culture/daskathia-website.json';
import ghanta_ghanti from '../../../../kb/research/culture/ghanta-ghanti-website.json';
import pala from '../../../../kb/research/culture/pala-website.json';
import dhemsa from '../../../../kb/research/culture/dhemsa-website.json';
import gotipua from '../../../../kb/research/culture/gotipua-website.json';
import notebook from '../../../../kb/research/culture/listening-notebook.json';

const stories = {'odissi-music': odissiMusic, dhuduki, 'prahlada-nataka': prahladaNataka, 'danda-nata': dandaNata, 'chaiti-ghoda': chaitiGhoda, 'ranapa': ranapa, 'mahuri': mahuri, 'ghumura': ghumura, 'kendara': kendara, 'boat-songs': boatSongs, 'chilika-listening': chilikaListening, 'craft-listening': craftListening, 'odia-lullabies': lullabies, 'collection': collection, 'huluhuli': huluhuli, 'sankha': sankha, 'mardala': mardala, 'dalkhai': dalkhai, 'daskathia': daskathia, 'ghanta-ghanti': ghanta_ghanti, 'pala': pala, 'dhemsa': dhemsa, 'gotipua': gotipua, 'notebook': notebook};
// Read titles and introductions from the published story records.
export const soundDiscoveryEntries = config.entries.map(entry => ({
 label: stories[entry.id].title, dek: stories[entry.id].lead,
 category: 'Living culture', href: entry.href, regions: entry.regions
}));
