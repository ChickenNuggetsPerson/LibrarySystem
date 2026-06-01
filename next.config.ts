import type { NextConfig } from 'next'

const nextConfig: NextConfig =  {
    experimental: {
        serverActions: {
            bodySizeLimit: '35mb',
        },
    },
    images: {
        domains: ['books.google.com', 'covers.openlibrary.org'],
        localPatterns: [
            {
                pathname: '/library/book/cover/**',
            },
        ],
    },
};

export default nextConfig;