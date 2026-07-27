// Envuelve un handler async de Express para que, si la promesa se rechaza
// (por ejemplo, un error de MySQL), el error se pase a next(err) y lo capture
// el manejador de errores genérico en server.js — en vez de convertirse en una
// promesa rechazada sin manejar, que tumba todo el proceso de Node.
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
