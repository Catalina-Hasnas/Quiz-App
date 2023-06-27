/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/quizzes/page/1",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
