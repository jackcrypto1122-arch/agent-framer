module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noai, noimageai, noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.status(403).send('403 Forbidden: AI bots, scrapers, and automated chat retrieval are strictly prohibited.');
};
