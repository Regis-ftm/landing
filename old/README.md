# REGIS Landing Page

> Modern, SEO-optimized landing page for REGIS - Construction Work Modification Management System

## Features

- **100% SEO Optimized**
  - Complete meta tags (title, description, keywords)
  - Open Graph & Twitter Card tags
  - JSON-LD structured data (Organization, SoftwareApplication, FAQ)
  - Semantic HTML5 structure
  - Canonical URLs

- **Analytics Ready**
  - Google Analytics 4 integration
  - Google Tag Manager support
  - Custom event tracking
  - Conversion tracking (Google Ads, Facebook Pixel, LinkedIn)
  - Core Web Vitals monitoring

- **Performance Optimized**
  - Pure HTML/CSS/JS - No framework overhead
  - Lazy loading images
  - Preconnect to external resources
  - Optimized CSS animations
  - Print-friendly styles

- **Accessibility (A11y)**
  - Skip links
  - ARIA attributes
  - Keyboard navigation
  - Screen reader friendly
  - Focus management

- **Modern Design**
  - Responsive (mobile-first)
  - Brand-consistent colors & typography
  - Smooth animations
  - Dark mode ready (CSS variables)

## File Structure

```
landing/
├── index.html          # Main landing page
├── pricing.html        # Pricing page (noindex for now)
├── css/
│   ├── styles.css      # Main styles + design system
│   └── pricing.css     # Pricing page specific styles
├── js/
│   ├── main.js         # Main JavaScript (form, analytics, etc.)
│   └── pricing.js      # Pricing page toggle
├── images/
│   └── favicon.svg     # Favicon
└── README.md           # This file
```

## Quick Start

### Local Development

Simply open `index.html` in your browser, or use a local server:

```bash
# Using Python
cd landing
python -m http.server 8080

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8080
```

Then open http://localhost:8080

### Deployment

This is a static site that can be deployed anywhere:

#### Option 1: Netlify (Recommended)
```bash
# Via CLI
npm install -g netlify-cli
netlify deploy --dir=landing --prod

# Or drag & drop the folder at https://app.netlify.com/drop
```

#### Option 2: Vercel
```bash
npm install -g vercel
cd landing
vercel --prod
```

#### Option 3: Firebase Hosting
```bash
# From project root
firebase deploy --only hosting:landing
```

#### Option 4: GitHub Pages
1. Push to GitHub
2. Go to Settings > Pages
3. Select source branch and folder

#### Option 5: Traditional Hosting
Simply upload all files to your web server's public directory.

## Configuration

### Analytics Setup

1. **Google Analytics 4**
   - Create a property at https://analytics.google.com
   - Get your Measurement ID (G-XXXXXXXX)
   - Update `CONFIG.googleAnalyticsId` in `js/main.js`
   - Uncomment the GA script in `index.html`

2. **Google Tag Manager**
   - Create a container at https://tagmanager.google.com
   - Get your Container ID (GTM-XXXXXXX)
   - Update `CONFIG.googleTagManagerId` in `js/main.js`
   - Uncomment GTM scripts in `index.html`

### Form Submission

The contact form can be configured to submit to:

1. **Your API endpoint**
   ```javascript
   CONFIG.formEndpoint = 'https://api.regis-app.com/contact';
   ```

2. **Formspree** (no backend needed)
   - Sign up at https://formspree.io
   - Create a form
   - Update `CONFIG.formEndpoint = 'https://formspree.io/f/YOUR_FORM_ID'`

3. **Netlify Forms** (if hosting on Netlify)
   - Add `netlify` attribute to your form
   - Forms are automatically collected

### Customization

#### Colors
Edit CSS variables in `css/styles.css`:

```css
:root {
    --primary-blue: #3b82f6;
    --primary-dark: #0f172a;
    /* ... */
}
```

#### Content
- Edit `index.html` for main content
- Update images in `images/` folder
- Modify structured data in `<script type="application/ld+json">`

### SEO Checklist

Before launch:

- [ ] Update canonical URL to your domain
- [ ] Replace placeholder URLs (regis-app.com) with actual domain
- [ ] Create and upload `og-image.png` (1200x630px recommended)
- [ ] Submit sitemap to Google Search Console
- [ ] Verify with Google Search Console
- [ ] Set up Google Analytics
- [ ] Test with Google's Rich Results Test
- [ ] Test with PageSpeed Insights

## Pages

### index.html (Main Landing)
- Hero with beta badge
- Problem/pain points section
- Features showcase
- Benefits section
- How it works
- Early adopter CTA
- FAQ section
- Contact form
- Footer

### pricing.html (Hidden for now)
- `noindex, nofollow` meta tag
- Pricing tiers (Starter, Pro, Enterprise)
- Billing toggle (monthly/yearly)
- Feature comparison table
- FAQ section
- CTA section

To make pricing visible:
1. Remove `<meta name="robots" content="noindex, nofollow">` from `pricing.html`
2. Uncomment pricing link in footer navigation

## Legal Pages (To Create)

You'll need to create:
- `/mentions-legales.html` - Legal notices (required in France)
- `/privacy.html` - Privacy policy
- `/cgu.html` - Terms of service

## Performance Tips

1. **Images**: Use WebP format with JPEG fallback
2. **Fonts**: Consider self-hosting Inter font
3. **CSS**: Inline critical CSS for above-the-fold content
4. **JS**: Add `defer` to all scripts (already done)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - REGIS Inc.

---

Built with ❤️ for REGIS
