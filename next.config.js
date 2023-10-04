// @ts-ignore
const withFonts = require('next-fonts');

const nextConfig = withFonts({
    enableSvg: true,
    webpack(config, options) {
        return config;
    }
});

module.exports = nextConfig;
