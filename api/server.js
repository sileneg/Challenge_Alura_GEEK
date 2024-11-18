const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('api/db.json'); // Asegúrate de que apunte al archivo correcto
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Reescritura para rutas amigables (opcional)
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/product/:resource/:id/show': '/:resource/:id'
}));

server.use(router);

// Usar el puerto que define Vercel en producción o 3001 localmente
const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});

module.exports = server;
