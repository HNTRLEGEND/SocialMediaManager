# 🚀 WiesLogicAI Deployment Guide

> **Complete step-by-step deployment instructions for production launch**

---

## 📋 Pre-Deployment Checklist

### Content & Assets
- [ ] All copy reviewed and finalized
- [ ] Hero background video uploaded (`/public/assets/hero-bg.mp4`)
- [ ] Demo video uploaded (`/public/assets/demo-video.mp4`)
- [ ] OG image created (`/public/og-image.jpg` - 1200x630)
- [ ] Favicon set (`/public/favicon.ico`)
- [ ] Logo files in place (`/public/assets/logo.svg`, `.png`)

### Technical
- [ ] All dependencies installed (`npm install`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Environment variables configured
- [ ] Analytics tracking codes ready
- [ ] Domain purchased and DNS configured
- [ ] SSL certificate ready (auto via Vercel)

### SEO & Marketing
- [ ] Google Analytics setup
- [ ] Google Search Console verified
- [ ] Meta tags reviewed
- [ ] Structured data validated
- [ ] Social media accounts created
- [ ] Email marketing platform connected

---

## 🌐 Domain Setup

### 1. Purchase Domain
Recommended registrars:
- **Namecheap** (best value)
- **Google Domains** (easy integration)
- **GoDaddy** (most popular)

Suggested domains:
- `wieslogic.ai` ✅ Premium choice
- `wieslogicai.com`
- `wieslogic.io`

### 2. Configure DNS
Once deployed to Vercel, add these records:

```
Type    Name    Value                   TTL
A       @       76.76.21.21             Auto
CNAME   www     cname.vercel-dns.com    Auto
```

---

## 🚀 Vercel Deployment (Recommended)

### Why Vercel?
✅ Built by Next.js creators
✅ Zero-config deployment
✅ Automatic SSL
✅ CDN included
✅ Preview deployments
✅ Free for personal use

### Step-by-Step

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy to Preview
```bash
# Navigate to project folder
cd wieslogicai-website

# Deploy (follow prompts)
vercel
```

#### 4. Deploy to Production
```bash
vercel --prod
```

#### 5. Add Custom Domain
```bash
# In Vercel dashboard or CLI
vercel domains add wieslogic.ai
vercel domains add www.wieslogic.ai
```

### Environment Variables

In Vercel dashboard, add:

```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Site Config
NEXT_PUBLIC_SITE_URL=https://wieslogic.ai

# Email (if using contact form)
EMAIL_SERVER=smtp.sendgrid.net
EMAIL_FROM=hello@wieslogic.ai
EMAIL_API_KEY=your_sendgrid_key

# CRM Integration (optional)
HUBSPOT_API_KEY=your_hubspot_key
```

---

## 🎨 Alternative Hosting Options

### Netlify
```bash
# Install CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### AWS Amplify
1. Connect GitHub repo
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Deploy

### DigitalOcean App Platform
1. Connect repo
2. Select Next.js preset
3. Deploy

---

## 📊 Analytics Setup

### Google Analytics 4

#### 1. Create GA4 Property
- Go to [analytics.google.com](https://analytics.google.com)
- Create new property
- Copy Measurement ID (G-XXXXXXXXXX)

#### 2. Add to Project
Create `app/GoogleAnalytics.tsx`:

```typescript
'use client'

import Script from 'next/script'

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  )
}
```

#### 3. Add to Layout
In `app/layout.tsx`:

```typescript
import GoogleAnalytics from './GoogleAnalytics'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
        {children}
      </body>
    </html>
  )
}
```

### Google Tag Manager (Alternative)

```typescript
// app/GoogleTagManager.tsx
'use client'

import Script from 'next/script'

export default function GoogleTagManager({ gtmId }: { gtmId: string }) {
  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>
    </>
  )
}
```

---

## 🔍 SEO Configuration

### Google Search Console

#### 1. Verify Ownership
- Go to [search.google.com/search-console](https://search.google.com/search-console)
- Add property (wieslogic.ai)
- Verify via DNS or HTML tag

#### 2. Submit Sitemap
Create `app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://wieslogic.ai',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://wieslogic.ai/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://wieslogic.ai/pricing',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
}
```

Submit at: `https://wieslogic.ai/sitemap.xml`

### Robots.txt
Create `app/robots.ts`:

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://wieslogic.ai/sitemap.xml',
  }
}
```

---

## 📧 Email Marketing Setup

### Recommended Services
1. **ConvertKit** - Best for creators
2. **Mailchimp** - Most popular
3. **SendGrid** - Best for transactional

### Newsletter Form Integration

Example with ConvertKit:

```typescript
// components/NewsletterForm.tsx
'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status === 'success' && <p>Success! Check your email.</p>}
      {status === 'error' && <p>Error. Please try again.</p>}
    </form>
  )
}
```

---

## 🎯 Conversion Tracking

### Track CTA Clicks

```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }
}

// Usage in components
import { trackEvent } from '@/lib/analytics'

<button onClick={() => {
  trackEvent('cta_click', {
    location: 'hero',
    cta_text: 'Book Free Consultation'
  })
}}>
  Book Free Consultation
</button>
```

### Track Video Plays

```typescript
<video
  onPlay={() => trackEvent('video_play', { video: 'hero_demo' })}
  onEnded={() => trackEvent('video_complete', { video: 'hero_demo' })}
>
  <source src="/assets/demo-video.mp4" />
</video>
```

---

## 🔒 Security Best Practices

### Environment Variables
Never commit `.env` files! Use `.env.local` for local dev.

### Rate Limiting
For contact forms, implement rate limiting:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'unknown'
  const limit = 5 // max requests per minute
  const windowMs = 60000

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 0, resetTime: Date.now() + windowMs })
  }

  const rateLimitData = rateLimitMap.get(ip)

  if (Date.now() > rateLimitData.resetTime) {
    rateLimitData.count = 0
    rateLimitData.resetTime = Date.now() + windowMs
  }

  if (rateLimitData.count >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  rateLimitData.count += 1
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

---

## 📱 Social Media Integration

### Open Graph Images

Verify OG tags with:
- [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Social Sharing Buttons

```typescript
// components/ShareButtons.tsx
export default function ShareButtons({ url, title }: { url: string, title: string }) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className="flex gap-4">
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Share on Twitter
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Share on LinkedIn
      </a>
    </div>
  )
}
```

---

## ⚡ Performance Optimization

### Before Launch
- [ ] Run Lighthouse audit (aim for 95+ scores)
- [ ] Compress all images (use TinyPNG or ImageOptim)
- [ ] Enable Vercel Image Optimization
- [ ] Lazy load below-fold images
- [ ] Minify CSS/JS (automatic with Next.js)

### Monitor Performance
Use these tools:
- **Google PageSpeed Insights**
- **GTmetrix**
- **WebPageTest**
- **Vercel Analytics** (built-in)

---

## 🧪 Testing Checklist

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (desktop + iOS)
- [ ] Edge (latest)

### Device Testing
- [ ] iPhone (various sizes)
- [ ] Android (various sizes)
- [ ] iPad
- [ ] Desktop (1920px, 1366px, 1024px)

### Functionality Testing
- [ ] All CTAs click correctly
- [ ] Forms submit successfully
- [ ] Videos play on all devices
- [ ] Animations smooth (no jank)
- [ ] Navigation works on mobile
- [ ] External links open in new tabs

---

## 🚨 Launch Day Checklist

### T-Minus 24 Hours
- [ ] Final content review
- [ ] All assets uploaded
- [ ] Analytics verified
- [ ] Test forms end-to-end
- [ ] Set up monitoring alerts

### Launch Day
- [ ] Deploy to production
- [ ] Test live site (all pages)
- [ ] Submit sitemap to Google
- [ ] Share on social media
- [ ] Send launch email to list
- [ ] Monitor analytics for issues

### Post-Launch (Week 1)
- [ ] Check Search Console daily
- [ ] Monitor conversion rates
- [ ] Collect user feedback
- [ ] Fix any reported bugs
- [ ] A/B test CTAs

---

## 📈 Growth & Iteration

### Week 1-4
- Monitor bounce rate (target < 40%)
- Track CTA clicks
- Collect user feedback
- Fix any UX issues

### Month 2-3
- A/B test headlines
- Experiment with CTA copy
- Add testimonials
- Publish blog content

### Month 4+
- Add case studies
- Build email nurture sequences
- Expand to new pages
- Scale ad campaigns

---

## 🔧 Troubleshooting

### Site Not Loading?
1. Check DNS propagation: `dig wieslogic.ai`
2. Verify Vercel deployment status
3. Check browser console for errors

### Slow Performance?
1. Run Lighthouse audit
2. Check image sizes (use WebP)
3. Enable Vercel Image Optimization
4. Review third-party scripts

### Forms Not Working?
1. Check API endpoint
2. Verify environment variables
3. Test with browser dev tools
4. Check rate limiting

---

## 📞 Support Resources

### Vercel
- [Documentation](https://vercel.com/docs)
- [Discord Community](https://vercel.com/discord)

### Next.js
- [Documentation](https://nextjs.org/docs)
- [GitHub Discussions](https://github.com/vercel/next.js/discussions)

### Emergency Contacts
- **Email:** hello@wieslogic.ai
- **Phone:** [Add emergency number]

---

## 🎉 Post-Launch Marketing

### Week 1
1. **LinkedIn Post:** "We just launched! Here's why..."
2. **Email Blast:** To existing list
3. **Product Hunt:** Submit for feedback
4. **Twitter Thread:** Behind-the-scenes story

### Week 2-4
1. **Guest Posts:** Target industry blogs
2. **Podcast Pitches:** Share your story
3. **Partnerships:** Reach out to complementary services
4. **Ads:** Start with €50/day budget

---

## ✅ Success Metrics

### Month 1 Goals
- 1,000 unique visitors
- 50 demo bookings
- 5 paying customers
- < 40% bounce rate

### Month 3 Goals
- 5,000 unique visitors
- 200 demo bookings
- 25 paying customers
- > 3 min avg session duration

---

**You're ready to launch! 🚀**

**Questions? Email hello@wieslogic.ai**

---

*Last Updated: 2025-10-26*
*Version: 1.0*
