let io;

function initializeSocketEvents(socketIO) {
    io = socketIO;

    io.on('connection', (socket) => {
        console.log('Usuario conectado');
    });
}

function emitNuevoProducto(nuevoProducto) {
    io.emit('nuevoProducto', nuevoProducto);
}

export { initializeSocketEvents, emitNuevoProducto };
