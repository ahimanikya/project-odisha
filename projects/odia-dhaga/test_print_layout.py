"""Meaningful packing checks for the explicitly authorized long-reading exception."""
import unittest
from reportlab.platypus import Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from build_print import pack_reading_units

class LongReadingLayoutTests(unittest.TestCase):
    def unit(self,ident,height=100):
        return {'id':ident,'chapter':'A','unit':([Spacer(1,height)],None,None)}
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
