/**
 * Define, tabla por tabla: su llave primaria y qué columnas se pueden
 * escribir por CRUD (siempre se listan/leen todas). Luego, por rol, qué
 * tablas puede tocar y con qué acciones (leer / crear / editar / eliminar).
 *
 * 'admin' siempre tiene control total sobre todas las tablas registradas
 * aquí (así se cumple "el administrador maneja y edita cada tabla").
 * Los demás roles solo ven lo que corresponde a su función.
 */

const TABLAS = {
  cliente: { pk: 'id_cliente', columnas: ['nombre', 'apellidos', 'ci', 'telefono', 'correo', 'fecha_nacimiento', 'activo'] },
  empleado: { pk: 'id_empleado', columnas: ['nombre', 'apellidos', 'ci', 'sexo', 'fecha_nacimiento', 'estado_civil', 'telefono', 'estado', 'idioma', 'correo_electronico', 'numero_puerta', 'calle', 'ciudad', 'id_ambiente'] },
  administrador: { pk: 'id_administrador', columnas: ['id_empleado'] },
  cocinero: { pk: 'id_cocinero', columnas: ['id_empleado', 'especialidad'] },
  certificacion: { pk: 'id_certificacion', columnas: ['id_cocinero', 'nombre_certificacion', 'institucion_emisora', 'fecha_expiracion', 'fecha_emision', 'nivel', 'estado_vigencia'] },
  contrato: { pk: 'id_contrato', columnas: ['fecha_firma', 'estado', 'objeto_contrato', 'fecha_ini', 'fecha_fin', 'monto'] },
  pertenece: { pk: null, columnas: ['id_empleado', 'id_area', 'id_contrato'] },
  conforma: { pk: null, columnas: ['id_cocinero', 'id_cocina', 'id_contrato'] },
  registro_cargo: { pk: 'id_registro', columnas: ['id_empleado', 'tipo_cargo_actual', 'fecha', 'motivo', 'tipo_cargo_anterior'] },
  asistencia: { pk: 'id_asistencia', columnas: ['id_empleado', 'fecha', 'hora_ingreso', 'hora_salida'] },
  area: { pk: 'id_area', columnas: ['nombre', 'capacidad_personal', 'id_responsable', 'objetivo'] },
  ambiente: { pk: 'id_ambiente', columnas: ['nombre', 'horario_funcionamiento', 'caracteristica', 'capacidad', 'imagen_url'] },
  mesa: { pk: 'id_mesa', columnas: ['id_ambiente', 'capacidad_maxima', 'estado'] },
  cocina: { pk: 'id_cocina', columnas: ['id_area', 'cantidad_personal', 'nombre', 'descripcion_funcion', 'estado', 'horario_funcionamiento', 'id_responsable'] },
  equipamiento: { pk: 'id_equipamiento', columnas: ['nombre', 'modelo', 'marca', 'fabricante', 'tipo', 'numero_serie'] },
  dispone_de: { pk: null, columnas: ['id_area', 'id_equipamiento'] },
  utiliza: { pk: null, columnas: ['id_cocina', 'id_equipamiento'] },
  mantiene: { pk: 'id_mantenimiento', columnas: ['id_empleado', 'id_equipamiento', 'tipo', 'fecha', 'costo', 'descripcion', 'motivo'] },
  almacen: { pk: 'id_almacen', columnas: ['nombre', 'id_responsable', 'tipo', 'descripción', 'estado', 'capacidad_maxima'] },
  producto: { pk: 'id_producto', columnas: ['nombre', 'categoria', 'unidad_de_medida', 'marca', 'stock', 'fecha_vencimiento', 'id_almacen'] },
  carta: { pk: 'id_carta', columnas: ['nombre', 'descripción', 'tipo'] },
  producto_emplatado: { pk: 'id_producto_emplatado', columnas: ['nombre', 'descripcion', 'costo', 'id_carta'] },
  detalle_compra: { pk: 'id_detalle', columnas: ['fecha_compra', 'costo_adquisicion', 'proveedor', 'numero_factura', 'fecha_vencimiento_garantia', 'garantia', 'id_equipamiento'] },
  detalle_compra_producto: { pk: 'id_detalle_p', columnas: ['cantidad', 'costo', 'proveedor', 'fecha_compra', 'id_producto'] },
  pago_empleado: { pk: 'id_pago', columnas: ['observaciones', 'monto', 'fecha_pago', 'id_empleado'] },
  pedido: { pk: 'id_pedido', columnas: ['total', 'estado', 'fecha', 'id_mesa', 'id_cliente'] },
  factura: { pk: 'id_factura', columnas: ['nit', 'estado', 'fecha_emision', 'id_pedido'] },
  reserva: { pk: 'id_reserva', columnas: ['id_cliente', 'id_mesa', 'fecha', 'cantidad_personas', 'estado'] },
  solicita: { pk: null, columnas: ['id_ambiente', 'id_cliente', 'fecha', 'estado', 'motivo', 'cantidad_persona'] },
  log_acceso: { pk: 'id_log', columnas: ['fecha', 'estado', 'ip', 'tipo_acceso', 'id_empleado'] }
};

const TODAS_LAS_ACCIONES = ['leer', 'crear', 'editar', 'eliminar'];
const TODAS_LAS_TABLAS = Object.keys(TABLAS);

// Empleados sin especialización (rol 'staff') caen aquí; se ajusta según el área
// a la que pertenezcan, pero como base tienen lectura de operación diaria.
const PERMISOS_POR_ROL = {
  admin: Object.fromEntries(TODAS_LAS_TABLAS.map((t) => [t, TODAS_LAS_ACCIONES])),
  cocina: {
    cocinero: ['leer'],
    certificacion: ['leer', 'crear', 'editar'],
    cocina: ['leer', 'editar'],
    asistencia: ['leer', 'crear'],
    producto: ['leer'],
    producto_emplatado: ['leer', 'crear', 'editar'],
    carta: ['leer']
  },
  almacen: {
    almacen: ['leer', 'editar'],
    producto: ['leer', 'crear', 'editar'],
    detalle_compra: ['leer', 'crear'],
    detalle_compra_producto: ['leer', 'crear', 'editar', 'eliminar'],
    equipamiento: ['leer']
  },
  salon: {
    mesa: ['leer', 'editar'],
    ambiente: ['leer'],
    reserva: ['leer', 'crear', 'editar'],
    solicita: ['leer', 'crear', 'editar'],
    cliente: ['leer']
  },
  caja: {
    pedido: ['leer', 'crear', 'editar'],
    factura: ['leer', 'crear'],
    cliente: ['leer']
  },
  staff: {
    asistencia: ['leer', 'crear']
  }
};

function tablaValida(nombreTabla) {
  return Object.prototype.hasOwnProperty.call(TABLAS, nombreTabla);
}

function accionesPermitidas(rol, nombreTabla) {
  const permisosRol = PERMISOS_POR_ROL[rol] || {};
  return permisosRol[nombreTabla] || [];
}

module.exports = { TABLAS, PERMISOS_POR_ROL, tablaValida, accionesPermitidas };
