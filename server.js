const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

// Patterns matching AI scrapers, chat browsing agents, and automated crawlers
const AI_BOT_REGEX = /(ChatGPT-User|GPTBot|OAI-SearchBot|ClaudeBot|Claude-Web|Anthropic-AI|PerplexityBot|Google-Extended|Applebot-Extended|Bytespider|CCBot|Diffbot|FacebookBot|meta-externalagent|Meta-ExternalFetcher|Amazonbot|Cohere-ai|cohere-training|YouBot|Omgilibot|Timpibot|Webzio-Extended|ImagesiftBot|PetalBot|Scrapy|python-requests|aiohttp|httpx|Go-http-client|Wget|HeadlessChrome|PhantomJS)/i;

const server = http.createServer((req, res) => {
  const userAgent = req.headers['user-agent'] || '';

  // Intercept and block all AI bots and AI chat link-retrieval agents
  if (AI_BOT_REGEX.test(userAgent)) {
    res.writeHead(403, {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noai, noimageai, noindex, nofollow',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    });
    res.end('403 Forbidden: Automated access, AI browsing, and bot retrieval are strictly prohibited.');
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let reqPath = decodeURIComponent(parsedUrl.pathname);

  // Normalize path
  let safePath = path.normalize(path.join(PUBLIC_DIR, reqPath));

  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check if target is directory
  fs.stat(safePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      safePath = path.join(safePath, 'index.html');
    }

    fs.readFile(safePath, (readErr, data) => {
      if (readErr) {
        // Check if this might be a CDN asset from framerusercontent
        const basename = path.basename(reqPath);
        if (basename.endsWith('.mjs') || basename.endsWith('.js') || basename.endsWith('.json') || basename.endsWith('.woff2')) {
          const cdnUrl = 'https://framerusercontent.com/sites/QyIO6H9mWHHMAsQPzp7EZ/' + basename;
          https.get(cdnUrl, (cdnRes) => {
            if (cdnRes.statusCode === 200) {
              const ext = path.extname(basename).toLowerCase();
              res.writeHead(200, {
                'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
                'Cache-Control': 'no-cache'
              });
              cdnRes.pipe(res);
              return;
            }
            send404();
          }).on('error', () => {
            send404();
          });
          return;
        }

        send404();
        return;
      }

      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Robots-Tag': 'noai, noimageai'
      });
      res.end(data);
    });
  });

  function send404() {
    const notFoundPath = path.join(PUBLIC_DIR, '404', 'index.html');
    fs.readFile(notFoundPath, (err404, data404) => {
      if (!err404) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data404);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`Preview server running at http://localhost:${PORT}/`);
});
