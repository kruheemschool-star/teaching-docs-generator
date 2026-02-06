---
name: vercel-react-best-practices
description: Best practices for building React/Next.js applications optimized for Vercel deployment
---

# Vercel React Best Practices

This skill provides guidelines and best practices for building high-performance React applications using Next.js, optimized for Vercel deployment.

## Rendering Strategies

### Static Site Generation (SSG)
- Use `getStaticProps` for pages with content that doesn't frequently change
- Pages are pre-rendered at build time and served via CDN
- Best for: marketing pages, blog posts, documentation

### Incremental Static Regeneration (ISR)
- Add `revalidate` option to `getStaticProps` to update static content at intervals
- Balances static performance with data freshness
- No full redeploy required

```typescript
export async function getStaticProps() {
  const data = await fetchData()
  return {
    props: { data },
    revalidate: 60 // Regenerate every 60 seconds
  }
}
```

### Server Components (App Router)
- Default in Next.js App Router - components run on the server
- Send less JavaScript to the client
- Use `'use client'` directive only when interactivity is needed

```tsx
// Server Component (default) - no directive needed
async function ProductList() {
  const products = await db.products.findMany()
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>
}

// Client Component - only for interactivity
'use client'
function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  // Interactive logic here
}
```

---

## Image Optimization

### Use `next/image` Component
- Automatic WebP/AVIF format conversion
- Lazy loading by default
- Responsive sizing
- Always specify `width` and `height` to prevent CLS

```tsx
import Image from 'next/image'

// ✅ Good - explicit dimensions
<Image 
  src="/hero.jpg" 
  alt="Hero" 
  width={1200} 
  height={600}
  priority // Use for above-the-fold images
/>

// ✅ Good - responsive with fill
<div className="relative h-64">
  <Image 
    src="/banner.jpg" 
    alt="Banner" 
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover"
  />
</div>
```

---

## Font Optimization

### Use `next/font`
- Automatically self-hosts fonts
- Eliminates layout shift
- Supports Google Fonts and local fonts

```tsx
import { Inter, Noto_Sans_Thai } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  display: 'swap',
  variable: '--font-noto-thai'
})

// In layout.tsx
<body className={`${inter.variable} ${notoSansThai.variable}`}>
```

---

## Code Splitting & Lazy Loading

### Dynamic Imports
- Use `next/dynamic` for components not needed on initial load
- Reduces JavaScript payload

```tsx
import dynamic from 'next/dynamic'

// Lazy load heavy components
const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Disable SSR for client-only components
})

const Modal = dynamic(() => import('@/components/Modal'))
```

### Route Groups for Code Splitting
```
app/
├── (marketing)/    # Separate bundle
│   ├── page.tsx
│   └── about/
├── (dashboard)/    # Separate bundle
│   ├── layout.tsx
│   └── analytics/
```

---

## Data Fetching Best Practices

### Parallel Data Fetching
```tsx
// ✅ Good - parallel fetching
async function Dashboard() {
  const [user, posts, stats] = await Promise.all([
    getUser(),
    getPosts(),
    getStats()
  ])
  return <DashboardContent user={user} posts={posts} stats={stats} />
}

// ❌ Bad - sequential (waterfall)
async function Dashboard() {
  const user = await getUser()
  const posts = await getPosts()
  const stats = await getStats()
  // ...
}
```

### Prefetching with `next/link`
```tsx
import Link from 'next/link'

// Prefetching is enabled by default for visible links
<Link href="/dashboard">Dashboard</Link>

// Disable prefetching for less important links
<Link href="/archive" prefetch={false}>Archive</Link>
```

---

## Caching Strategies

### Route Segment Config
```tsx
// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Revalidate every hour
export const revalidate = 3600

// Static generation (default)
export const dynamic = 'force-static'
```

### Fetch Caching
```tsx
// Default: cached indefinitely
const data = await fetch('https://api.example.com/data')

// Revalidate every 60 seconds
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }
})

// Always fresh (no cache)
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})
```

---

## Third-Party Scripts

### Use `next/script`
```tsx
import Script from 'next/script'

// Load after page is interactive
<Script 
  src="https://analytics.example.com/script.js"
  strategy="afterInteractive"
/>

// Load during idle time (lowest priority)
<Script 
  src="https://widget.example.com/embed.js"
  strategy="lazyOnload"
/>

// Load before page is interactive (blocking)
<Script 
  src="https://critical.example.com/lib.js"
  strategy="beforeInteractive"
/>
```

---

## Core Web Vitals Optimization

### LCP (Largest Contentful Paint)
- Preload critical images with `priority` prop
- Use `next/font` to prevent font-related delays
- Optimize server response times

### CLS (Cumulative Layout Shift)
- Always set `width` and `height` on images
- Use `next/font` with `display: swap`
- Reserve space for dynamic content

### INP (Interaction to Next Paint)
- Use React 18 concurrent features (Transitions, Suspense)
- Minimize JavaScript execution
- Debounce expensive operations

```tsx
import { useTransition } from 'react'

function SearchFilter() {
  const [isPending, startTransition] = useTransition()
  
  const handleChange = (value: string) => {
    // Non-urgent update - won't block UI
    startTransition(() => {
      setFilter(value)
    })
  }
  
  return <input onChange={(e) => handleChange(e.target.value)} />
}
```

---

## State Management

### Avoid Unnecessary Re-renders
```tsx
import { memo, useMemo, useCallback } from 'react'

// Memoize expensive computations
const expensiveResult = useMemo(() => {
  return items.filter(computeExpensively)
}, [items])

// Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// Memoize components
const MemoizedChild = memo(function Child({ data }) {
  return <div>{data}</div>
})
```

---

## Vercel-Specific Features

### Edge Functions
```tsx
// app/api/geo/route.ts
export const runtime = 'edge'

export async function GET(request: Request) {
  const { geo } = request
  return Response.json({ country: geo?.country })
}
```

### Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Authentication, redirects, A/B testing, etc.
  const response = NextResponse.next()
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

### Environment Variables
```bash
# .env.local (local only)
DATABASE_URL=...

# Vercel Dashboard for production
# NEXT_PUBLIC_ prefix for client-side access
NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## Project Structure Recommendations

```
app/
├── (auth)/              # Auth route group
│   ├── login/
│   └── register/
├── (dashboard)/         # Dashboard route group
│   ├── layout.tsx
│   └── [slug]/
├── api/                 # API routes
├── layout.tsx           # Root layout
└── page.tsx             # Home page

components/
├── ui/                  # Base UI components
├── forms/               # Form components
└── layouts/             # Layout components

lib/
├── api.ts               # API utilities
├── utils.ts             # Helper functions
└── constants.ts         # Constants

hooks/                   # Custom React hooks
contexts/                # React contexts
types/                   # TypeScript types
```

---

## Performance Checklist

- [ ] Use Server Components by default, `'use client'` only when needed
- [ ] Optimize images with `next/image` and set dimensions
- [ ] Use `next/font` for all fonts
- [ ] Implement dynamic imports for heavy components
- [ ] Use parallel data fetching with `Promise.all()`
- [ ] Set appropriate caching strategies
- [ ] Load third-party scripts with `next/script`
- [ ] Use React 18 features (Transitions, Suspense)
- [ ] Monitor Core Web Vitals with Vercel Analytics
- [ ] Test with Lighthouse regularly
