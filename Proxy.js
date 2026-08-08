export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({
        error: "Falta la URL"
      });
    }

    const url = new URL(targetUrl);

    if (!["http:", "https:"].includes(url.protocol)) {
      return res.status(400).json({
        error: "Protocolo no permitido"
      });
    }

    // Bloquear destinos locales/privados.
    const host = url.hostname.toLowerCase();

    const blocked = [
      "localhost",
      "localhost.localdomain",
      "metadata.google.internal",
      "metadata.google"
    ];

    if (
      blocked.includes(host) ||
      host.endsWith(".localhost") ||
      host.endsWith(".local")
    ) {
      return res.status(403).json({
        error: "Destino bloqueado"
      });
    }

    const privateIP = [
      /^127\./,
      /^10\./,
      /^192\.168\./,
      /^169\.254\./,
      /^172\.(1[6-9]|2\d|3[0-1])\./
    ];

    if (
      privateIP.some(regex => regex.test(host))
    ) {
      return res.status(403).json({
        error: "Dirección privada bloqueada"
      });
    }

    const response = await fetch(url.toString(), {
      redirect: "follow",
      headers: {
        "User-Agent": "WebOS11/1.0"
      }
    });

    const contentType =
      response.headers.get("content-type") ||
      "application/octet-stream";

    const data =
      Buffer.from(
        await response.arrayBuffer()
      );

    res.status(response.status);

    res.setHeader(
      "Content-Type",
      contentType
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.send(data);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "No se pudo conectar con el destino"
    });

  }
}
