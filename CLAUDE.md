Create a premium, highly innovative and unique personal branding website + blog for **Vineet Daniel** (vineetdaniel.me).

### Persona & Positioning:
Vineet Daniel is a **versatile technology generalist** with rich hands-on experience across Software Engineering, Product Management, IT Infrastructure, Artificial Intelligence, and Cyber Security. 
He is known for his ability to **scale operations, build high-performing teams, and power up startups** from early stage to growth. 
Position him as a thoughtful operator, strategic thinker, and insightful voice in technology — not as someone looking for jobs or traditional consulting gigs. Focus on thought leadership, knowledge sharing, and inspiring the next generation.

Target Audience: Gen Z founders, young entrepreneurs, CxOs, and recruiters who value depth, authenticity, and forward-thinking perspectives.

### Core Tone & Style:
- Confident, approachable, insightful, and slightly rebellious/innovative.
- Conversational with intellectual depth.
- Strong emphasis on personal story and journey.

### Website Requirements:

**Design Direction (Very Important):**
- **Innovative and unique UI** — futuristic yet elegant. Think cutting-edge tech aesthetic with creative interactions.
- Use micro-animations, scroll-triggered effects, parallax, subtle 3D elements, or creative navigation (e.g., interactive orb/menu, horizontal scrolling sections, or tech-glitch effects on hover).
- Dark mode first with vibrant electric blue/cyan accents, deep purples, and gradients.
- Very modern, Gen Z friendly — bold typography, generous whitespace, immersive feel.
- Mobile experience must be exceptional and unique.

**Pages Structure:**

1. **Home / Hero**
   - Striking, cinematic hero with innovative layout.
   - Headline that captures the generalist + scaler identity.
   - Subheadline highlighting personal philosophy.
   - Strong personal photo or illustrated avatar with tech overlay.

2. **My Story (Strong Personal Narrative)**
   - Deep, engaging personal journey section — from engineering roots to mastering AI, cyber security, product, and scaling startups.
   - Timeline with storytelling elements (make it emotional and inspiring).
   - Key lessons learned and evolution as a generalist.

3. **Expertise Areas**
   - Visually creative cards or interactive sections for:
     - Engineering & Architecture
     - Product Strategy
     - Artificial Intelligence
     - Cyber Security & Defense
     - Startup Scaling & Operations
   - Focus on insights and philosophy rather than services.

4. **Writing / Blog**
   - Beautiful, highly readable blog with excellent typography.
   - Categories: AI & Future, Startup Scaling, Cyber Security, Product & Leadership, Life as a Generalist, Tech Trends.
   - Featured posts on homepage.

5. **Insights & Projects**
   - Showcase key projects, scaling stories, and thought frameworks (use placeholders).

6. **Connect**
   - Simple, warm contact section with social links (especially X/Twitter).

### Additional Requirements:
- Write all content in first person.
- Strong SEO optimization and meta descriptions.
- Suggest 10 high-value blog post titles that position him as a thoughtful leader.
- Make navigation creative and smooth.
- Overall feel: Premium independent tech thinker — like a mix of Paul Graham + modern Gen Z founder energy.

Generate the full website structure with detailed copy, innovative UI suggestions, and image prompts for each section.  
## 🛠️  Technical Stack & Setup
  
  **Frontend Framework:**
  - Next.js 14+ (App Router) — for optimal performance, SEO, and serverless deployment
  - React 18+ for component structure
  - TypeScript for type safety
  
  **Styling & Animations:**
  - Tailwind CSS for utility-first styling
  - Framer Motion for micro-animations and scroll-triggered effects
  - Three.js (optional) for 3D elements or interactive tech overlays
  - CSS custom properties for dark mode + vibrant accent colors
  
  **Content & Blog:**
  - MDX for blog posts (Markdown + React components)
  - Contentlayer for content pipeline and type-safe MDX
  
  **Performance & SEO:**
  - Next.js Image optimization
  - Dynamic meta tags and Open Graph
  - Structured data (JSON-LD) for rich snippets
  - Sitemap generation
  
  **Deployment:**
  - Vercel (recommended) for seamless Next.js deployment
  - Environment: Production domain vineetdaniel.me
  
  ---
  
  ## 📁 Project Structure
  
  /vineetdaniel.com
  ├── app/                          # Next.js app directory
  │   ├── layout.tsx               # Root layout, navigation, footer
  │   ├── page.tsx                 # Home / Hero page
  │   ├── story/
  │   │   └── page.tsx             # My Story timeline
  │   ├── expertise/
  │   │   └── page.tsx             # Expertise areas
  │   ├── writing/
  │   │   ├── page.tsx             # Blog index
  │   │   └── [slug]/
  │   │       └── page.tsx         # Individual blog post
  │   ├── insights/
  │   │   └── page.tsx             # Projects & frameworks
  │   ├── connect/
  │   │   └── page.tsx             # Contact page
  │   └── api/
  │       └── contact/             # Contact form endpoint
  ├── components/
  │   ├── Navigation.tsx           # Header nav (creative/interactive)
  │   ├── Hero.tsx                 # Hero section with animations
  │   ├── Footer.tsx               # Footer with social links
  │   ├── BlogCard.tsx             # Blog post card component
  │   ├── ExpertiseCard.tsx        # Expertise section cards
  │   └── shared/                  # Reusable components
  │       ├── Button.tsx
  │       ├── Badge.tsx
  │       └── ...
  ├── styles/
  │   ├── globals.css              # Tailwind + custom CSS variables
  │   └── animations.css           # Micro-animations & scroll effects
  ├── content/
  │   ├── blog/                    # MDX blog posts
  │   │   ├── ai-future.mdx
  │   │   ├── startup-scaling.mdx
  │   │   └── ...
  │   └── metadata.ts              # Shared content metadata
  ├── lib/
  │   ├── mdx.ts                   # MDX processing utilities
  │   ├── seo.ts                   # SEO utilities
  │   └── constants.ts             # Global constants, color palette
  ├── public/
  │   ├── images/                  # Hero photo, avatars, blog images
  │   ├── fonts/                   # Custom fonts (if any)
  │   └── favicon.ico
  ├── package.json
  ├── tsconfig.json
  ├── next.config.js
  ├── contentlayer.config.ts       # Contentlayer config for MDX
  ├── tailwind.config.js
  └── CLAUDE.md                    # This file

  ---

  ## 🎨 Design System

  **Color Palette:**
  - **Background:** Deep charcoal/near-black (#0a0a0a, #111111)
  - **Primary Accent:** Electric blue/cyan (#00D9FF, #0099FF) — for CTAs, highlights, interactive elements
  - **Secondary Accent:** Deep purple (#6B21A8, #7C3AED) — for subtle highlights, borders
  - **Text:** Off-white (#F5F5F5) for primary, gray (#A0AEC0) for secondary
  - **Gradients:** Blue-to-purple gradients for hero sections, animated backgrounds

  **Typography:**
  - **Headings:** Bold, modern sans-serif (e.g., Inter, Geist, or similar)
  - **Body:** Readable sans-serif with excellent line-height (1.6+)
  - **Code:** Monospace font (e.g., Fira Code, JetBrains Mono)

  **Visual Effects:**
  - Micro-animations on buttons, links (scale, glow, color transition)
  - Scroll-triggered fade-ins, parallax on hero section
  - Smooth page transitions (0.3-0.5s duration)
  - Subtle hover effects with color/shadow changes
  - Optional: Tech-glitch effect on expertise cards on hover

  ---

  ## 🚀 Development Workflow

  **Setup:**
  ```bash
  npm install
  npm run dev  # Start dev server at localhost:3000

  Adding Blog Posts:
  1. Create new .mdx file in content/blog/
  2. Include frontmatter: title, date, category, excerpt, published
  3. Write content with Markdown + optional React components
  4. Contentlayer automatically generates type-safe blog data

  Building for Production:
  npm run build
  npm run start  # Test production build locally
  
  Key Development Practices:
  - Use TypeScript for all new files (.ts or .tsx)
  - Leverage Tailwind utility classes for consistency
  - Create reusable components in components/ — avoid duplication
  - Use Framer Motion for animations (prefer declarative over imperative)
  - Test responsive design on mobile (target: 375px+ width)
  - Optimize images with Next.js Image component
  - Run Lighthouse checks before merging

  ---
  ✍️  Content Guidelines

  Blog Posts:
  - Write in first person ("I learned...", "My approach...")
  - Each post: 1000-2000 words (readable in ~8-10 minutes)
  - Include clear intro, body sections, and conclusion
  - Link to related posts where relevant
  - Categories: AI & Future, Startup Scaling, Cyber Security, Product & Leadership, Life as a Generalist, Tech Trends

  Personal Narrative (Story Page):
  - Chronological timeline from early engineering days → current expertise
  - Humanize the journey: challenges, pivots, "aha moments"
  - Conclude with personal philosophy on generalism and scaling
  - Tone: Inspirational but authentic — avoid corporate speak

  Expertise Areas:
  - Each area: 2-3 paragraph summary of philosophy, not a service menu
  - Focus on unique insights and frameworks
  - Use concrete examples from experience
  
  ---
  🔍 SEO & Performance Checklist
  
  On-Page SEO:
  - [ ] Meta descriptions for all pages (120-160 characters)
  - [ ] Open Graph images for blog posts
  - [ ] Canonical URLs to prevent duplicates
  - [ ] Alt text for all images
  - [ ] Internal linking between blog posts and expertise areas

  Performance:
  - [ ] Image optimization (WebP, proper sizing)
  - [ ] CSS/JS minification (automatic with Next.js)
  - [ ] Lazy loading for below-the-fold content
  - [ ] Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
  - [ ] Target Lighthouse score: 90+

  Structured Data:
  - [ ] JSON-LD for person schema (name, job titles, social profiles)
  - [ ] Article schema for blog posts

  ---
  📮 Contact & Social Integration

  Contact Form:
  - Endpoint: /api/contact (POST)
  - Fields: name, email, message
  - Validation: Server-side (email format, message length)
  - Confirmation email: Use service like Resend or SendGrid
  - Thank you page or toast notification after submission

  Social Links:
  - X/Twitter (primary)
  - LinkedIn
  - GitHub (optional)
  - Email: vineet.daniel@hueytech.io

  ---
  🎯 Blog Post Ideas (10 High-Value Titles)
  
  1. "The Generalist Advantage: Why Your Broad Expertise Matters More Than Ever" — Reframe generalism as a strategic asset in AI-driven markets.
  2. "Scaling Startups from 10 to 100: Operational Playbook from the Trenches" — Real lessons on hiring, process, culture at different scales.
  3. "AI as a Founder's Superpower: Practical Workflows for Non-ML Teams" — Demystify AI adoption for product + ops teams.
  4. "The Underrated Art of Cyber Hygiene: Lessons from Real Breach Scenarios" — Accessible security insights without fearmongering.
  5. "Product Strategy for Generalists: When to Go Deep vs. Stay Broad" — Decision frameworks for building diverse teams/products.
  6. "Learning at the Speed of Technology: How I Master New Domains Faster" — Meta-learning and skill acquisition strategies.
  7. "Why Great Teams Fail: Cultural Debt and How to Reverse It" — Deep dive on scaling challenges and fixes.
  8. "The Founder's Dilemma: Should You Hire a Generalist or Specialist?" — Hire smarter by understanding when each thrives.
  9. "AI, Automation, and the Future of Work: What We Got Wrong" — Nuanced take on disruption narratives.
  10. "Building Systems That Scale: From Early Chaos to Mature Operations" — Long-form case study of operational evolution.

  ---
  📝 Important Notes for Future Development

  - Email: Contact form submissions → vineet.daniel@hueytech.io
  - Domain: vineetdaniel.me (ensure DNS/SSL configured on Vercel)
  - Tone: Bold, thoughtful, slightly rebellious — NOT corporate or overly polished
  - Audience Lens: Every design and word choice should appeal to Gen Z founders and young CxOs
  - Avoid: Over-service messaging, humble-bragging, resume-speak
  - Prioritize: Authenticity, innovative UI, and thought leadership content over traditional case studies

  ---
