/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dehznhwfarqhzusngwbr.supabase.co',
      },
    ],
  },
}

export default nextConfig
