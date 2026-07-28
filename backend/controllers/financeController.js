const financeModel = require('../models/financeModel');

// --- Pago Empleado ---

async function listarPagos(req, res) {
  try {
    const { desde, hasta, id_empleado } = req.query;
    res.json(await financeModel.listarPagosEmpleado({ desde, hasta, id_empleado }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar pagos a empleados' });
  }
}

async function registrarPago(req, res) {
  try {
    const { id_empleado, concepto, periodo, monto, fecha_pago } = req.body;
    if (!id_empleado || !concepto || !monto || !fecha_pago) {
      return res.status(400).json({ mensaje: 'id_empleado, concepto, monto y fecha_pago son obligatorios' });
    }
    const idRegistradoPor = req.user.tipo_cuenta === 'EMPLEADO' ? req.user.id_cuenta : null;
    const pago = await financeModel.registrarPagoEmpleado({
      id_empleado, concepto, periodo, monto, fecha_pago,
      id_registrado_por: idRegistradoPor
    });
    res.status(201).json(pago);
  } catch (err) {
    // Errores lanzados por el trigger/procedimiento de MySQL (SIGNAL SQLSTATE '45000')
    const mensaje = err.sqlMessage || 'Error al registrar el pago';
    console.error(err);
    res.status(400).json({ mensaje });
  }
}

async function anularPago(req, res) {
  try {
    res.json(await financeModel.anularPagoEmpleado(req.params.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al anular el pago' });
  }
}

// --- Factura ---

async function listarFacturas(req, res) {
  try {
    const { desde, hasta } = req.query;
    res.json(await financeModel.listarFacturas({ desde, hasta }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar facturas' });
  }
}

async function generarFactura(req, res) {
  try {
    const { id_reserva, metodo_pago } = req.body;
    if (!id_reserva) return res.status(400).json({ mensaje: 'id_reserva es obligatorio' });
    const factura = await financeModel.generarFactura({ id_reserva, metodo_pago });
    res.status(201).json(factura);
  } catch (err) {
    const mensaje = err.sqlMessage || 'Error al generar la factura';
    console.error(err);
    res.status(400).json({ mensaje });
  }
}

async function anularFactura(req, res) {
  try {
    res.json(await financeModel.anularFactura(req.params.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al anular la factura' });
  }
}

// --- Detalle de Compra ---

async function listarCompras(req, res) {
  try {
    const { desde, hasta } = req.query;
    res.json(await financeModel.listarCompras({ desde, hasta }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al listar compras' });
  }
}

async function crearCompra(req, res) {
  try {
    const { id_almacen, proveedor, fecha_emision, items } = req.body;
    if (!id_almacen || !proveedor || !fecha_emision) {
      return res.status(400).json({ mensaje: 'id_almacen, proveedor y fecha_emision son obligatorios' });
    }
    const itemsValidos = Array.isArray(items)
      ? items.filter((i) => i && i.descripcion && i.cantidad > 0 && i.precio_unitario >= 0)
      : [];
    const compra = await financeModel.crearCompra({ id_almacen, proveedor, fecha_emision, items: itemsValidos });
    res.status(201).json(compra);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al registrar la compra' });
  }
}

async function agregarItem(req, res) {
  try {
    const { descripcion, cantidad, precio_unitario } = req.body;
    if (!descripcion || !cantidad || precio_unitario == null) {
      return res.status(400).json({ mensaje: 'descripcion, cantidad y precio_unitario son obligatorios' });
    }
    const compra = await financeModel.agregarItemCompra(req.params.id, { descripcion, cantidad, precio_unitario });
    res.status(201).json(compra);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al agregar el ítem' });
  }
}

async function eliminarItem(req, res) {
  try {
    const compra = await financeModel.eliminarItemCompra(req.params.id, req.params.idItem);
    res.json(compra);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar el ítem' });
  }
}

async function resumen(req, res) {
  try {
    res.json(await financeModel.resumenPorMes());
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al calcular el resumen financiero' });
  }
}

module.exports = {
  listarPagos, registrarPago, anularPago,
  listarFacturas, generarFactura, anularFactura,
  listarCompras, crearCompra, agregarItem, eliminarItem,
  resumen
};
