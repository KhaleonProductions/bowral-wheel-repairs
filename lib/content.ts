import raw from '@/content/site.json';
import { SiteSchema, type Site } from './schema';

const parsed = SiteSchema.safeParse(raw);

if (!parsed.success) {
  throw new Error(
    `content/site.json failed validation:\n${JSON.stringify(parsed.error.issues, null, 2)}`,
  );
}

export const site: Site = parsed.data;
