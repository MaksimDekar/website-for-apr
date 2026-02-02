/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'YOUR_PROJECT_ID.supabase.co',
      },
    ],
  },
}

export default nextConfig
