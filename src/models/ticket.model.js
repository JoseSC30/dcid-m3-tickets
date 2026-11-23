export function validateIssue({
  order_id,
  user_id,
  event_id,
  event_name,
  sector_name,
  cantidad,
} = {}) {
  if (
    !order_id ||
    !user_id ||
    !event_id ||
    !event_name ||
    !sector_name ||
    !Number.isInteger(cantidad) ||
    cantidad < 1 ||
    cantidad > 6
  )
    throw new Error("Solicitud de entradas inválida");
  return true;
}
export function ticketDownloadPath(code) {
  return `/api/tickets/${encodeURIComponent(code)}/download`;
}
