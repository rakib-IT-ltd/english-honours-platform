import type { NextConfig } from 'next';

// GitHub Pages can only serve static files, so the public preview is built as a static export under
// the repository sub-path. Normal development and production builds are unaffected: this is
// switched on only by the Pages workflow (GITHUB_PAGES=true).
const isGithubPages = process.env['GITHUB_PAGES'] === 'true';
const repoName = 'english-honours-platform';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGithubPages && {
    output: 'export',
    basePath: `/${repoName}`,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
