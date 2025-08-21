/** @type {import('next').NextConfig} */
import nextPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';

console.log('API_HOST:', process.env.BE_HOST);
console.log('API_PORT:', process.env.BE_PORT);

const withPWA = nextPWA({
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
      'slash-div',
    ],
  },
  outputFileTracingRoot: import.meta.dirname,
  // Otras opciones de configuración aquí
};

export default withPWA(nextConfig);
