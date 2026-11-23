import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
export async function createTicketPdf({
  code,
  event_name,
  sector_name,
  order_id,
}) {
  const folder = path.resolve(process.env.PDF_DIR || "./pdfs");
  await fs.promises.mkdir(folder, { recursive: true });
  const filename = path.join(folder, code + ".pdf");
  const qr = await QRCode.toBuffer(code, {
    type: "png",
    margin: 2,
    width: 300,
  });
  await new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ size: "A5", margin: 35 });
    const stream = fs.createWriteStream(filename);
    pdf.pipe(stream);
    pdf.fontSize(22).text("EntradasYa");
    pdf
      .moveDown()
      .fontSize(12)
      .text("Evento: " + event_name)
      .text("Sector: " + sector_name)
      .text("Orden: " + order_id)
      .text("Código: " + code);
    pdf.moveDown().image(qr, { width: 190 });
    pdf.end();
    stream.once("finish", resolve);
    stream.once("error", reject);
    pdf.once("error", reject);
  });
  return filename;
}
