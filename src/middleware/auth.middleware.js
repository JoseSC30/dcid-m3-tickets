import jwt from "jsonwebtoken";
export const auth =
  (roles = []) =>
  (req, res, next) => {
    try {
      const token = (req.headers.authorization || "").replace(/^Bearer /, "");
      req.user = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });
      if (roles.length && !roles.includes(req.user.rol))
        return res.status(403).json({ error: "Acceso denegado" });
      next();
    } catch {
      return res.status(401).json({ error: "Token inválido o ausente" });
    }
  };
export const internal = (req, res, next) => {
  if (
    !process.env.INTERNAL_KEY ||
    req.headers["x-internal-key"] !== process.env.INTERNAL_KEY
  )
    return res.status(403).json({ error: "Acceso interno denegado" });
  next();
};
