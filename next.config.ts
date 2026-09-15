import type { NextConfig } from 'next';

/**
 * turbopack.root pins the workspace root to this directory. Without it,
 * Next 16 can walk up to a parent lockfile and resolve node_modules to a
 * path "outside the filesystem root", which crashes Turbopack. Cheap
 * insurance against a confusing future failure.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
