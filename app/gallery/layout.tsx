import type { Metadata } from 'next';
import { site } from '@/lib/content';

// The gallery page is a client component for its filter, so its metadata
// lives here instead.
export const metadata: Metadata = {
  title: site.seo.gallery.title,
  description: site.seo.gallery.description,
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
