/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: !isProd,
});

const nextConfig = {
  reactStrictMode: true, // Opcional, ya es true por defecto
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: false,
  },
  sassOptions: {
    silenceDeprecations: [
      'color-functions',
      'global-builtin',
      'import',
      'mixed-decls',
      'legacy-js-api',
      'slash-div'
    ]
  },
  // Otras opciones de configuración aquí
};

module.exports = withPWA(nextConfig);
