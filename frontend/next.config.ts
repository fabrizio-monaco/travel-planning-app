import type { NextConfig } from 'next';

/**
 * Next.js configuration.
 *
 * For user-uploaded images or images from arbitrary domains, we've switched from
 * using Next.js Image component to standard HTML <img> tags in the Gallery component.
 * This avoids the need to whitelist every possible domain that users might link to.
 *
 * If you need to use Next's Image component with specific external domains in your app,
 * you can add them to the domains array below.
 */
const nextConfig: NextConfig = {
  images: {
    domains: [
      'placehold.co', // Kept for fallback placeholder images
    ],
  },
};

export default nextConfig;
