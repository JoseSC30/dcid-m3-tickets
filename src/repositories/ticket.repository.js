import { run } from "../config/database.js";
export async function listUserTickets(userId) {
  return (
    await run(
      "SELECT code,order_id,event_id,event_name,sector_name,created_at FROM tickets WHERE user_id=$1 ORDER BY created_at DESC",
      [userId],
    )
  ).rows;
}
