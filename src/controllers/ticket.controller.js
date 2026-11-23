import { listUserTickets } from "../repositories/ticket.repository.js";
import { validateIssue } from "../models/ticket.model.js";
import { run, db } from "../config/database.js";
import { auth, internal } from "../middleware/auth.middleware.js";
import { call } from "../services/http.service.js";
import { log } from "../utils/logger.js";
import { randomUUID } from "node:crypto";
import { createTicketPdf } from "../services/pdf.service.js";
export function registerTicketRoutes(router) {
  router.post("/tickets/issue", internal, async (req, res, next) => {
    try {
      const { order_id, user_id, event_id, event_name, sector_name, cantidad } =
        req.body;
      if (
        !order_id ||
        !Number.isInteger(cantidad) ||
        cantidad < 1 ||
        cantidad > 6
      )
        return res.status(400).json({ error: "Solicitud inválida" });
      validateIssue({
        order_id,
        user_id,
        event_id,
        event_name,
        sector_name,
        cantidad,
      });
      const existing = await run(
        "SELECT * FROM tickets WHERE order_id=$1 ORDER BY seat_index",
        [order_id],
      );
      if (
        existing.rows.some(
          (t) =>
            String(t.user_id) !== String(user_id) ||
            String(t.event_id) !== String(event_id),
        )
      )
        return res
          .status(409)
          .json({ error: "La orden ya tiene entradas con otros datos" });
      const results = [];
      for (let i = 1; i <= cantidad; i++) {
        let ticket = existing.rows.find((t) => Number(t.seat_index) === i);
        if (!ticket) {
          const code = randomUUID();
          const filename = await createTicketPdf({
            code,
            event_name,
            sector_name,
            order_id,
          });
          const saved = await run(
            "INSERT INTO tickets(code,order_id,seat_index,user_id,event_id,event_name,sector_name,pdf_path) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(order_id,seat_index) DO NOTHING RETURNING *",
            [
              code,
              order_id,
              i,
              user_id,
              event_id,
              event_name,
              sector_name,
              filename,
            ],
          );
          ticket =
            saved.rows[0] ||
            (
              await run(
                "SELECT * FROM tickets WHERE order_id=$1 AND seat_index=$2",
                [order_id, i],
              )
            ).rows[0];
        }
        results.push({
          code: ticket.code,
          order_id,
          event_id,
          download_url: `${process.env.PUBLIC_BASE_URL}/api/tickets/${ticket.code}/download`,
        });
      }
      res.status(201).json({ tickets: results });
    } catch (e) {
      next(e);
    }
  });
  router.get("/tickets/mine", auth(["cliente"]), async (req, res, next) => {
    try {
      const tickets = await listUserTickets(req.user.id);
      res.json(
        tickets.map((t) => ({
          code: t.code,
          order_id: t.order_id,
          event_id: t.event_id,
          event_name: t.event_name,
          sector_name: t.sector_name,
          download_url: `${process.env.PUBLIC_BASE_URL}/api/tickets/${t.code}/download`,
        })),
      );
    } catch (e) {
      next(e);
    }
  });
  router.get(
    "/tickets/:code/download",
    auth(["cliente"]),
    async (req, res, next) => {
      try {
        const x = await run(
          "SELECT * FROM tickets WHERE code=$1 AND user_id=$2",
          [req.params.code, req.user.id],
        );
        if (!x.rowCount)
          return res.status(404).json({ error: "Entrada no encontrada" });
        res.download(x.rows[0].pdf_path, "entrada-" + req.params.code + ".pdf");
      } catch (e) {
        next(e);
      }
    },
  );
  router.get("/tickets/:code/validate", internal, async (req, res, next) => {
    try {
      const x = await run(
        "SELECT code,order_id,event_id FROM tickets WHERE code=$1",
        [req.params.code],
      );
      if (!x.rowCount)
        return res.status(404).json({ error: "Código inválido" });
      const order = await call(
        process.env.ORDERS_URL,
        `/orders/internal/${encodeURIComponent(x.rows[0].order_id)}`,
      );
      res.json({
        ...x.rows[0],
        valido: order.estado === "pagada",
        pagada: order.estado === "pagada",
      });
    } catch (e) {
      next(e);
    }
  });
}
