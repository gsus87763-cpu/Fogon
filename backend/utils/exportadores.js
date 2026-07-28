const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Helpers genéricos de exportación. Reciben columnas ya resueltas
 * ({ clave, titulo, formato? }) y filas (objetos planos) y arman el
 * archivo. Los usa tanto el CRUD genérico de /admin-tablas como
 * cualquier reporte específico que se quiera armar a mano.
 */

function generarPdfTabla(res, { archivo, titulo, subtitulo, columnas, filas }) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: columnas.length > 6 ? 'landscape' : 'portrait' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${archivo}.pdf"`);
  doc.pipe(res);

  const anchoPagina = doc.page.width - 80;

  doc.fontSize(20).fillColor('#5c1a1a').text('EL FOGÓN', { align: 'center' });
  doc.fontSize(12).fillColor('#333').text(titulo, { align: 'center' });
  if (subtitulo) {
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#666').text(subtitulo, { align: 'center' });
  }
  doc.moveDown(1.5);

  const colWidth = anchoPagina / columnas.length;
  let y = doc.y;

  function encabezado() {
    doc.fontSize(9).fillColor('#fff');
    doc.rect(40, y, anchoPagina, 20).fill('#7a1f1f');
    doc.fillColor('#fff');
    let x = 40;
    columnas.forEach((col) => {
      doc.text(col.titulo, x + 4, y + 6, { width: colWidth - 8 });
      x += colWidth;
    });
    y += 22;
  }

  encabezado();
  doc.fillColor('#222').fontSize(8.5);
  filas.forEach((fila, idx) => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 40;
      encabezado();
      doc.fillColor('#222').fontSize(8.5);
    }
    if (idx % 2 === 0) {
      doc.rect(40, y, anchoPagina, 18).fill('#f6ece2');
      doc.fillColor('#222');
    }
    let x = 40;
    columnas.forEach((col) => {
      const valor = col.formato ? col.formato(fila[col.clave], fila) : fila[col.clave];
      doc.text(String(valor ?? ''), x + 4, y + 4, { width: colWidth - 8 });
      x += colWidth;
    });
    y += 18;
  });

  doc.moveDown(2);
  doc.fontSize(9).fillColor('#888').text(`Total de registros: ${filas.length}`, 40, Math.min(y + 10, doc.page.height - 60));
  doc.text(`Generado el ${new Date().toLocaleString('es-BO')}`, 40, Math.min(y + 24, doc.page.height - 46));

  doc.end();
}

async function generarExcelTabla(res, { archivo, hoja, columnas, filas }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'El Fogón';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(hoja);
  sheet.columns = columnas.map((c) => ({ header: c.titulo, key: c.clave, width: c.ancho || 22 }));
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7A1F1F' } };

  filas.forEach((fila) => {
    const valores = {};
    columnas.forEach((c) => {
      valores[c.clave] = c.formato ? c.formato(fila[c.clave], fila) : fila[c.clave];
    });
    sheet.addRow(valores);
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${archivo}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { generarPdfTabla, generarExcelTabla };
