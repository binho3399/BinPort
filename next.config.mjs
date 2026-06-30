/** @type {import('next').NextConfig} */
import path from 'node:path';

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(process.cwd()),
  experimental: {
    optimizePackageImports: [
      'three',
      '@react-three/drei',
      '@react-three/fiber',
      'gsap',
      'lucide-react',
    ],
  },
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
