/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.resolve.alias.canvas = false;
    
      return config;
    },
    experimental: {
        optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
      },
    // swcMinify: false,
};

export default nextConfig;
