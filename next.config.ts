import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
       { // Allow QR code images
           protocol: 'https',
           hostname: 'api.qrserver.com',
           port: '',
           pathname: '/v1/create-qr-code/**',
       },
        // Add other allowed image hostnames if needed (e.g., Firebase Storage)
        // {
        //   protocol: 'https',
        //   hostname: 'firebasestorage.googleapis.com',
        //   port: '',
        //   pathname: '/**',
        // },
    ],
  },
};

export default nextConfig;
