# ọjịugo — website

Built from the Figma "Website - V1" frames (desktop + mobile). Static site made with [Astro](https://astro.build).

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/ — deploy to Netlify, Vercel, Cloudflare Pages, etc.
```

## Pages

| URL | Figma frame |
|---|---|
| `/` | Blog (home) |
| `/blog/<slug>` | Blog Post |
| `/fieldlog` | Field logs |
| `/fieldlog/<slug>` | Field log |
| `/waitlist` | Waitlist |
| `/waitlist/success` | Waitlist / Success |
| mobile menu | Menu |

## Adding content

- **Blog posts** → `src/content/blog/*.md` (title, summary, date, image… in the frontmatter, the article in Markdown below). `> quote` renders as the lilac pull-quote.
- **Field log entries** → `src/content/fieldlog/*.md`. Your note goes below the frontmatter.

## Images, audio, illustrations

Photos show the soft feather placeholder until the file exists. Drop files in with these names and they appear automatically:

- Blog: `public/images/blog/breeding-codes.jpg`, `hyperlocal-guide.jpg`, `underreported-species.jpg`, `birding-habit.jpg`
- Field log: `public/images/fieldlog/<slug>-1.jpg`, `-2.jpg`, `-3.jpg` (carousel; labels set in frontmatter)
- Recordings: `public/audio/<slug>-song.mp3`, `<slug>-call.mp3` (play buttons activate once present)

The logo (`src/components/Logo.astro`), branch/grass art (`src/components/CtaBand.astro`) and nest (`src/pages/waitlist/success.astro`) are hand-redrawn SVGs — swap in exports from Figma for exact matches.

## Still to wire up

- Newsletter form (`src/components/Newsletter.astro`) and waitlist form (`src/pages/waitlist/index.astro`) validate and show the success state but don't send emails anywhere yet — connect a provider (Buttondown, Formspree, Supabase…).
- Privacy / terms pages are stubs.

Design tokens (colours, type, radii) live in `src/styles/global.css`. Font: Grandstander.
