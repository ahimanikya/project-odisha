"""Pure reader-facing variant explanations shared by web and print."""

# Explicit reader projections avoid treating mixed research notes as expendable prose.
VARIANT_EXPLANATION_END = {
    ('034',1): ' Source:', ('064',1): ' Source:', ('092',1): ' Source:',
    ('099',1): ' Original uploaded final word', ('176',2): ' Rendered upload',
    ('231',1): ' Rendered page inspected', ('363',1): ' Locator:',
    ('376',1): ' Uploaded page31', ('403',1): ' Source:',
    ('406',1): ' Name reference:', ('461',1): ' Source:',
    ('483',1): ' Source:', ('486',1): ' Source:',
}
VARIANT_EXPLANATION_EXTRA = {
    ('034',1): 'Bamboo statement belongs to the proverbial image, without a universal biological claim.',
    ('376',1): 'The fruit-to-doom connection is unexplained; no debt or intentional evasion inferred.',
    ('406',1): 'Uploaded spelling retained without repair. No epic-origin claim.',
}

VARIANT_SHORT_EXPLANATIONS = {
    ('516', 1): ['ଏହି ପାଠ ପ୍ରତିଶ୍ରୁତିରୁ ଆରମ୍ଭ ହୋଇ ନ ଦେବା ଓ ମନା ମଧ୍ୟ ନ କରିବାକୁ କଟାକ୍ଷ କରେ। This reading begins with the repeated promise; the book’s gloss identifies satire of a person who promises but does not give.'],
    ('516', 2): ['ଏହି ପାଠ ଆଚରଣର ଅସଙ୍ଗତିକୁ ପ୍ରଥମେ ରଖିଛି; ଶବ୍ଦକ୍ରମ ବଦଳିଲେ ମଧ୍ୟ ବ୍ୟଙ୍ଗର ଅର୍ଥ ସମାନ। This reading puts neither giving nor refusing first, then extends the repeated promise for as long as the moon and sun endure.'],
    ('011',1): ['Provisional normalized historical reading, not an exact diplomatic transcription.', 'Modern spacing supplied in normalized reading; old typography is faint.'],
    ('012',1): ['Provisional normalized historical reading, not an exact diplomatic transcription.', 'Distinguish historical ଆରେ from contemporary ଆଲୋ; exact historical spacing/punctuation not certified.'],
    ('143',1): ['Preserve କଞ୍ଚା/କଷା and ସଢ଼ା/ପଚା differences; no shared-origin inference.'],
    ('169',1): ['one underlying impossible-dimensions comparison'],
    ('260',1): ['Exact shorter source wording preserved; not substituted for the complete conditional primary quotation.'],
    ('009',1): ['Hunger is the explicit trigger here;009 uses medicine-related anger. Both bite the bowl.', 'Related image/application, not certified identical wording or complete meaning'],
    ('036',1): ['Different kinship/animal pairs but same substitution proposition; source explicitly connects aunt with care for motherless children.'],
    ('081',1): ['Cold’s great rage'],
    ('087',1): ['Same contrast with different first-clause wording'],
    ('103',1): ['Same local-variation/river-bend proposition', 'this Incubator item supplies wording without a gloss and does not independently support the existing explanatory narrative.'],
    ('156',1): ['Stroked/indulged dog urinates in the face versus existing156 help answered with urination. Same coarse animal-image complaint about kindness repaid by disrespect.', 'Not a new count, animal fact or rule about recipients of help.', 'this Incubator item supplies wording without a gloss and does not independently support the existing explanatory narrative.'],
    ('176',1): ['Editorial comparison only; no assertion that all sibling relationships are instrumental.'],
    ('178',1): ['Paired by the source with the same complete-destruction gloss; its separate literal image is not resolved here.'],
    ('187',1): ['Separately worded thematic parallel: visible marks versus concealed wrongdoing.', 'Source does not identify the marks, a religion, caste or actual person. Do not infer ritual details.'],
    ('195',1): ['Separately worded refusal parallel: declining provision and declining praise.'],
    ('222',1): ['Printed variant: “Among the ornaments, a neem twig has a place in the nose.” ଅଳଙ୍କାରମାନଙ୍କ ମଧ୍ୟରେ ନାକରେ ନିମକାଠିର ସ୍ଥାନ ଅଛି।'],
}

def variant_explanation(ident, number, variant):
    key=(ident.rsplit('-',1)[1],number)
    note=variant.get('note','')
    if key in VARIANT_SHORT_EXPLANATIONS:
        passages=VARIANT_SHORT_EXPLANATIONS[key]
        assert all(passage in note for passage in passages)
        text=' '.join(passages)
        if key==('103',1):
            text=text.replace('proposition this Incubator', 'proposition. This Incubator')
        if key==('156',1):
            text=text.replace('Not a new count, animal fact', 'Not an animal fact').replace('help. this Incubator', 'help. This Incubator')
        return text
    if key not in VARIANT_EXPLANATION_END:
        return ''
    start=note.index('Literal')
    end=note.index(VARIANT_EXPLANATION_END[key],start)
    explanation=note[start:end]
    if key==('231',1):
        prefix='Current wording specifies selling, not a free gift.'
        assert prefix in note
        explanation=prefix+' '+explanation
    if key in VARIANT_EXPLANATION_EXTRA:
        extra=VARIANT_EXPLANATION_EXTRA[key]
        assert extra in note
        explanation+=' '+extra
    return explanation

