import 'reflect-metadata';
import '../styles/app.scss';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>React - Boilerplate</title>
        <link rel="shortcut icon" href="/img/icon-logoQ.png" />
        <link rel="apple-touch-icon" href="/img/icon-512.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="A simple todo list application" />
      </head>
      <body>{children}</body>
    </html>
  );
}
