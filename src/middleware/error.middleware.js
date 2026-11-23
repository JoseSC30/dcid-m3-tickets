import { log } from "../utils/logger.js";
export function errorHandler(err, req, res, next) {
  log("error", err.message);
  res
    .status(err.status || 500)
    .json({ error: err.status ? err.message : "Error interno" });
}
