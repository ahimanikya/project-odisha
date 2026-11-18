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
