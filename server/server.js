const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');

const app = express();

// Configurar CORS
const corsOptions = {
    origin: 'https://front-casas-villas.vercel.app/', // Reemplaza con el dominio de tu aplicación en Vercel
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    credentials: true, // Si usas cookies o encabezados de autenticación
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/user', userRoutes);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Conectado a MongoDB"))
.catch((error) => console.log("Error al conectar a MongoDB:", error));

// Rutas básicas de ejemplo
app.get('/', (req, res) => {
    res.send("API en funcionamiento");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en ejecución en el puerto ${PORT}`));

module.exports = app; // Exportar la app para Vercel
