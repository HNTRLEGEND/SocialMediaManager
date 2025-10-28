# 🚀 WiesLogicAI Website - Next.js 14 + Framer Motion

> **A high-converting, Grant Cardone-inspired AI automation website built with Next.js 14, TailwindCSS, and Framer Motion.**

![WiesLogicAI](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-ff69b4?style=for-the-badge&logo=framer)

---

## 🎯 Project Overview

**WiesLogicAI** is a premium, conversion-optimized website for an AI automation company offering:
- 🎙️ **AI Voice Agents** - 24/7 conversational AI
- 🤖 **AI Service Agents** - Automated customer support
- 🧠 **AI Personal Assistants** - Digital executives
- ⚙️ **Process AI Workflows** - End-to-end automation

### 🔥 Key Features

✅ **Grant Cardone 10X Energy** - Bold, direct, high-converting design
✅ **Framer Motion Animations** - Smooth scroll reveals & micro-interactions
✅ **Dark Mode First** - Premium, modern aesthetic
✅ **Fully Responsive** - Mobile, tablet, desktop optimized
✅ **SEO Optimized** - Meta tags, structured data, performance
✅ **TypeScript** - Type-safe development
✅ **Component-Based** - Modular, reusable architecture

---

## 📁 Project Structure

```
wieslogicai-website/
├── app/
│   ├── layout.tsx              # Root layout with fonts & metadata
│   ├── page.tsx                # Home page (main entry)
│   └── globals.css             # Global styles & Tailwind
├── components/
│   ├── sections/
│   │   ├── HeroSection.tsx     # Hero with animated dashboard
│   │   ├── FeaturesSection.tsx # 4 AI product cards
│   │   └── PricingSection.tsx  # 3-tier pricing
│   ├── Navigation.tsx          # Sticky header with scroll effects
│   └── Footer.tsx              # Footer with newsletter
├── public/
│   └── assets/                 # Images, videos, icons
├── tailwind.config.ts          # Custom colors, animations
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies
├── DESIGN_SYSTEM.md            # Complete design guidelines
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open browser
# Navigate to http://localhost:3000
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

---

## 🎨 Design System

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for:
- Color palette & usage
- Typography scale
- Animation principles
- Component patterns
- Framer Motion examples
- Grant Cardone voice guidelines

### Quick Color Reference

```css
Electric Cyan:  #00F0FF  /* Primary CTA, accents */
Neon Pink:      #FF0080  /* Secondary accents, hover */
Gold:           #FFD700  /* Success, premium elements */
Primary Dark:   #0A0E27  /* Background, authority */
```

---

## 🧩 Component Guide

### Hero Section
**File:** `components/sections/HeroSection.tsx`

Features:
- Animated gradient orbs
- Floating particles
- Interactive glass dashboard card
- Dual CTAs (Primary + Video demo)
- Real-time stats counter
- Scroll indicator

**Key Props:** None (self-contained)

### Features Section
**File:** `components/sections/FeaturesSection.tsx`

Features:
- 4 animated feature cards
- Scroll-triggered reveals
- Hover glow effects
- Icon animations
- Staggered entrance

**Data:** Edit `features` array in component

### Pricing Section
**File:** `components/sections/PricingSection.tsx`

Features:
- 3 pricing tiers
- Popular badge
- Feature comparison
- Individual CTAs
- Money-back guarantee badge

**Data:** Edit `plans` array in component

---

## 🎬 Animation Guidelines

### Framer Motion Patterns

```typescript
// Scroll Reveal (fade up)
<motion.div
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {content}
</motion.div>

// Hover Scale
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>

// Stagger Children
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div variants={itemVariants} />
  ))}
</motion.div>
```

---

## 📹 Video & Media Assets

### Required Assets

#### 1. Hero Background Video
- **Location:** `/public/assets/hero-bg.mp4`
- **Specs:** 1920x1080, 10-15s loop, < 5MB
- **AI Prompt:**
  ```
  Abstract AI neural network visualization with cyan and pink
  neon particles flowing through dark space, futuristic tech grid,
  subtle movement, dark blue background, cinematic
  ```

#### 2. Demo/Explainer Video
- **Location:** `/public/assets/demo-video.mp4`
- **Specs:** 1920x1080, 60-90s, with captions
- **Content:** Screen recording of AI agents in action

#### 3. Social Media Teaser (Bonus)
- **Location:** `/public/assets/teaser-reel.mp4`
- **Specs:** 1080x1920 (vertical), 15-30s
- **Platforms:** Instagram Reels, LinkedIn
- **AI Prompt:**
  ```
  Dynamic split-screen showing before (chaotic manual work) vs
  after (smooth AI automation), fast cuts, energetic music,
  bold text overlays with Grant Cardone energy
  ```

#### 4. OG Image
- **Location:** `/public/og-image.jpg`
- **Specs:** 1200x630
- **Content:** Logo + headline + key visual

---

## 🎥 AI Video Generation Prompts

### For Runway, Pika, or Stability AI

#### Hero Background Loop
```
Style: Futuristic tech visualization
Subject: Abstract neural network with flowing data streams
Colors: Electric cyan (#00F0FF) and neon pink (#FF0080) on dark navy (#0A0E27)
Motion: Slow camera drift, particles floating upward
Mood: Premium, high-tech, energetic
Duration: 15 seconds seamless loop
```

#### AI Agent Dashboard Screen
```
Style: Modern software interface
Subject: Animated dashboard showing real-time AI metrics
Elements: Line graphs rising, numbers counting up, green status indicators
Colors: Dark theme with cyan accents
Motion: Data updates, smooth transitions
Mood: Professional, dynamic
Duration: 20 seconds
```

#### Transformation Scene (Before/After)
```
Style: Split-screen comparison
Left: Cluttered desk, stressed person, paper chaos
Right: Clean workspace, relaxed person, holographic AI interface
Transition: Smooth morph from left to right
Colors: Desaturated left, vibrant electric colors right
Duration: 10 seconds
```

---

## 🛠️ Customization Guide

### Change Primary Color
1. Open `tailwind.config.ts`
2. Modify `electric` color values
3. Adjust shadow colors in components

### Add New Section
1. Create component in `components/sections/`
2. Import in `app/page.tsx`
3. Add to page structure
4. Update navigation links

### Modify Copy/Text
- **Headlines:** Edit in respective section components
- **Features:** Update `features` array in `FeaturesSection.tsx`
- **Pricing:** Update `plans` array in `PricingSection.tsx`

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Environment Variables
Create `.env.local`:
```bash
NEXT_PUBLIC_SITE_URL=https://wieslogic.ai
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 📊 Performance Optimization

### Implemented Optimizations
✅ Image optimization with Next.js `<Image>`
✅ Font optimization with `next/font`
✅ Code splitting (automatic)
✅ Lazy loading for below-fold content
✅ Reduced motion for accessibility

### Lighthouse Goals
- **Performance:** 95+
- **Accessibility:** 100
- **Best Practices:** 100
- **SEO:** 100

---

## 🎯 Conversion Optimization

### CTA Placement
1. **Hero:** Primary + Secondary CTA
2. **Post-Features:** "Get Started" CTA
3. **Pricing:** CTA on each card
4. **Footer:** Newsletter signup

### Tracking Events (To Implement)
- CTA button clicks
- Video plays
- Scroll depth
- Form submissions

---

## 📱 Social Media Content Ideas

### Instagram Reels / TikTok
1. **"10X Your Business" Hook** → Show before/after automation
2. **"Stop Wasting Time"** → Countdown of hours saved
3. **"AI Takes Over"** → Screen recording of AI agent in action

### LinkedIn Posts
1. **Case Study:** "How [Company] Saved 500 Hours with AI"
2. **Thought Leadership:** "5 Processes You Should Automate in 2025"
3. **Behind the Scenes:** "Building an AI Voice Agent"

### Twitter/X Threads
1. **"Here's how AI automation actually works:"** (10-tweet thread)
2. **"Most businesses waste 40% of their time on X, Y, Z"** (problem-solution)

---

## 🐛 Troubleshooting

### Common Issues

**Animations not working?**
- Check Framer Motion is installed: `npm install framer-motion`
- Verify 'use client' directive at top of component

**Fonts not loading?**
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

**Build errors?**
- Update dependencies: `npm update`
- Check TypeScript errors: `npm run build`

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.3 | React framework |
| React | 18.3.1 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.1 | Styling |
| Framer Motion | 11.2.10 | Animations |
| Lucide React | 0.379.0 | Icons |
| React CountUp | 6.5.3 | Number animations |
| React Intersection Observer | 9.10.2 | Scroll triggers |

---

## 📄 License

© 2025 WiesLogicAI. All rights reserved.

---

## 🤝 Support

For questions or support:
- **Email:** hello@wieslogic.ai
- **Documentation:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

## 🎉 Next Steps

1. ✅ Install dependencies
2. ✅ Run dev server
3. 📝 Customize copy/text
4. 🎨 Add your brand assets
5. 📹 Generate video content
6. 🚀 Deploy to Vercel
7. 📊 Set up analytics
8. 🎯 Launch marketing campaigns

---

**Built with ⚡ by WiesLogicAI**

*Go 10X or go home.*
