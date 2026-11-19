// The Lexical harness reads and uploads files through `/ipfs` on its own origin (a dev-server stand-in in the
// spike). Reads are proxied to a Seed site's gateway; uploads have nowhere to go on a static site.
const GATEWAYS = ['https://seed.horacioh.com', 'https://hyper.media']

export default {
  /** Serves `/ipfs/*`; every other path is a static asset and never reaches the Worker. */
  async fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return Response.json({error: 'Uploads are not available in the public explorations.'}, {status: 501})
    }
    const {pathname} = new URL(request.url)
    let gateway = GATEWAYS[0]
    try {
      const site = new URL(request.headers.get('referer') ?? '').searchParams.get('site')
      if (site && GATEWAYS.includes(site)) gateway = site
    } catch {}
    const range = request.headers.get('range')
    const upstream = await fetch(gateway + pathname, {method: request.method, headers: range ? {range} : {}})
    return new Response(upstream.body, upstream)
  },
}
