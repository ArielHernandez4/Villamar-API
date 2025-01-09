const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const payload from 'payload';
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const customAuth = require('./custom-auth');


const app = express();


app.use(cors());
app.use(express.json());
app.use('/api/user', userRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, { })
    .then(() => console.log("Conectado a MongoDB localmente"))
    .catch((error) => console.error("Error al conectar a MongoDB:", error));


// Rutas básicas de ejemplo
app.get('/', (req, res) => {
    res.send("API en funcionamiento");
});

// Inicia Payload
payload.init({
  secret: process.env.PAYLOAD_SECRET,
  mongoURL: process.env.DATABASE_URI,
  express: app,
});

// Ruta de autenticación personalizada
app.post('/custom-login', customAuth);


// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));


module.exports = app; // Exportar la app para Vercel
