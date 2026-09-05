export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname; // ex: colegiodemo.propinas.online

    let subdomain = null;
    if (host.endsWith('.propinas.online')) {
      const prefix = host.slice(0, -('.propinas.online'.length));
      if (prefix && prefix !== 'www') {
        subdomain = prefix;
      }
    }

    if (subdomain) {
      // Reescreve o pedido para dentro da pasta da escola, ex: /colegiodemo/index.html
      const newUrl = new URL(request.url);
      newUrl.pathname = `/${subdomain}${url.pathname}`;
      const newRequest = new Request(newUrl.toString(), request);
      const response = await env.ASSETS.fetch(newRequest);

      // O Cloudflare por vezes responde com um redirect (ex: /pasta/index.html -> /pasta/).
      // Esse redirect já inclui o prefixo da escola que acabámos de acrescentar — sem esta
      // correcção, o browser mostraria o prefixo duplicado (ex: /colegiodemo/colegiodemo/...)
      if ([301, 302, 307, 308].includes(response.status)) {
        const location = response.headers.get('Location');
        if (location) {
          const locUrl = new URL(location, newUrl);
          const prefix = `/${subdomain}/`;
          if (locUrl.pathname.startsWith(prefix)) {
            locUrl.pathname = '/' + locUrl.pathname.slice(prefix.length);
          } else if (locUrl.pathname === `/${subdomain}`) {
            locUrl.pathname = '/';
          }
          const newHeaders = new Headers(response.headers);
          newHeaders.set('Location', locUrl.pathname + locUrl.search);
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
          });
        }
      }

      return response;
    }

    // Sem subdomínio (propinas.online ou www.propinas.online) — serve a Landing Page tal como está, na raiz
    return env.ASSETS.fetch(request);
  }
};