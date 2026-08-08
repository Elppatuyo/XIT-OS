export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      error: "Missing url parameter"
    });
  }

  let target;

  try {
    target = new URL(url);
  } catch {
    return res.status(400).json({
      error: "Invalid URL"
    });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return res.status(400).json({
      error: "Only HTTP/HTTPS allowed"
    });
  }

  try {
    const response = await fetch(target.href, {
      redirect: "follow",
      headers: {
        "User-Agent": "WebOS11/1.0"
      }
    });

    const contentType =
      response.headers.get("content-type") ||
      "application/octet-stream";

    const buffer = Buffer.from(
      await response.arrayBuffer()
    );

    res.status(response.status);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-store");

    return res.send(buffer);

  } catch (error) {
    return res.status(502).json({
      error: "Proxy request failed",
      message: error.message
    });
  }
}
