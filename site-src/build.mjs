// Builds the Breath website into ../site from the content in this folder and the app.
//
//   node site-src/build.mjs
//
// Pages: home, philosophy (English and Hindi), privacy, delete-account, FAQ, invite link,
// 404, plus sitemap.xml and robots.txt. Images, fonts and style.css live in site/ directly.
// The web version of the app (site/app/) is built separately by the Pages workflow.
//
// Moving to your own domain: change SITE (and BASE if it is served from the root), rebuild,
// add site/CNAME, and update SITE_URL in breath-app/src/lib/api.js. See site-src/DOMAIN.md.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PHILOSOPHY } from '../breath-app/src/content/philosophy.js';

export const SITE = 'https://aviratna.github.io/breath-app';
const BASE = new URL(SITE).pathname.replace(/\/$/, '') + '/'; // '/breath-app/'
const APK = 'https://github.com/aviratna/breath-app/releases/latest/download/breath.apk';
const REPO = 'https://github.com/aviratna/breath-app';
const UPDATED = '25 October 2026';

const root = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(root, '..', 'site');

const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const br = (s) => e(s).replace(/\n/g, '<br>');
const mark = (size, stroke = 'currentColor', dot = 'var(--accent)', sw = 1.3) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="${stroke}" stroke-width="${sw}"/><circle cx="12" cy="12" r="2" style="fill:${dot}"/></svg>`;
const downloadIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12M7 11l5 5 5-5M5 20h14"/></svg>';

// ---------------------------------------------------------------------------------------
// Words.

const T = {
  en: {
    nav: { how: 'How it works', idea: 'The idea', faq: 'FAQ', download: 'Download' },
    skip: 'Skip to content',
    footerNote: 'The count is a device for attention, not a medical or actuarial prediction.',
    footer: { privacy: 'Privacy', delete: 'Delete your account', faq: 'FAQ', contact: 'Contact' },
    getAndroid: 'Download for Android',
    getAndroidShort: 'Get Breath for Android',
    openWeb: 'Use it on iPhone or the web',
    home: {
      title: 'Breath: spend a breath on someone you love',
      description: 'Breath keeps a quiet count of the breaths left in your day. Hold a name, and one of them goes to someone you’re thinking of. No messages. No reply expected.',
      eyebrow: 'A contemplative app for Android, iPhone and the web',
      h1: 'Spend a breath on someone you love.',
      lede: 'Breath keeps a quiet count of the breaths left in your day. Hold a name, and one of them goes to someone you’re thinking of. No messages. No reply expected.',
      fine: 'Free · No ads · No tracking · Google Play coming soon',
      dialLabel: 'breaths left today',
      dialNote: 'Your day, live: each dot is a quarter hour. Each time the circle breathes out, one breath is gone — about fifteen a minute, a resting pace.',
      in: 'breathe in', out: 'breathe out',
      dailyEyebrow: 'For today',
      dailyMore: 'Read the idea behind Breath →',
      ideaH2: 'Every being is born with a fixed number of breaths.',
      ideaP: 'An old yogic teaching counts a life not in years, but in breaths, and Buddhist practice returns to the breath as the most present thing we have. To notice one passing is to notice a little of a life passing with it. Breath borrows that attention, gently.',
      howEyebrow: 'How it works', howH2: 'Say it without saying anything.',
      steps: [
        ['Invite your people', 'Share a link over WhatsApp or anywhere. When they open it, you’re connected. No phone numbers, no contact uploads.', 'invite', 'The invite screen with a six-letter invite code and a Share invite link button.'],
        ['Hold a name', 'A ring fills as you hold. Let go to cancel. Each gift costs one of your own breaths, which is what makes it sincere.', 'hold', 'Holding a name: a ring fills around the person’s initial, with Keep holding underneath.'],
        ['They simply know', 'They see that you spent a breath on them. They can just smile, or breathe one back. There is no thread to keep up.', 'received', 'Receiving: Mom spent a breath on you, a few minutes ago. No reply needed.'],
      ],
      principles: [
        ['Just a name', 'No email, phone number or password. Only the people you connect with can see you.'],
        ['Quiet by design', 'No feeds, likes, streaks or ads. Nothing asks for your attention except the people you love.'],
        ['Yours to control', 'Block anyone, and they won’t be told. Delete your account and everything with it, any time.'],
      ],
      privacyLink: 'Privacy policy',
      dlH2: 'Today still has thousands of breaths in it.',
      dlP: 'Spend one well.',
      dlSmall: 'Free. Android 7 or newer, or any modern browser.',
      today: (n) => `About ${n} breaths left today.`,
    },
  },
};

// ---------------------------------------------------------------------------------------
// Page frame

function head({ lang, title, description, page, depth, noindex, jsonld, ogTitle, ogDescription }) {
  const rel = '../'.repeat(depth);
  const url = SITE + '/' + page;
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(title)}</title>
  <meta name="description" content="${e(description)}">
  <meta name="theme-color" content="#F5F1EA" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#161514" media="(prefers-color-scheme: dark)">
  <meta name="color-scheme" content="light dark">${noindex ? '\n  <meta name="robots" content="noindex">' : `\n  <link rel="canonical" href="${url}">`}
  <meta property="og:site_name" content="Breath">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${e(ogTitle || title)}">
  <meta property="og:description" content="${e(ogDescription || description)}">
  <meta property="og:image" content="${SITE}/og.png">
  <meta property="og:image:width" content="1024">
  <meta property="og:image:height" content="500">
  <meta property="og:image:alt" content="Breath: a quiet ring and dot on linen.">
  <meta property="og:locale" content="en_GB">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${rel}favicon.png">
  <link rel="apple-touch-icon" href="${rel}apple-touch-icon.png">
  <link rel="preload" href="${rel}fonts/newsreader-latin-standard-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${rel}fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${rel}style.css">${jsonld ? `\n  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>`;
}

function header(lang, depth, current) {
  const rel = '../'.repeat(depth);
  const t = T[lang].nav;
  const home = rel;
  const cur = (k) => (current === k ? ' aria-current="page"' : '');
  return `  <a class="skip" href="#main">${T[lang].skip}</a>
  <div class="wrap">
    <header class="top">
      <a class="brand" href="${home}" aria-label="Breath home">
        ${mark(28, 'currentColor')}
        <span>Breath</span>
      </a>
      <nav aria-label="Main">
        <a class="hide-sm" href="${home}#how">${t.how}</a>
        <a href="${home}philosophy/"${cur('idea')}>${t.idea}</a>
        <a class="hide-sm" href="${rel}faq/"${cur('faq')}>${t.faq}</a>
        <a class="btn small" href="${home}#download">${t.download}</a>
      </nav>
    </header>
  </div>`;
}

function footer(lang, depth) {
  const rel = '../'.repeat(depth);
  const t = T[lang];
  return `  <div class="wrap">
    <footer>
      <div class="note">
        ${mark(22, 'currentColor')}
        ${t.footerNote}
      </div>
      <nav aria-label="Footer">
        <a href="${rel}privacy/">${t.footer.privacy}</a>
        <a href="${rel}delete-account/">${t.footer.delete}</a>
        <a href="${rel}faq/">${t.footer.faq}</a>
        <a href="${REPO}/issues">${t.footer.contact}</a>
      </nav>
    </footer>
  </div>`;
}

function write(rel, html) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html.replace(/[ \t]+\n/g, '\n'));
}

// ---------------------------------------------------------------------------------------
// Quotes for "For today": every quote on the philosophy page, in page order.

function dailyQuotes(lang) {
  const out = [];
  PHILOSOPHY.sections.forEach((s, si) => {
    (s.quotes || []).forEach((q, qi) => {
      out.push({
        original: q.original ? q.original.split('\n')[0].replace(/[;,]\s*$/, '') + (q.original.includes('\n') ? ' …' : '') : '',
        script: q.script || (q.original ? 'latn' : ''),
        text: q.translation,
        source: q.source,
      });
    });
  });
  return out;
}

// ---------------------------------------------------------------------------------------
// Home

function dialSvg() {
  const DOTS = 96, size = 440, c = size / 2, r = c - 18;
  let dots = '';
  for (let i = 0; i < DOTS; i++) {
    const a = (i / DOTS) * 2 * Math.PI - Math.PI / 2;
    dots += `<circle cx="${(c + r * Math.cos(a)).toFixed(1)}" cy="${(c + r * Math.sin(a)).toFixed(1)}" r="4.4"/>`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><g class="dots" fill="currentColor" opacity="0.9">${dots}</g></svg>`;
}

function home(lang) {
  const t = T[lang], h = t.home;
  const depth = 0;
  const rel = '../'.repeat(depth);
  const page = '';
  const quotes = dailyQuotes(lang);
  const q0 = quotes[0];
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Breath',
    url: SITE + '/',
    description: T.en.home.description,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Android, Web',
    downloadUrl: APK,
    image: SITE + '/icon.png',
    inLanguage: 'en',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  const step = ([title, body, img, altText], i) => `        <div class="step">
          <div class="stage"><div class="phone"><img src="${rel}img/${img}.jpg" width="585" height="1266" loading="lazy" alt="${e(altText)}"></div></div>
          <div class="text"><div class="n">0${i + 1}</div><div><h3>${title}</h3><p>${body}</p></div></div>
        </div>`;
  return `${head({ lang, title: h.title, description: h.description, page, depth, jsonld, ogTitle: 'Breath', ogDescription: 'Spend a breath on someone you love. No messages. No reply expected.' })}
<body>
${header(lang, depth, 'home')}

  <div class="wrap">
    <main id="main">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">${h.eyebrow}</p>
          <h1>${h.h1}</h1>
          <p class="lede">${h.lede}</p>
          <div class="ctas">
            <a class="btn" href="${APK}">${downloadIcon} ${t.getAndroid}</a>
            <a class="btn ghost" href="${rel}app/">${t.openWeb}</a>
          </div>
          <p class="fine">${h.fine}</p>
        </div>
        <div class="hero-dial">
          <figure style="margin:0">
            <div class="dial" role="img" id="dial" aria-label="${e(h.dialLabel)}">
              ${dialSvg()}
              <div class="halo"></div>
              <div class="center">
                <div class="cue" id="cue" aria-hidden="true">${h.in}</div>
                <div class="count" id="count">&nbsp;</div>
                <div class="label">${h.dialLabel}</div>
              </div>
            </div>
            <figcaption class="dial-note">${h.dialNote}</figcaption>
          </figure>
        </div>
      </section>
    </main>
  </div>

  <section class="daily" aria-labelledby="daily-h">
    <div class="wrap">
      <p class="eyebrow" id="daily-h">${h.dailyEyebrow}</p>
      <blockquote id="daily">
        <p class="orig ${q0.script}"${q0.original ? '' : ' hidden'}>${e(q0.original)}</p>
        <p class="q">“${e(q0.text)}”</p>
        <cite>${e(q0.source)}</cite>
      </blockquote>
      <a class="more" href="philosophy/">${h.dailyMore}</a>
    </div>
  </section>

  <section class="idea">
    <div class="inner">
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="#EFEAE0" stroke-width="1.4"/><circle cx="32" cy="32" r="4" fill="#8CC3CF"/></svg>
      <h2>${h.ideaH2}</h2>
      <p>${h.ideaP}</p>
      <a class="more" href="philosophy/">${h.dailyMore}</a>
    </div>
  </section>

  <div class="wrap">
    <section class="how" id="how">
      <p class="eyebrow">${h.howEyebrow}</p>
      <h2>${h.howH2}</h2>
      <div class="steps">
${h.steps.map(step).join('\n')}
      </div>
    </section>

    <section class="principles" id="privacy">
      <div class="grid">
${h.principles.map(([a, b], i) => `        <div><h3>${a}</h3><p>${b}${i === 2 ? ` <a href="${rel}privacy/">${h.privacyLink}</a>` : ''}</p></div>`).join('\n')}
      </div>
    </section>

    <section class="download" id="download">
      <div class="box">
        <div>
          <h2>${h.dlH2}</h2>
          <p>${h.dlP}</p>
        </div>
        <div class="get">
          <a class="btn" href="${APK}">${downloadIcon} ${t.getAndroid}</a>
          <a class="btn ghost" href="${rel}app/">${t.openWeb}</a>
          <small>${h.dlSmall} <span id="today"></span></small>
        </div>
      </div>
    </section>
  </div>

${footer(lang, depth)}
  <script>
    // The same estimate as the app: about 15 breaths a minute until local midnight,
    // drawn as 96 quarter-hour dots (spent ones fade, the current one glows).
    (function () {
      var QUOTES = ${JSON.stringify(quotes)};
      var IN = ${JSON.stringify(h.in)}, OUT = ${JSON.stringify(h.out)}, LOCALE = undefined;
      var dots = document.querySelectorAll('#dial .dots circle');
      // One breath every 4 seconds on the wall clock (1.6 s in, 2.4 s out), exactly as in the
      // app: the count falls by one as each out-breath ends.
      var BREATH = 4000, INHALE = 1600;
      function left(now) {
        var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return Math.floor((midnight - now) / BREATH);
      }
      function draw() {
        var now = new Date();
        var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var cur = Math.min(95, Math.floor((now - start) / 864e5 * 96));
        for (var i = 0; i < dots.length; i++) {
          dots[i].setAttribute('opacity', i < cur ? '0.18' : '1');
          dots[i].setAttribute('class', i === cur ? 'now' : '');
          dots[i].setAttribute('r', i === cur ? '6.5' : '4.4');
        }
        var n = left(now).toLocaleString(LOCALE);
        document.getElementById('count').textContent = n;
        document.getElementById('dial').setAttribute('aria-label', ${JSON.stringify(h.dialLabel)} + ': ' + n);
        document.getElementById('today').textContent = (${h.today.toString()})(n);
      }
      var cue = document.getElementById('cue');
      var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Start the halo's 4 s CSS cycle at the clock's current point in the breath.
      document.querySelector('#dial .halo').style.animationDelay = -(Date.now() % BREATH) + 'ms';
      (function tick() {
        var p = Date.now() % BREATH, inhaling = p < INHALE;
        if (!still) cue.textContent = inhaling ? IN : OUT;
        if (p < 50) draw();
        setTimeout(tick, (inhaling ? INHALE : BREATH) - p + 5);
      })();
      draw();

      // A different line each day, the same for everyone that day.
      var now = new Date();
      var day = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5) + now.getFullYear() * 366;
      var q = QUOTES[day % QUOTES.length], box = document.getElementById('daily');
      var orig = box.querySelector('.orig');
      orig.textContent = q.original; orig.hidden = !q.original; orig.className = 'orig ' + q.script;
      box.querySelector('.q').textContent = '“' + q.text + '”';
      box.querySelector('cite').textContent = q.source;
    })();
  </script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------------------
// Philosophy

function philosophy(lang) {
  const P = PHILOSOPHY;
  const depth = 1;
  const rel = '../'.repeat(depth);
  const page = 'philosophy/';
  const quote = (q, hq) => {
    const lang2 = q.script === 'tibt' ? 'bo' : q.script === 'deva' ? 'sa' : 'pi';
    const cls = q.script === 'tibt' ? 'orig tibt' : q.script === 'deva' ? 'orig deva' : 'orig latn';
    const tr = hq ? hq.translation : q.translation;
    const src = hq ? hq.source : q.source;
    return `      <blockquote>
${q.original ? `        <p class="${cls}" lang="${lang2}">${br(q.original)}</p>\n` : ''}${q.translit ? `        <p class="translit" lang="${lang2}-Latn">${br(q.translit)}</p>\n` : ''}        <p class="translation">“${e(tr)}”</p>
        <cite>${e(src)}</cite>
      </blockquote>`;
  };
  const sections = PHILOSOPHY.sections
    .map((en, si) => {
      const s = P.sections[si];
      const quotes = (en.quotes || []).map((q) => quote(q, null));
      return `    <section${s.founder ? ' class="founder"' : ''}>
${s.founder ? `      <p class="eyebrow">A note from the founder</p>\n` : ''}      <h2>${e(s.heading)}</h2>
${s.body.map((t) => `      <p>${e(t)}</p>`).join('\n')}
${quotes.join('\n')}
${(s.after || []).map((t) => `      <p>${e(t)}</p>`).join('\n')}
${s.founder ? `      <p class="signature">— ${e(s.founder)}</p>` : ''}
    </section>`;
    })
    .join('\n\n');
  const title = 'The idea behind Breath';
  const description =
    'Every being is born with a fixed number of breaths. The yogic, Buddhist and Tibetan ideas behind Breath, with the original Sanskrit, Pāli and Tibetan.';
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: P.title,
    description,
    inLanguage: lang,
    url: SITE + '/' + page,
    image: SITE + '/og.png',
    author: { '@type': 'Organization', name: 'Breath', url: SITE + '/' },
    publisher: { '@type': 'Organization', name: 'Breath', logo: { '@type': 'ImageObject', url: SITE + '/icon.png' } },
  };
  return `${head({ lang, title, description, page, depth, jsonld, ogDescription: 'A life counted in breaths, and why Breath lets you give one away.' })}
<body>
${header(lang, depth, 'idea')}

  <main class="essay" id="main">
    <p class="eyebrow">${e(P.eyebrow)}</p>
    <h1>${e(P.title)}</h1>
    <p class="essay-lede">${e(P.intro)}</p>

${sections}

    <p class="essay-note">${e(P.note)}</p>
    <div class="essay-end">
      ${mark(44, 'currentColor')}
      <a class="btn" href="../#download">${T[lang].getAndroidShort}</a>
    </div>
  </main>

${footer(lang, depth)}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------------------
// Privacy and account deletion, rendered from the Markdown files at the repo root so the
// two never drift apart.

function inline(s) {
  return e(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\W)_(.+?)_(?=\W|$)/g, '$1<em>$2</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, (m, a, href) => `<a href="${href === 'DELETE-ACCOUNT.md' ? '../delete-account/' : href === 'PRIVACY.md' ? '../privacy/' : href}">${a}</a>`)
    .replace(/(^|[\s(])(https:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>');
}

function markdown(md) {
  const lines = md.split('\n');
  let html = '', i = 0, h1 = '';
  const para = [];
  const flush = () => { if (para.length) { html += `    <p>${inline(para.join(' '))}</p>\n`; para.length = 0; } };
  while (i < lines.length) {
    const l = lines[i];
    if (/^# /.test(l)) { flush(); h1 = l.slice(2).replace(/^Breath — /, ''); i++; continue; }
    if (/^## /.test(l)) { flush(); html += `    <h2>${inline(l.slice(3))}</h2>\n`; i++; continue; }
    if (/^\|/.test(l)) {
      flush();
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      html += '    <div class="table-scroll"><table>\n      <thead><tr>' + cells(rows[0]).map((c) => `<th scope="col">${inline(c)}</th>`).join('') + '</tr></thead>\n      <tbody>\n';
      rows.slice(2).forEach((r) => { html += '        <tr>' + cells(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>\n'; });
      html += '      </tbody>\n    </table></div>\n';
      continue;
    }
    if (/^(- |\d+\. )/.test(l)) {
      flush();
      const ordered = /^\d/.test(l);
      const items = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) {
        let item = lines[i++].replace(/^(- |\d+\. )/, '');
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) item += ' ' + lines[i++].trim();
        items.push(item);
      }
      html += `    <${ordered ? 'ol' : 'ul'}>\n${items.map((it) => `      <li>${inline(it)}</li>`).join('\n')}\n    </${ordered ? 'ol' : 'ul'}>\n`;
      continue;
    }
    if (!l.trim()) { flush(); i++; continue; }
    para.push(l.trim());
    i++;
  }
  flush();
  return { h1, html };
}

function docPage(file, page, title, description) {
  const md = fs.readFileSync(path.join(root, '..', file), 'utf8').replace(/^_Last updated: (.+)_$/m, '<<updated:$1>>');
  let { html } = markdown(md);
  html = html.replace(/<p>&lt;&lt;updated:(.+?)&gt;&gt;<\/p>/, '<p class="updated">Last updated: $1</p>');
  return `${head({ lang: 'en', title: `${title} · Breath`, description, page, depth: 1 })}
<body>
${header('en', 1, page)}

  <main class="essay" id="main">
    <p class="eyebrow">Breath</p>
    <h1>${title}</h1>
${html}  </main>

${footer('en', 1)}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------------------
// FAQ

const FAQ = [
  ['What is Breath?', 'A quiet app that shows an estimate of the breaths left in your day, and lets you spend one on someone you love. They see that you thought of them. There are no messages to write and no reply is expected.'],
  ['Is the count real?', 'It is a contemplative estimate: about fifteen breaths a minute from now until midnight, less the breaths you have given today. It does not measure your breathing and it is not a prediction of anything. It is a device for attention. <a href="../philosophy/">Read the idea behind it</a>.'],
  ['How do I connect with someone?', 'In the app, tap <b>Invite someone</b> and share your link over WhatsApp, SMS or anywhere. When they open it and set up Breath, you are connected. You can also type each other’s six-letter code. Breath never reads your contacts.'],
  ['Does the other person need the app?', 'Yes, but it doesn’t have to be on Android. On an iPhone or a computer they can use <a href="../app/">Breath on the web</a> — the invite link takes them there.'],
  ['Is there an iPhone app?', 'Not yet. Use <a href="../app/">Breath on the web</a> in Safari, then tap <b>Share → Add to Home Screen</b> to keep it like an app. An App Store version is planned.'],
  ['How do I install the Android app?', 'Tap <a href="' + APK + '">Download for Android</a> and open the file. Android may ask you to allow installs from your browser the first time — that is normal for apps from outside Google Play. Google Play is coming soon.'],
  ['Will I be notified when someone gives me a breath?', 'Yes, on Android, if you allow notifications when the app asks. Tapping the notification opens the breath. The web version shows breaths when you open it.'],
  ['Can I send a message with a breath?', 'No, and that is on purpose. A breath says “I thought of you” without asking anything back.'],
  ['What if I block someone?', 'They are not told. They simply can no longer send you breaths or see your notification address. You can unblock them in Settings.'],
  ['What does Breath know about me?', 'Only the name you type, an anonymous account ID, your invite code, your connections and the breaths you receive. No email, phone number, contacts, location or ads. <a href="../privacy/">Privacy policy</a>.'],
  ['How do I delete my account?', 'In the app: <b>Settings → Account → delete my account</b>. Everything is removed immediately. <a href="../delete-account/">Other options</a>.'],
  ['Is it free?', 'Yes. No ads, no subscriptions, no in-app purchases.'],
];

function faq() {
  const strip = (s) => s.replace(/<[^>]+>/g, '');
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })),
  };
  return `${head({ lang: 'en', title: 'Questions · Breath', description: 'Answers about Breath: how the count works, connecting with people, the iPhone and web version, notifications, privacy and deleting your account.', page: 'faq/', depth: 1, jsonld })}
<body>
${header('en', 1, 'faq')}

  <main class="essay faq" id="main">
    <p class="eyebrow">Breath</p>
    <h1>Questions</h1>
    <p class="essay-lede">Short answers to what people ask most.</p>
${FAQ.map(([q, a], i) => `    <details${i === 0 ? ' open' : ''}>
      <summary>${q}</summary>
      <div><p>${a}</p></div>
    </details>`).join('\n')}
    <p class="essay-note">Something else? <a href="${REPO}/issues">Ask us</a>.</p>
  </main>

${footer('en', 1)}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------------------
// Invite link page: /join/?c=CODE

function join() {
  const [projectId, apiKey] = ['breath-17213', 'AIzaSyBu26g29oVjswOdabRoBSZS-Mtx7AKBGTE'];
  return `${head({ lang: 'en', title: 'You’ve been given a breath · Breath', description: 'Someone you know would like to give you a breath.', page: 'join/', depth: 1, noindex: true, ogTitle: 'I’d like to give you a breath', ogDescription: 'Breath is a quiet way to tell someone you were thinking of them. Tap to connect.' })}
<body>
  <main class="join" id="main">
    <header class="top">
      <a class="brand" href="../" aria-label="About Breath">
        ${mark(24, 'currentColor', 'var(--accent)', 1.4)}
        <span style="font-size:22px">Breath</span>
      </a>
    </header>

    <div id="valid" class="hide" style="flex-direction:column;flex:1">
      <div class="who" id="who" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="32" cy="32" r="4.5" fill="currentColor"/></svg>
      </div>
      <h1 id="title">Someone would like to give you a breath</h1>
      <p>Breath is a quiet way to tell someone you were thinking of them. No messages, no reply expected.</p>

      <div class="actions">
        <a class="btn" id="primary" href="#">Open in Breath</a>
        <a class="btn ghost" id="secondary" href="${APK}">Get Breath for Android</a>
        <a id="tertiary" href="#" style="padding:10px;font-size:15px">Or use Breath on the web</a>
        <div class="code-label" id="code-label">After installing, tap <b>Open in Breath</b> again, or enter this code</div>
        <div class="code" id="code"></div>
      </div>
    </div>

    <div id="invalid" class="hide" style="flex-direction:column;flex:1">
      <h1>This invite link isn’t complete</h1>
      <p>Ask for the link again, or for their six-letter code.</p>
      <div class="actions"><a class="btn ghost" href="../">About Breath</a></div>
    </div>
  </main>
  <script>
    (function () {
      var params = new URLSearchParams(location.search);
      var code = (params.get('c') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      function show(id) { var el = document.getElementById(id); el.className = ''; el.style.display = 'flex'; }
      if (code.length !== 6) return show('invalid');
      show('valid');
      document.getElementById('code').textContent = code;
      var web = '../app/?join=' + code;

      // Who sent it: the inviter's name is public for anyone holding the code.
      fetch('https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/invites/' + code + '?key=${apiKey}')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          var name = d && d.fields && d.fields.name && d.fields.name.stringValue;
          if (!name) return;
          document.getElementById('title').textContent = name + ' would like to give you a breath';
          document.title = name + ' would like to give you a breath · Breath';
          var who = document.getElementById('who');
          who.textContent = Array.from(name.trim())[0].toUpperCase();
        })
        .catch(function () {});

      var android = /Android/i.test(navigator.userAgent);
      var primary = document.getElementById('primary'), secondary = document.getElementById('secondary'), tertiary = document.getElementById('tertiary');
      if (android) {
        // An intent link opens the app if it's installed and comes back here otherwise.
        var fallback = location.origin + location.pathname + '?c=' + code + '&nf=1';
        var appLink = 'intent://join/' + code + '#Intent;scheme=breath;package=com.givebreath.app;S.browser_fallback_url=' + encodeURIComponent(fallback) + ';end';
        primary.href = appLink;
        tertiary.href = web;
        // Try the app once automatically, unless we just came back because it isn't installed.
        if (!params.get('nf')) location.href = appLink;
      } else {
        // iPhone and computers: the web version of Breath, already holding the code.
        primary.textContent = 'Open Breath';
        primary.href = web;
        secondary.textContent = 'I’m on Android: get the app';
        tertiary.style.display = 'none';
        document.getElementById('code-label').textContent = 'Your invite code';
      }
    })();
  </script>
</body>
</html>
`;
}

function notFound() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Not found · Breath</title>
  <meta name="robots" content="noindex">
  <meta name="color-scheme" content="light dark">
  <link rel="icon" href="${BASE}favicon.png">
  <link rel="stylesheet" href="${BASE}style.css">
</head>
<body>
  <main class="join">
    <header class="top"><a class="brand" href="${BASE}"><span style="font-size:22px">Breath</span></a></header>
    <h1>Nothing here.</h1>
    <p>Just a quiet moment.</p>
    <div class="actions"><a class="btn ghost" href="${BASE}">Go to Breath</a></div>
  </main>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------------------

const pages = [
  ['index.html', home('en'), ''],
  ['philosophy/index.html', philosophy('en'), 'philosophy/'],
  ['faq/index.html', faq(), 'faq/'],
  ['privacy/index.html', docPage('PRIVACY.md', 'privacy/', 'Privacy policy', 'What Breath stores, why, and who can see it. No ads, no tracking, no contacts.'), 'privacy/'],
  ['delete-account/index.html', docPage('DELETE-ACCOUNT.md', 'delete-account/', 'Delete your account', 'How to delete your Breath account and everything stored with it.'), 'delete-account/'],
  ['join/index.html', join(), null],
  ['404.html', notFound(), null],
];
for (const [file, html] of pages) write(file, html);

const today = new Date().toISOString().slice(0, 10);
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .filter((p) => p[2] !== null)
  .map(([, , p]) => `  <url><loc>${SITE}/${p}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}
</urlset>
`
);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: ${BASE}join/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('built', pages.length, 'pages into', path.relative(process.cwd(), OUT) || '.');
