// @ts-ignore
const withFonts = require("next-fonts");

const nextConfig = withFonts({
  webpack(config, options) {
    return config;
  },
  images: {
    domains: ["localhost", "https://zachcohn.sfo3.digitaloceanspaces.com"],
  },
  async redirects() {
    return [
      {
        source: "/resume/lighting-and-video",
        destination:
          "https://docs.google.com/document/d/e/2PACX-1vR42hKiBPp0BEwj27hHM8mVaju2NBCkGMRzjlBMv5nAK3w19reS3RSg4J-OfRFyzJkpwz3RcLWFKthS/pub",
        permanent: false,
      },
    ];
  },
});

module.exports = nextConfig;
