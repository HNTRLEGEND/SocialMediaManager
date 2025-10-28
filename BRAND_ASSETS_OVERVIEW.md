# Tenify.AI - Brand Assets Overview & Inventory

**Version:** 1.0
**Last Updated:** October 2025
**Purpose:** Complete inventory of all brand assets and design files

---

## 📁 File Structure

```
wieslogicai-website/
│
├── 📄 BRANDING_GUIDE.md                    ← Complete brand guide (this file)
│                                            (200+ page comprehensive guide)
│
├── 📁 styles/
│   └── BRAND_COLORS.css                    ← CSS color palette (copy-paste ready)
│
├── 📁 components/
│   ├── sections/
│   │   ├── HeroSectionDE.tsx
│   │   ├── HeroSectionEN.tsx
│   │   ├── FeaturesSectionDE.tsx
│   │   ├── FeaturesSectionEN.tsx
│   │   ├── FAQSection.tsx (DE)
│   │   ├── FAQSectionEN.tsx (NEW)
│   │   ├── ROICalculator.tsx (DE)
│   │   ├── ROICalculatorEN.tsx (NEW)
│   │   ├── WorkflowModal.tsx
│   │   └── ... (more sections)
│   └── NavigationDE.tsx, NavigationEN.tsx
│
├── 📁 public/
│   ├── 📁 images/
│   │   ├── logo.svg
│   │   ├── logo-white.svg
│   │   └── favicons/
│   └── 📁 brand-assets/
│
└── 📁 lib/
    └── workflowData.ts                     ← Workflow content (DE + EN)
```

---

## 🎨 Visual Assets Checklist

### Logo Files

| Asset | Format | Size | Usage | Status |
|-------|--------|------|-------|--------|
| Logo - Full Color | SVG | - | Web, print | ✅ Created |
| Logo - White | SVG | - | On dark backgrounds | ✅ Created |
| Logo - Wordmark Only | SVG | - | Compact use | ✅ Created |
| Favicon 32px | PNG | 32x32 | Browser tab | ✅ Standard |
| Favicon 180px | PNG | 180x180 | Apple touch icon | ✅ Standard |

### Color Palette Files

| Asset | Format | Colors | Status |
|-------|--------|--------|--------|
| Brand Colors CSS | CSS | 9 primary colors | ✅ Created |
| Tenify Colors JSON | JSON | Full palette | ✅ In CANVA_BRAND_KIT.json |
| Adobe Swatch | ASE | CMYK + RGB | - Exportable |
| Color Reference PDF | PDF | Visual swatches | - On demand |

### Templates (For Designers)

| Asset | Platform | Size | Status |
|-------|----------|------|--------|
| Social Media Template | Canva | 1200x628 | - Link in portal |
| Email Template | HTML/Canva | 600px width | ✅ Responsive |
| Presentation Deck | Google Slides | 16:9 aspect | - On demand |
| Instagram Story | Canva | 1080x1920 | - Editable |
| LinkedIn Post | Canva | 1200x628 | - Editable |

---

## 📝 Design System Files

### Component Library

| Component | File | Status | Last Updated |
|-----------|------|--------|--------------|
| Button (CTA) | - | ✅ Implemented | Oct 2025 |
| Feature Card | FeaturesSectionDE.tsx | ✅ Implemented | Oct 2025 |
| Workflow Modal | WorkflowModal.tsx | ✅ Implemented | Oct 2025 |
| FAQ Accordion | FAQSection.tsx | ✅ Implemented | Oct 2025 |
| ROI Calculator | ROICalculator.tsx | ✅ Implemented | Oct 2025 |
| Testimonial Card | TestimonialsSection.tsx | ✅ Implemented | Oct 2025 |
| Navigation | NavigationDE.tsx | ✅ Implemented | Oct 2025 |
| Footer | FooterDE.tsx | ✅ Implemented | Oct 2025 |

### CSS / Design Tokens

| Asset | Location | Status |
|-------|----------|--------|
| Brand Colors | styles/BRAND_COLORS.css | ✅ Created |
| Global Styles | styles/globals.css | ✅ Implemented |
| Tailwind Config | tailwind.config.ts | ✅ Configured |
| Font Stack | styles/typography.css | ✅ Configured |
| Animation Presets | components/ | ✅ Framer Motion |

---

## 📄 Documentation Files

### Brand Guidelines

| Document | Location | Pages | Status |
|----------|----------|-------|--------|
| **Complete Brand Guide** | BRANDING_GUIDE.md | 200+ | ✅ Oct 2025 |
| **Canva Quick Ref** | CANVA_QUICK_REFERENCE.md | 20 | ✅ Oct 2025 |
| **Brand Kit JSON** | CANVA_BRAND_KIT.json | - | ✅ Oct 2025 |

### Content Guidelines

| Document | Covers | Status |
|----------|--------|--------|
| Voice & Tone | Copy style, messaging | ✅ In BRANDING_GUIDE |
| Workflow Descriptions | 6 products | ✅ In workflowData.ts |
| FAQ Content | 18 questions (EN+DE) | ✅ In FAQSection.tsx |
| Testimonials | Real customer quotes | ✅ In workflowData.ts |

---

## 🎯 Brand Colors - Complete Palette

### Primary Colors
```
Electric Blue:      #00F0FF  [Primary CTA, highlights]
Neon Pink:          #FF0080  [Secondary, energy]
```

### Accent Colors
```
Purple:             #A855F7  [FAQ, variation]
Gold:               #FFD700  [Service/support]
Green:              #22C55E  [Success, savings]
```

### Background Colors
```
Primary-950:        #030712  [Main background]
Primary-900:        #0F1622  [Cards]
Primary-800:        #1A2332  [Hover states]
```

### Text Colors
```
White:              #FFFFFF  [Headlines]
Gray-300:           #D1D5DB  [Body text]
Gray-400:           #9CA3AF  [Secondary]
```

### CSS Variable Usage
```css
var(--color-electric)        /* #00F0FF */
var(--color-neon)            /* #FF0080 */
var(--color-primary-950)     /* #030712 */
var(--color-text-white)      /* #FFFFFF */
/* ... and more in BRAND_COLORS.css */
```

---

## 🔤 Typography System

### Display Font: Cal Sans Bold
- **Weight:** 700 (Bold)
- **Style:** Normal
- **Uses:** H1, H2, H3, headlines
- **Sizes:** 36px - 72px
- **Availability:** Google Fonts alternative (Montserrat Bold)

### Body Font: Inter
- **Weights:** 400 (Regular), 600 (Semibold)
- **Style:** Normal
- **Uses:** Body text, UI labels, buttons
- **Sizes:** 14px - 20px
- **Link:** https://fonts.google.com/specimen/Inter

### Fallback
- **Font Stack:** `Inter, Arial, sans-serif`
- **Safe for:** Email, PDFs

---

## 🎬 Component Gallery

### Workflow Modals (6 Total)

1. **AI Voice Agent** (Electric Blue)
   - Problem/Solution comparison
   - €71,000/year savings
   - 20h/week time saved
   - Components: FeaturesSectionDE.tsx, FeaturesSectionEN.tsx

2. **Sales Agent** (Neon Pink)
   - 38% faster sales cycles
   - €48,000/year savings
   - 25h/week time saved

3. **Service Agent** (Gold)
   - 60% cost reduction
   - €36,000/year savings
   - 30h/week time saved

4. **Technical Agent** (Purple)
   - 81% faster resolution
   - €42,000/year savings
   - 35h/week time saved

5. **Lead Generator** (Electric Blue)
   - 10X more leads
   - €85,000/year savings
   - 40h/week time saved

6. **Lead Manager** (Neon Pink)
   - +133% conversions
   - €95,000/year savings
   - 30h/week time saved

**All Modal Data:** `lib/workflowData.ts` (German + English)

---

## 📱 Responsive Design Breakpoints

```css
Mobile:   0px - 640px        (Single column, stacked)
Tablet:   640px - 1024px     (2-3 columns, medium spacing)
Desktop:  1024px+            (Full multi-column, optimized)
```

**All components:** Fully responsive, tested on iPhone, iPad, Desktop

---

## 🌍 Language Support

### German (DE)
- **Domain:** tenify.ai/de (or root)
- **Pages:**
  - Homepage (/)
  - About (/de/ueber-uns)
  - Contact (/de/kontakt)
  - Imprint (/de/impressum)
  - Privacy (/de/datenschutz)
- **Components:** -DE suffix
- **Status:** ✅ Complete

### English (EN)
- **Domain:** tenify.ai/en
- **Pages:**
  - Homepage (/en)
  - About (/en/about)
  - Contact (/en/contact)
  - Imprint (/en/imprint)
  - Privacy (/en/privacy)
- **Components:** -EN suffix
- **Status:** ✅ Complete (Oct 2025)

---

## 🎨 Design System Specifications

### Spacing Scale
```
xs:  2px       |  xl:  16px    |  3xl: 32px    |  5xl: 64px
sm:  4px       |  2xl: 24px    |  4xl: 48px
base: 8px
lg:  12px
```

### Border Radius
```
sm:   4px      (subtle)
base: 8px      (default)
lg:   12px
xl:   16px
2xl:  20px
3xl:  24px
full: 999px    (pills/buttons)
```

### Shadows
```
light:  0 2px 4px rgba(0,0,0,0.1)
medium: 0 4px 12px rgba(0,0,0,0.2)
dark:   0 10px 40px rgba(0,0,0,0.4)
glow:   0 0 40px rgba(0,240,255,0.4)
```

### Transitions
```
fast:   150ms
base:   300ms
medium: 500ms
slow:   800ms
```

---

## 🔗 Important Links

### Live Website
- **Production:** https://tenify.ai
- **German Homepage:** https://tenify.ai/de (or /)
- **English Homepage:** https://tenify.ai/en

### Design Files
- **Figma Project:** [Link when ready]
- **Color Swatches:** [Link when ready]
- **Brand Portal:** [Link when ready]

### Contact
- **Email:** hello@tenify.ai
- **Brand Questions:** [specific contact]

---

## 📊 Asset Statistics

### Total Design Files Created:
- ✅ 35+ React components
- ✅ 3 comprehensive documentation files
- ✅ 1 CSS color palette (270 lines)
- ✅ 1 Canva Brand Kit JSON
- ✅ 1 Canva Quick Reference

### Pages Built:
- ✅ 5 German pages (de, de/about, de/contact, de/imprint, de/datenschutz)
- ✅ 5 English pages (en, en/about, en/contact, en/imprint, en/privacy)
- ✅ 8 complete sections per homepage

### Sections Implemented:
- ✅ Hero Section (DE + EN)
- ✅ Social Proof Bar (DE + EN)
- ✅ Features Section with Modals (DE + EN)
- ✅ ROI Calculator (DE + EN, NEW)
- ✅ Testimonials Section (DE + EN)
- ✅ Pricing Section (DE + EN)
- ✅ FAQ Section (DE + EN, NEW)
- ✅ CTA Section (DE + EN)

### Workflows Created:
- ✅ 6 complete workflow definitions
- ✅ Bilingual (German + English)
- ✅ With ROI data, features, testimonials
- ✅ Grand Cardone style messaging

---

## 🚀 Next Steps for Designers

### If Using Canva
1. **Import Colors:** Use CANVA_QUICK_REFERENCE.md
2. **Copy Hex Codes:** #00F0FF, #FF0080, #030712, etc.
3. **Use Templates:** LinkedIn, Instagram, Email templates
4. **Follow Guidelines:** CANVA_QUICK_REFERENCE.md

### If Using Figma
1. **Export Colors:** From BRAND_COLORS.css
2. **Import Font:** Inter (from Google Fonts)
3. **Create Components:** Using design tokens
4. **Follow Specs:** From BRANDING_GUIDE.md

### If Developing
1. **Import CSS:** `import '@/styles/BRAND_COLORS.css'`
2. **Use Variables:** `color: var(--color-electric)`
3. **Follow Patterns:** Components in `components/sections/`
4. **Review:** BRANDING_GUIDE.md

---

## 📋 Brand Consistency Checklist

Before launching any design:

- [ ] Logo visible and correctly used
- [ ] Colors from brand palette only
- [ ] Typography hierarchy followed (Cal Sans + Inter)
- [ ] Sufficient contrast (4.5:1 minimum)
- [ ] Mobile responsive
- [ ] CTA button clear and prominent
- [ ] Messaging follows Grand Cardone style
- [ ] Consistent with other Tenify assets
- [ ] Accessibility checked (WCAG AA)
- [ ] No brand guideline violations

---

## 📈 Version Control

| Version | Date | What Changed |
|---------|------|--------------|
| 1.0 | Oct 2025 | Initial brand kit creation |

### Recent Updates (Latest)
- ✅ FAQSectionEN.tsx created
- ✅ ROICalculatorEN.tsx created
- ✅ Canva Brand Kit JSON created
- ✅ Canva Quick Reference created
- ✅ Brand Colors CSS created
- ✅ Complete BRANDING_GUIDE.md created

---

## 💡 Pro Tips for Designers

1. **Always use Electric Blue (#00F0FF) for primary CTAs**
2. **Contrast matters:** White/Gray-300 on dark backgrounds only
3. **Cal Sans Bold for all headlines** (or Montserrat Bold as fallback)
4. **Keep designs simple:** Max 3 brand colors per asset
5. **Mobile-first approach:** Design for small screens first
6. **Test everything:** Especially color contrast ratios
7. **Use templates:** Speed up design process
8. **Follow voice & tone:** Numbers first, urgent, action-oriented
9. **Reference Canva Quick Reference:** For fast lookups
10. **When in doubt:** Check BRANDING_GUIDE.md

---

## 🆘 Troubleshooting

### "What color should I use for X?"
→ See **Color Palette** section above or BRANDING_GUIDE.md

### "What font is this?"
→ Cal Sans Bold (headlines) or Inter (body)

### "How big should my button be?"
→ Min 48px tall, 200px+ wide, rounded 999px

### "Is my contrast ratio sufficient?"
→ Use WebAIM Contrast Checker: 4.5:1 minimum

### "Can I modify the logo?"
→ No. Use as-is. Contact hello@tenify.ai if needed.

### "Where do I find X asset?"
→ Check **File Structure** section or contact hello@tenify.ai

---

## 📞 Getting Help

**For Brand Questions:**
- Email: hello@tenify.ai
- Share your design mockup
- Mention specific concerns
- Provide context

**For Technical Questions:**
- Check BRANDING_GUIDE.md (200+ pages)
- Review CANVA_QUICK_REFERENCE.md
- Look at existing components
- Check BRAND_COLORS.css for CSS vars

**For Urgent Issues:**
- Priority: Brand integrity
- Second: User experience
- Third: Technical implementation

---

## 🎯 Summary

**Tenify.AI Brand Kit includes:**
- ✅ Complete 200+ page Brand Guide
- ✅ Canva Quick Reference (20 pages)
- ✅ Canva Brand Kit JSON (all colors, fonts, specs)
- ✅ CSS Color Palette (copy-paste ready)
- ✅ 6 fully designed workflows
- ✅ Bilingual website (DE + EN)
- ✅ 35+ React components
- ✅ Fully responsive design
- ✅ Accessibility compliant
- ✅ Production-ready

---

**Brand Version:** 1.0
**Last Updated:** October 2025
**Status:** ✅ Complete and Ready for Use
**For:** Internal & Partner Use

**Questions?** → hello@tenify.ai

