/** HTTP/JSON entre microservicios con límite de tiempo configurable. */
export async function call(
  base,
  url,
  { method = "GET", body, token, internalKey = true } = {},
) {
  if (!base)
    throw Object.assign(new Error("URL de servicio no configurada"), {
      status: 503,
    });
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (internalKey) headers["x-internal-key"] = process.env.INTERNAL_KEY;
  let response;
  try {
    response = await fetch(new URL(url, base), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(Number(process.env.HTTP_TIMEOUT_MS || 6000)),
    });
  } catch (e) {
    throw Object.assign(
      new Error("Servicio remoto no disponible: " + e.message),
      { status: 503 },
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw Object.assign(new Error(data.error || `HTTP ${response.status}`), {
      status: response.status,
    });
  return data;
}
