// @ts-ignore
const withFonts = require('next-fonts');

const nextConfig = withFonts({
    webpack(config, options) {
        return config;
    },
    images: {
        domains: ['localhost', 'https://zachcohn.sfo3.digitaloceanspaces.com'],
    }
});

module.exports = nextConfig;
