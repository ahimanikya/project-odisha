"""Meaningful packing checks for the explicitly authorized long-reading exception."""
import unittest
from reportlab.platypus import Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from build_print import pack_reading_units

class LongReadingLayoutTests(unittest.TestCase):
    def test_new_art_encoding_preserves_old_bytes_and_dimensions(self):
        from build_print import print_raster_bytes
        from PIL import Image as Raster
        from io import BytesIO
        from pathlib import Path
        root=Path(__file__).parent
        for number,quality in [(301,90),(302,80)]:
            src=root/'assets'/f'pod-dhaga-{number:03}-v1.png'
            before=src.read_bytes()
            im=Raster.open(src).convert('RGB');im.thumbnail((1400,1000))
            expected=BytesIO();im.save(expected,format='JPEG',quality=quality)
            actual=print_raster_bytes(src,f'POD-DHAGA-{number:03}').getvalue()
            self.assertEqual(actual,expected.getvalue())
            self.assertEqual(Raster.open(BytesIO(actual)).size,im.size)
            self.assertEqual(src.read_bytes(),before)

    def unit(self,ident,height=100):
        return {'id':ident,'chapter':'A','unit':([Spacer(1,height)],None,None)}
    def test_variant_card_keeps_wording_without_notes_or_source_locator(self):
        from build_print import variant_reading_blocks
        variant={'odia':'ଓଡ଼ିଆ\nବିକଳ୍ପ','note':'Editorial interpretation retained internally.',
                 'source_id':'source-1','locator':'Page 9'}
        blocks=variant_reading_blocks('Chapter','POD-DHAGA-056',1,variant,lambda text,style:(text,style))
        self.assertEqual(blocks,[('Chapter · Dhaga 056 · Variant 1','label'),('ଓଡ଼ିଆ\nବିକଳ୍ପ','saying')])
        self.assertEqual(variant['note'],'Editorial interpretation retained internally.')

    def test_variant_explanations_preserve_bilingual_meaning_and_limits(self):
        import json
        from pathlib import Path
        from build_print import variant_explanation, VARIANT_EXPLANATION_END, VARIANT_EXPLANATION_EXTRA, VARIANT_SHORT_EXPLANATIONS
        entries=json.loads((Path(__file__).parent/'collection.json').read_text())['entries']
        retained=[]
        for entry in entries:
            for number,variant in enumerate(entry.get('variants',[]),1):
                text=variant_explanation(entry['id'],number,variant)
                if not text: continue
                key=(entry['id'].rsplit('-',1)[1],number)
                if key in VARIANT_SHORT_EXPLANATIONS:
                    expected=' '.join(VARIANT_SHORT_EXPLANATIONS[key])
                    if key==('103',1):
                        expected=expected.replace('proposition this Incubator','proposition. This Incubator')
                    if key==('156',1):
                        expected=expected.replace('Not a new count, animal fact','Not an animal fact').replace('help. this Incubator','help. This Incubator')
                        self.assertNotIn('new count',text)
                    self.assertEqual(text,expected)
                    continue
                retained.append((entry['id'].rsplit('-',1)[1],number))
                self.assertIn('Literal',text)
                self.assertTrue('ଅର୍ଥ:' in text or 'Odia meaning:' in text)
                self.assertTrue('Explanation:' in text or 'Interpretive reading:' in text)
                self.assertNotIn('Source quotation',text)
                self.assertNotIn('inspected17November2026',text)
                key=retained[-1]
                if key in VARIANT_EXPLANATION_EXTRA:
                    self.assertIn(VARIANT_EXPLANATION_EXTRA[key],text)
        self.assertEqual(set(retained),set(VARIANT_EXPLANATION_END))
        self.assertEqual(len(retained),14)

    def test_book550_primary_and_uploaded_variant_remain_distinct(self):
        import json
        from pathlib import Path
        from build_print import variant_reading_blocks
        entry=json.loads((Path(__file__).parent/'entries/POD-DHAGA-550.json').read_text())
        self.assertEqual(len(entry['odia'].splitlines()),3)
        self.assertIn('ତାଟି କିଳା ଭାତ ଖାଇବି ନାହିଁ',entry['odia'])
        variant=entry['variants'][0]
        self.assertEqual(len(variant['odia'].splitlines()),4)
        self.assertIn('ତାଟି କିଳା ମାଡ଼ ସହିବି ନାଇଁ',variant['odia'])
        blocks=variant_reading_blocks('Chapter',entry['id'],1,variant,lambda text,style:(text,style))
        self.assertEqual(blocks[1][0],variant['odia'])
        rendered=' '.join(text for text,style in blocks)
        self.assertIn('ଅର୍ଥ:',rendered)
        self.assertIn('Explanation:',rendered)
        self.assertNotIn('Source:',rendered)
        self.assertNotIn(variant['locator'],rendered)

    def test_long516_uses_dedicated_width_without_reducing_type(self):
        _,_,packing=pack_reading_units([self.unit('POD-DHAGA-516')],200,420,600)
        self.assertEqual(packing[0]['layout'],'full-width')
        self.assertEqual(packing[0]['text_scale_factor'],1)

    def test_variant_gets_full_width_without_changing_primary(self):
        items=[self.unit('POD-DHAGA-034'),self.unit('POD-DHAGA-034-variant-1')]
        items[1]['variant_reading']=True
        _,_,packing=pack_reading_units(items,200,420,600)
        self.assertEqual([i['layout'] for i in packing],['two-column','full-width'])
        self.assertEqual(packing[1]['text_scale_factor'],1)

    def test_long_credit_continues_without_clipping(self):
        from build_print import pack_credit_blocks,unit_height
        style=ParagraphStyle('credit',fontSize=8,leading=11)
        pages=pack_credit_blocks([([Paragraph('Unique source locator. '*500,style)],None,None)],200,600,100)
        self.assertGreater(len(pages),1)
        joined=''.join(''.join(getattr(frag,'words',[])) or getattr(frag,'text','') for page in pages for item in page for frag in item['unit'][0][0].frags)
        self.assertEqual(''.join(joined.split()),''.join(('Unique source locator. '*500).split()))
        for n,page in enumerate(pages):
            limit=500 if n==0 else 600
            for item in page:self.assertLessEqual(item['top']+unit_height(item['unit'],200),limit)

    def test_document_source_has_no_print_link(self):
        from build_print import print_source_citation
        document={'kind':'document','title':'Uploaded <work>'}
        self.assertEqual(print_source_citation(document,document['title']),'Uploaded &lt;work&gt; · User-supplied document; not publicly hosted')
        self.assertEqual(print_source_citation({'url':'https://example.org'},'Web & title'),'<link href="https://example.org">Web &amp; title</link>')

    def test_exception_flushes_and_resumes_without_overlap(self):
        units=[self.unit('POD-DHAGA-198'),self.unit('POD-DHAGA-204'),self.unit('POD-DHAGA-206'),self.unit('POD-DHAGA-201')]
        pages,chapters,packing=pack_reading_units(units,200,420,600)
        self.assertEqual([[i['id'] for i in p] for p in pages],[[u['id']] for u in units])
        self.assertEqual([x['page'] for x in packing],[4,5,6,7])
        self.assertEqual(packing[1]['layout'],'full-width')
        self.assertEqual(packing[1]['measured_width_pt'],420)
        self.assertEqual(packing[2]['layout'],'full-width')
        self.assertEqual(packing[3]['column'],0)
        for page in pages:
            for item in page:self.assertGreaterEqual(item['top'],0);self.assertLessEqual(item['top']+item['height'],600);self.assertEqual(item['text_scale_factor'],1)
    def test_width_reflows_text_without_font_reduction(self):
        style=ParagraphStyle('test',fontSize=10.5,leading=14)
        para=Paragraph('Measured prose with meaningful words. '*60,style)
        h_narrow=para.wrap(200,10000)[1];h_wide=para.wrap(420,10000)[1]
        self.assertGreater(h_narrow,h_wide)
        item={'id':'POD-DHAGA-200','chapter':'A','unit':([para],None,None)}
        pages,_,packing=pack_reading_units([item],200,420,h_wide+1)
        self.assertEqual(packing[0]['height'],h_wide);self.assertEqual(style.fontSize,10.5)
    def test_unapproved_overflow_and_wide_overflow_fail_closed(self):
        for ident in ['POD-DHAGA-198','POD-DHAGA-200']:
            with self.assertRaisesRegex(ValueError,'exceeds column'):
                pack_reading_units([self.unit(ident,601)],200,420,600)

if __name__=='__main__':unittest.main()
