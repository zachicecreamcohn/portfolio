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
          "https://docs.google.com/document/d/1eN_pMOG4Rz2iXEkLVxvSXaXTNk_DsOvEr194x6ckBiA/edit?tab=t.0",
        permanent: false,
      },
    ];
  },
});

module.exports = nextConfig;
