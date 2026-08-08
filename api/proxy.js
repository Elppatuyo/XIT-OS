export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({
        error: "Falta la URL"
      });
    }

    const target = new URL(targetUrl);

    // Solo HTTP/HTTPS
    if (!["http:", "https:"].includes(target.protocol)) {
      return res.status(400).json({
        error: "Protocolo no permitido"
      });
    }

    const hostname = target.hostname.toLowerCase();

    // Bloquear destinos locales
    const blockedHosts = [
      "localhost",
      "localhost.localdomain",
      "metadata.google.internal",
      "metadata.google"
    ];

    if (
      blockedHosts.includes(hostname) ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local")
    ) {
      return res.status(403).json({
        error: "Destino bloqueado"
      });
    }

    // Bloquear rangos IPv4 privados comunes
    const privateRanges = [
      /^127\./,
      /^10\./,
      /^192\.168\./,
      /^169\.254\./,
      /^172\.(1[6-9]|2\d|3[0-1])\./
    ];

    if (privateRanges.some(regex => regex.test(hostname))) {
      return res.status(403).json({
        error: "Dirección privada bloqueada"
      });
    }

    const response = await fetch(target.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "WebOS11/1.0"
      }
    });

    const contentType =
      response.headers.get("content-type") ||
      "application/octet-stream";

    const data = Buffer.from(
      await response.arrayBuffer()
    );

    res.status(response.status);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-store");

    return res.send(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error del proxy",
      message: error.message
    });
  }
}
