import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// [width, left offset from centre, top] in px — copied from the Figma image frames so crops match the design.
const crop = z.tuple([z.number(), z.number(), z.number()]).optional();

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),                 // title on the article page
    cardTitle: z.string().optional(),  // title on the blog card (defaults to title)
    summary: z.string(),               // card description
    intro: z.string().optional(),      // lead paragraph under the article title
    date: z.coerce.date(),
    author: z.string().default('nwamaka'),
    readingTime: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().default(''),
    cropCard: crop, cropCardMobile: crop, cropHero: crop,
    order: z.number().default(0),
  }),
});

const fieldlog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fieldlog' }),
  schema: z.object({
    name: z.string(),
    scientific: z.string(),
    seen: z.coerce.date(),
    time: z.string().optional(),
    place: z.string(),
    placeDetail: z.string().optional(),
    state: z.string(),
    coordinates: z.string().optional(),
    photos: z.array(z.object({ src: z.string(), label: z.string().optional(), alt: z.string().optional() })).default([]),
    sounds: z.array(z.object({ label: z.string(), src: z.string().optional(), duration: z.string().optional() })).default([]),
  }),
});

export const collections = { blog, fieldlog };
