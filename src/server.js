import "dotenv/config";
import { app } from "./app.js";
import { log } from "./utils/logger.js";
const port = Number(process.env.PORT);
if (!port) throw new Error("PORT no configurado");
app.listen(port, () => log("info", `Escuchando puerto ${port}`));
