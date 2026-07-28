const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const pool = require('../config/db');
const clienteModel = require('../models/clienteModel');
const financeModel = require('../models/financeModel');

// ---------------------------------------------------------------------
// Helpers genéricos de exportación (todas las tablas de este proyecto
// comparten el mismo formato: cabecera con título + tabla con columnas).
// ---------------------------------------------------------------------

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

  doc.fontSize(9).fillColor('#fff');
  doc.rect(40, y, anchoPagina, 20).fill('#7a1f1f');
  doc.fillColor('#fff');
  let x = 40;
  columnas.forEach((col) => {
    doc.text(col.titulo, x + 4, y + 6, { width: colWidth - 8 });
    x += colWidth;
  });

  y += 22;
  doc.fillColor('#222').fontSize(8.5);
  filas.forEach((fila, idx) => {
    if (y > doc.page.height - 80) { doc.addPage(); y = 40; }
    if (idx % 2 === 0) {
      doc.rect(40, y, anchoPagina, 18).fill('#f6ece2');
      doc.fillColor('#222');
    }
    x = 40;
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

// ---------------------------------------------------------------------
// RESERVAS
// ---------------------------------------------------------------------

async function obtenerReservasEnRango(desde, hasta) {
  const [filas] = await pool.query(
    `SELECT r.id_reserva, r.fecha, r.hora, r.cantidad_personas, r.estado,
            CONCAT(c.nombre, ' ', c.apellidos) AS cliente,
            m.numero AS mesa, a.nombre AS ambiente
<<<<<<< HEAD
     FROM reserva r
     JOIN cliente c ON c.id_cliente = r.id_cliente
     JOIN mesa m ON m.id_mesa = r.id_mesa
     JOIN ambiente a ON a.id_ambiente = m.id_ambiente
=======
     FROM RESERVA r
     JOIN CLIENTE c ON c.id_cliente = r.id_cliente
     JOIN MESA m ON m.id_mesa = r.id_mesa
     JOIN AMBIENTE a ON a.id_ambiente = m.id_ambiente
>>>>>>> a8ece06d7bda7dd5174b157bf6a288520c5275dd
     WHERE r.fecha BETWEEN ? AND ? AND r.activo = 1
     ORDER BY r.fecha, r.hora`,
    [desde, hasta]
  );
  return filas;
}

const COLUMNAS_RESERVAS = [
  { clave: 'id_reserva', titulo: 'ID' },
  { clave: 'fecha', titulo: 'Fecha' },
  { clave: 'hora', titulo: 'Hora' },
  { clave: 'cliente', titulo: 'Cliente' },
  { clave: 'mesa', titulo: 'Mesa' },
  { clave: 'ambiente', titulo: 'Ambiente' },
  { clave: 'estado', titulo: 'Estado' }
];

// GET /api/reportes/reservas-pdf?desde=&hasta=
async function reservasPdf(req, res) {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) return res.status(400).json({ mensaje: 'Debe indicar los parámetros desde y hasta (YYYY-MM-DD)' });
    const filas = await obtenerReservasEnRango(desde, hasta);
    generarPdfTabla(res, {
      archivo: `reporte_reservas_${desde}_a_${hasta}`,
      titulo: 'Reporte de Reservas',
      subtitulo: `Periodo: ${desde} a ${hasta}`,
      columnas: COLUMNAS_RESERVAS,
      filas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al generar el reporte PDF' });
  }
}

// GET /api/reportes/reservas-excel?desde=&hasta=  (solo admin)
async function reservasExcel(req, res) {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) return res.status(400).json({ mensaje: 'Debe indicar los parámetros desde y hasta (YYYY-MM-DD)' });
    const filas = await obtenerReservasEnRango(desde, hasta);
    await generarExcelTabla(res, {
      archivo: `reporte_reservas_${desde}_a_${hasta}`,
      hoja: 'Reservas',
      columnas: COLUMNAS_RESERVAS,
      filas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al generar el reporte Excel' });
  }
}

// ---------------------------------------------------------------------
// CLIENTES (solo admin)
// ---------------------------------------------------------------------

const COLUMNAS_CLIENTES = [
  { clave: 'id_cliente', titulo: 'ID' },
  { clave: 'nombre', titulo: 'Nombre' },
  { clave: 'apellidos', titulo: 'Apellidos' },
  { clave: 'ci', titulo: 'CI' },
  { clave: 'telefono', titulo: 'Teléfono' },
  { clave: 'correo', titulo: 'Correo' },
  { clave: 'total_reservas', titulo: 'Reservas' },
  { clave: 'activo', titulo: 'Estado', formato: (v) => (v ? 'Activo' : 'Inactivo') }
];

async function clientesPdf(req, res) {
  try {
    const filas = await clienteModel.listar({ incluirInactivos: true });
    generarPdfTabla(res, {
      archivo: 'reporte_clientes',
      titulo: 'Reporte de Clientes',
      subtitulo: `Generado el ${new Date().toLocaleDateString('es-BO')}`,
      columnas: COLUMNAS_CLIENTES,
      filas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al generar el reporte PDF de clientes' });
  }
}

async function clientesExcel(req, res) {
  try {
    const filas = await clienteModel.listar({ incluirInactivos: true });
    await generarExcelTabla(res, { archivo: 'reporte_clientes', hoja: 'Clientes', columnas: COLUMNAS_CLIENTES, filas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al generar el reporte Excel de clientes' });
  }
}

// ---------------------------------------------------------------------
// FINANZAS: Pago Empleado, Facturas y Detalle de Compra (solo admin)
// ---------------------------------------------------------------------

const COLUMNAS_PAGOS = [
  { clave: 'id_pago', titulo: 'ID' },
  { clave: 'empleado', titulo: 'Empleado' },
  { clave: 'concepto', titulo: 'Concepto' },
  { clave: 'periodo', titulo: 'Periodo' },
  { clave: 'monto', titulo: 'Monto (Bs)' },
  { clave: 'fecha_pago', titulo: 'Fecha' },
  { clave: 'estado', titulo: 'Estado' }
];

const COLUMNAS_FACTURAS = [
  { clave: 'id_factura', titulo: 'ID' },
  { clave: 'numero_factura', titulo: 'N° Factura' },
  { clave: 'cliente', titulo: 'Cliente' },
  { clave: 'fecha_emision', titulo: 'Fecha' },
  { clave: 'monto_total', titulo: 'Monto (Bs)' },
  { clave: 'metodo_pago', titulo: 'Método de pago' },
  { clave: 'estado', titulo: 'Estado' }
];

const COLUMNAS_COMPRAS = [
  { clave: 'id_detalle', titulo: 'ID' },
  { clave: 'almacen', titulo: 'Almacén' },
  { clave: 'proveedor', titulo: 'Proveedor' },
  { clave: 'fecha_emision', titulo: 'Fecha' },
  { clave: 'monto', titulo: 'Monto (Bs)' },
  { clave: 'items', titulo: 'N° de ítems', formato: (v) => (Array.isArray(v) ? v.length : 0) }
];

async function finanzasPdf(req, res) {
  try {
    const { desde, hasta } = req.query;
    const [pagos, facturas, compras] = await Promise.all([
      financeModel.listarPagosEmpleado({ desde, hasta }),
      financeModel.listarFacturas({ desde, hasta }),
      financeModel.listarCompras({ desde, hasta })
    ]);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_finanzas.pdf"');
    doc.pipe(res);

    doc.fontSize(20).fillColor('#5c1a1a').text('EL FOGÓN', { align: 'center' });
    doc.fontSize(12).fillColor('#333').text('Reporte Financiero', { align: 'center' });
    doc.moveDown(0.3);
    const totalIngresos = facturas.filter((f) => f.estado === 'EMITIDA').reduce((s, f) => s + Number(f.monto_total), 0);
    const totalEgresos = pagos.filter((p) => p.estado === 'PAGADO').reduce((s, p) => s + Number(p.monto), 0)
      + compras.reduce((s, c) => s + Number(c.monto), 0);
    doc.fontSize(10).fillColor('#666').text(
      `Ingresos (facturas): Bs ${totalIngresos.toFixed(2)}   |   Egresos (pagos + compras): Bs ${totalEgresos.toFixed(2)}`,
      { align: 'center' }
    );
    doc.moveDown(1);

    function seccion(titulo) {
      doc.moveDown(0.6);
      doc.fontSize(12).fillColor('#7a1f1f').text(titulo);
      doc.moveDown(0.3);
    }

    seccion(`Pago Empleado (${pagos.length})`);
    pagos.slice(0, 25).forEach((p) => {
      doc.fontSize(8.5).fillColor('#222').text(
        `#${p.id_pago}  ${p.empleado}  |  ${p.concepto}  |  Bs ${Number(p.monto).toFixed(2)}  |  ${p.fecha_pago}  |  ${p.estado}`
      );
    });

    seccion(`Facturas (${facturas.length})`);
    facturas.slice(0, 25).forEach((f) => {
      doc.fontSize(8.5).fillColor('#222').text(
        `${f.numero_factura}  ${f.cliente}  |  Bs ${Number(f.monto_total).toFixed(2)}  |  ${f.fecha_emision}  |  ${f.metodo_pago}  |  ${f.estado}`
      );
    });

    seccion(`Detalle de Compra (${compras.length})`);
    compras.slice(0, 25).forEach((c) => {
      doc.fontSize(8.5).fillColor('#222').text(
        `#${c.id_detalle}  ${c.proveedor} (${c.almacen})  |  Bs ${Number(c.monto).toFixed(2)}  |  ${c.fecha_emision}  |  ${c.items.length} ítem(s)`
      );
    });

    doc.moveDown(1);
    doc.fontSize(9).fillColor('#888').text(`Generado el ${new Date().toLocaleString('es-BO')}`);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al generar el reporte PDF financiero' });
  }
}

async function finanzasExcel(req, res) {
  try {
    const { desde, hasta } = req.query;
    const [pagos, facturas, compras] = await Promise.all([
      financeModel.listarPagosEmpleado({ desde, hasta }),
      financeModel.listarFacturas({ desde, hasta }),
      financeModel.listarCompras({ desde, hasta })
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'El Fogón';
    workbook.created = new Date();

    function hojaDe(nombre, columnas, filas) {
      const sheet = workbook.addWorksheet(nombre);
      sheet.columns = columnas.map((c) => ({ header: c.titulo, key: c.clave, width: c.ancho || 22 }));
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7A1F1F' } };
      filas.forEach((fila) => {
        const valores = {};
        columnas.forEach((c) => { valores[c.clave] = c.formato ? c.formato(fila[c.clave], fila) : fila[c.clave]; });
        sheet.addRow(valores);
      });
    }

    hojaDe('Pago Empleado', COLUMNAS_PAGOS, pagos);
    hojaDe('Facturas', COLUMNAS_FACTURAS, facturas);
    hojaDe('Detalle de Compra', COLUMNAS_COMPRAS, compras);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_finanzas.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al generar el reporte Excel financiero' });
  }
}

module.exports = {
  reservasPdf, reservasExcel,
  clientesPdf, clientesExcel,
  finanzasPdf, finanzasExcel
};
