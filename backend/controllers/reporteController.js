const PDFDocument = require('pdfkit');
const pool = require('../config/db');

// GET /api/reportes/reservas-pdf?desde=2026-07-01&hasta=2026-07-31
async function reservasPdf(req, res) {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) {
      return res.status(400).json({ mensaje: 'Debe indicar los parámetros desde y hasta (YYYY-MM-DD)' });
    }

    const [filas] = await pool.query(
      `SELECT r.id_reserva, r.fecha, r.hora, r.cantidad_personas, r.estado,
              CONCAT(c.nombre, ' ', c.apellidos) AS cliente,
              m.numero AS mesa, a.nombre AS ambiente
       FROM RESERVA r
       JOIN CLIENTE c ON c.id_cliente = r.id_cliente
       JOIN MESA m ON m.id_mesa = r.id_mesa
       JOIN AMBIENTE a ON a.id_ambiente = m.id_ambiente
       WHERE r.fecha BETWEEN ? AND ? AND r.activo = 1
       ORDER BY r.fecha, r.hora`,
      [desde, hasta]
    );

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_reservas_${desde}_a_${hasta}.pdf"`);
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).fillColor('#5c1a1a').text('EL FOGÓN', { align: 'center' });
    doc.fontSize(12).fillColor('#333').text('Reporte de Reservas', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#666').text(`Periodo: ${desde} a ${hasta}`, { align: 'center' });
    doc.moveDown(1.5);

    // Tabla simple
    const colWidths = [40, 70, 50, 110, 40, 70, 70];
    const headers = ['ID', 'Fecha', 'Hora', 'Cliente', 'Mesa', 'Ambiente', 'Estado'];
    let y = doc.y;

    doc.fontSize(10).fillColor('#fff');
    doc.rect(40, y, 520, 20).fill('#7a1f1f');
    doc.fillColor('#fff');
    let x = 40;
    headers.forEach((h, i) => {
      doc.text(h, x + 4, y + 5, { width: colWidths[i] - 4 });
      x += colWidths[i];
    });

    y += 22;
    doc.fillColor('#222').fontSize(9);
    filas.forEach((f, idx) => {
      if (y > 760) { doc.addPage(); y = 40; }
      if (idx % 2 === 0) {
        doc.rect(40, y, 520, 18).fill('#f6ece2');
        doc.fillColor('#222');
      }
      x = 40;
      const valores = [f.id_reserva, f.fecha, f.hora, f.cliente, f.mesa, f.ambiente, f.estado];
      valores.forEach((v, i) => {
        doc.text(String(v ?? ''), x + 4, y + 4, { width: colWidths[i] - 4 });
        x += colWidths[i];
      });
      y += 18;
    });

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#888').text(`Total de reservas: ${filas.length}`, 40, y + 10);
    doc.text(`Generado el ${new Date().toLocaleString('es-BO')}`, 40, y + 24);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al generar el reporte PDF' });
  }
}

module.exports = { reservasPdf };
