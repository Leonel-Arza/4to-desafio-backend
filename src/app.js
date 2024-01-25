import express from 'express';
import exphbs from 'express-handlebars';
import bodyParser from 'body-parser';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as socketEvents from './socketEvents.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const PORT = process.env.PORT || 3000;

// Configuración de Handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: true }));


const productos = [];

socketEvents.initializeSocketEvents(io);

// Rutas
app.get('/', (req, res) => {
    res.render('index'); 
});

app.get('/home', (req, res) => {
    res.render('home', { productos }); 
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { productos }); 
});

app.post('/agregarProducto', (req, res) => {
    const { nombre, precio } = req.body;

    const nuevoProducto = { nombre, precio };
    productos.push(nuevoProducto);

    // Emitir el nuevo producto a todos los clientes conectados
    socketEvents.emitNuevoProducto(nuevoProducto);

    // Redirigir a la página home
    res.redirect('/home');
});

io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('eliminarProducto', ({ nombre }) => {
        // Filtrar y eliminar el producto del array
        const indice = productos.findIndex((producto) => producto.nombre === nombre);
        if (indice !== -1) {
            const productoEliminado = productos.splice(indice, 1)[0];

            io.emit('productoEliminado', productoEliminado);
        }
    });
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
