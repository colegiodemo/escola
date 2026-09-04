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
      return env.ASSETS.fetch(newRequest);
    }

    // Sem subdomínio (propinas.online ou www.propinas.online) — serve a Landing Page tal como está, na raiz
    return env.ASSETS.fetch(request);
  }
};
