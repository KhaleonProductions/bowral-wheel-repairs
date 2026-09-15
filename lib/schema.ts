import { z } from 'zod';

const CopyBlock = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});

const MediaSlot = z.object({
  src: z.string().nullable(),
  alt: z.string().min(1),
  shotNeeded: z.string().min(1),
});

const Item = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
});

const Service = Item.extend({
  what: z.string().min(1),
  fixes: z.string().min(1),
  how: z.string().min(1),
});

const ProcessStep = Item.extend({
  step: z.number().int().positive(),
  detail: z.string().min(1),
  media: MediaSlot.nullable(),
});

const GalleryItem = z.object({
  id: z.string().min(1),
  category: z.enum(['diamond-cut', 'straightening', 'refurbishment', 'custom-colour']),
  caption: z.string().min(1),
  media: MediaSlot,
});

export const SiteSchema = z.object({
  business: z.object({
    name: z.literal('Bowral Wheel Repairs'),
    tagline: z.string().min(1),
    region: z.string().min(1),
  }),
  contact: z.object({
    phone: z.literal('(02) 4872 2221'),
    phoneHref: z.literal('tel:0248722221'),
    email: z.literal('admin@bowralwheelrepairs.com.au'),
    street: z.literal('8 Mount Rd'),
    locality: z.literal('Bowral'),
    region: z.literal('NSW'),
    postcode: z.literal('2576'),
    hours: z.literal('Tue-Fri: 7:30am - 5:00pm'),
    geo: z.object({ lat: z.number(), lng: z.number() }),
  }),
  nav: z.array(z.object({ href: z.string().min(1), label: z.string().min(1) })).min(1),
  quoteCta: z.object({
    label: z.string().min(1),
    note: z.string().min(1),
  }),
  home: z.object({
    heroHeadline: z.array(z.string().min(1)).min(1),
    heroSub: z.string().min(1),
    trust: z.array(Item).length(4),
    damageIntro: CopyBlock,
    damage: z.array(Item).length(6),
    resultBlock: CopyBlock,
  }),
  newcomer: CopyBlock,
  straightAnswers: CopyBlock,
  workshop: CopyBlock,
  whyUs: z.array(Item).min(3),
  services: z.array(Service).length(7),
  process: z.array(ProcessStep).length(7),
  gallery: z.array(GalleryItem).min(4),
  about: z.object({ story: CopyBlock }),
  contactPage: z.object({
    intro: CopyBlock,
    formNote: z.string().min(1),
  }),
  seo: z.record(
    z.string(),
    z.object({ title: z.string().min(1), description: z.string().min(1) }),
  ),
});

export type Site = z.infer<typeof SiteSchema>;
export type CopyBlockT = z.infer<typeof CopyBlock>;
export type MediaSlotT = z.infer<typeof MediaSlot>;
export type ItemT = z.infer<typeof Item>;
export type ServiceT = z.infer<typeof Service>;
export type ProcessStepT = z.infer<typeof ProcessStep>;
export type GalleryItemT = z.infer<typeof GalleryItem>;
