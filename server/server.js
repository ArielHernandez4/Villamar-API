const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const userRoutes = require('./routes/userRoutes');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/user', userRoutes);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.log("Error al conectar a MongoDB:", error));

// Rutas básicas de ejemplo
app.get('/', (req, res) => {
    res.send("API en funcionamiento");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en ejecución en el puerto ${PORT}`));

module.exports = app;

