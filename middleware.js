export const config = {
  matcher: '/:path*',
};

const BLOCKED_USER_AGENTS = [
  'chatgpt-user',
  'gptbot',
  'oai-searchbot',
  'claudebot',
  'claude-web',
  'anthropic-ai',
  'anthropic',
  'perplexitybot',
  'google-extended',
  'googleother',
  'applebot-extended',
  'bytespider',
  'ccbot',
  'diffbot',
  'facebookbot',
  'meta-externalagent',
  'meta-externalfetcher',
  'amazonbot',
  'cohere-ai',
  'cohere-training-data-crawler',
  'youbot',
  'omgilibot',
  'timpibot',
  'webzio-extended',
  'imagesiftbot',
  'petalbot',
  'scrapy',
  'python-requests',
  'aiohttp',
  'httpx',
  'go-http-client',
  'wget',
  'curl'
];

export default function middleware(request) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  const isBlocked = BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot));

  if (isBlocked) {
    return new Response(
      '403 Forbidden: Automated access, AI browsing, and bot retrieval are strictly prohibited.',
      {
        status: 403,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Robots-Tag': 'noai, noimageai, noindex, nofollow',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      }
    );
  }
}
