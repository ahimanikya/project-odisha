from revise_narratives import revise,R,manifest
import re,json

def para(slug,start):
 s=(R/next(a['source'] for a in manifest['articles'] if a['slug']==slug)).read_text(); matches=[p for p in (s.splitlines() if start.startswith('[^') else s.split('\n\n')) if p.startswith(start)];assert len(matches)==1,(slug,start);return matches[0]
def swap(slug,start,new,reason):revise(slug,[(para(slug,start),new)],reason=reason)

revise('daman',[
(para('daman','Producer [Deependra Samal]'),'Producer [Deependra Samal](../../people/deependra-samal.md), co-director [Vishal Mourya](../../people/vishal-mourya.md) and co-director and editor [Debi Prasad Lenka](../../people/debi-prasad-lenka.md) brought different responsibilities to the film.[^producer-credit][^catalogue]'),
(para('daman','The National Film Awards catalogue places'),'The catalogue sets the story in 2015: a young doctor takes up a posting in Malkangiri and commits himself to tackling malaria.[^catalogue] Babushaan Mohanty plays the doctor; Dipanwit Dashmohapatra plays the pharmacist.[^trade]'),
('The award catalogue credits Pratap Rout for cinematography and Debi Prasad Lenka for editing.[^making][^catalogue]','Pratap Rout handled cinematography.[^making][^catalogue]'),
(para('daman','[^catalogue]:'),'[^catalogue]: [70th National Film Awards catalogue](https://nfaindia.org/images/pdf/70th%20National%20Film%20Award%20Catalogue.pdf), p. 082, synopsis and credits.')],reason='Reduce repeated source-process prose and editingcredit; retain 2015story/2017programme and limits on health evidence.')
revise('debi-prasad-lenka',[
('Lenka would help shape the film again as its co-director and editor.[^catalogue]','Lenka also edited *DAMaN*.[^catalogue]'),
('The National Film Awards catalogue describes Lenka’s work across corporate films, documentaries and government productions, including a television commercial for the 2018 Men’s Hockey World Cup.[^catalogue]','His earlier credits include corporate films, documentaries, government productions and a commercial for the 2018 Men’s Hockey World Cup.[^catalogue]'),
('The partnership carried into Odia cinema. *Biju Babu* preceded *DAMaN*, and the latter brought Lenka’s editing work into the same project as his shared direction.[^mentis][^catalogue]','The partnership carried into Odia cinema through *Biju Babu* and then *DAMaN*.[^mentis]'),
('The film Lenka co-directed and edited received Best Odia Film for 2022 at the 70th National Film Awards, announced in 2024.[^catalogue][^award]','*DAMaN* received Best Odia Film for 2022 at the 70th National Film Awards, announced in 2024.[^award]'),
(para('debi-prasad-lenka','[^catalogue]:'),'[^catalogue]: [70th National Film Awards catalogue](https://nfaindia.org/images/pdf/70th%20National%20Film%20Award%20Catalogue.pdf), pp. 082–083.')],reason='Retain distinctcareer/2018commercial/editing evidence withoutrepeatedcatalogue wording; award supportedindependentPIB.')
swap('reading-odia-cinema','The present catalogue contains','The present reading list identifies **14 cinema-focused entries and five related entries in life writing or tribute**, with the three broader works above kept separate. Editions and formats are not interchangeable: the two reported song compilations are listed separately, while a paperback and an ebook of the same text are not different works.','Entries are not all physically inspected volumes; correct unit, keepscope and edition limits.')
revise('commercial-successes',[
(para('commercial-successes','Pabaar’s inclusion'),'Pabaar’s inclusion comes from the same Pinkvilla comparison that supplied the DAMaN and Karma lifetime figures. The tracker entry for *Mantra Muugdha* remains a research lead; its authenticity disclaimer leaves it outside this comparison.[^commercial-mantra]'),
('| Mantra Muugdha | Not established | ₹4.27 crore gross; ₹3.74 crore net | Tracker updated 4 October 2026 | **Low confidence:** Ollypedia says figures are approximate, may differ greatly from producers’ figures, and does not claim authenticity.[^commercial-mantra] |\n','')],reason='E04: remove lowconfidence tracker amount from comparison, retainnamedlead andsource; detailedoldfigurespreservedinKBbaseline.')

# Retain only note definitions still used by each article. Do not touch image metadata or creator/licence text.
for slug in ['pranab-patnaik','odia-cinema','sabyasachi-mohapatra']:
 p=R/next(a['source'] for a in manifest['articles'] if a['slug']==slug);s=p.read_text();defs=re.findall(r'^\[\^([^\]]+)\]:.*$',s,re.M);unused=[k for k in defs if len(re.findall(r'\[\^'+re.escape(k)+r'\]',s))==1]
 if unused:revise(slug,[(re.search(r'^\[\^'+re.escape(k)+r'\]:.*\n?',s,re.M)[0],'') for k in unused],reason='Remove unused source notes after prose consolidation; evidence retained in auditbaseline.')
