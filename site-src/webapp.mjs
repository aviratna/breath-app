// Turns an Expo web export into the installable web version of Breath at site/app/.
//
//   npx expo export -p web --output-dir dist      (in breath-app/)
//   node site-src/webapp.mjs breath-app/dist site/app
//
// Expo writes root-relative URLs (/_expo/…, /assets/…). They are made relative here, so the
// app works under /breath-app/app/ today and under any other path or domain later.

import fs from 'fs';
import path from 'path';

const [from, to] = process.argv.slice(2);
if (!from || !to) throw new Error('usage: node site-src/webapp.mjs <expo-export-dir> <site-app-dir>');

fs.rmSync(to, { recursive: true, force: true });
fs.cpSync(from, to, { recursive: true });

const relative = (s) => s.replace(/(["'(])\/(_expo|assets)\//g, '$1./$2/');
for (const file of fs.readdirSync(path.join(to, '_expo/static/js/web'))) {
  const p = path.join(to, '_expo/static/js/web', file);
  fs.writeFileSync(p, relative(fs.readFileSync(p, 'utf8')));
}

const meta = `<link rel="icon" href="../favicon.png"/>
    <meta name="description" content="Spend a breath on someone you love. The web version of Breath, for iPhone and computers." />
    <meta name="theme-color" content="#F5F1EA" />
    <link rel="manifest" href="manifest.webmanifest" />
    <link rel="apple-touch-icon" href="../apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Breath" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <style>
      html, body { background: #F5F1EA; }
      /* On a laptop, keep the app phone-shaped in the middle of the window. */
      @media (min-width: 600px) {
        html, body { background: #EAE4DA; }
        #root { max-width: 440px; width: 100%; margin: 0 auto; position: relative; transform: translateZ(0);
          background: #F5F1EA; box-shadow: 0 0 0 1px #E3DDD3, 0 30px 80px -40px rgba(27, 26, 24, 0.35); }
      }
    </style>`;
let html = relative(fs.readFileSync(path.join(to, 'index.html'), 'utf8'));
html = html
  .replace('<link rel="icon" href="./favicon.ico"/>', meta)
  .replace('<link rel="icon" href="/favicon.ico"/>', meta)
  .replace('initial-scale=1, shrink-to-fit=no', 'initial-scale=1, shrink-to-fit=no, viewport-fit=cover');
if (!html.includes('manifest.webmanifest')) throw new Error('could not add the web app manifest to index.html');
fs.writeFileSync(path.join(to, 'index.html'), html);
fs.rmSync(path.join(to, 'favicon.ico'), { force: true });

fs.writeFileSync(
  path.join(to, 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: 'Breath',
      short_name: 'Breath',
      description: 'Spend a breath on someone you love.',
      start_url: './',
      scope: './',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#F5F1EA',
      theme_color: '#F5F1EA',
      icons: [
        { src: '../icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '../apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    null,
    2
  )
);
console.log('web app ready in', to);
