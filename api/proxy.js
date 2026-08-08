module.exports = async function handler(req, res) {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({
        error: "Falta la URL"
      });
    }

    const target = new URL(targetUrl);

    if (!["http:", "https:"].includes(target.protocol)) {
      return res.status(400).json({
        error: "Solo se permiten HTTP y HTTPS"
      });
    }

    const response = await fetch(target.href, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "WebOS-11"
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
      error: "Error del proxy"
    });
  }
};
