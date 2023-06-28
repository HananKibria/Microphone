/** @type {import('next').NextConfig} */
module.exports = {
    async headers() {
      return [
        {
          source: '/:path*{/}?', // this matches all pages
          headers: [
            {
              key: 'Cross-Origin-Embedder-Policy',
              value: 'require-corp',
            },
            {
              key: 'Cross-Origin-Opener-Policy',
              value: 'same-origin',
            },
          ],
        },
      ]
    },
  }
