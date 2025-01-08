const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/users.js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


router.post('/register', async (req, res) => {
    try {
      const { correo, nombre, apellido, contraseña, telefono } = req.body;
  
      if (!correo || !contraseña) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
      }
  
      const hashedPassword = await bcrypt.hash(contraseña, 10);
  
      const newUser = new User({
        nombre,
        apellido,
        correo,
        telefono,
        contraseña: hashedPassword,
        puntos: 100, // Asignar 100 puntos al registrar
        nivel: 1,    // Nivel inicial
      });
  
      await newUser.save();
      res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar el usuario' });
    }
  });
  

// Login de usuario
router.post('/login', async (req, res) => {
  try {
      const { correo, contraseña } = req.body;

      // Buscar el usuario por el correo
      const user = await User.findOne({ correo });
      if (!user) {
          return res.status(400).json({ message: "Correo incorrecto" });
      }

      // Comparar la contraseña ingresada con la hash almacenada
      const isMatch = await bcrypt.compare(contraseña, user.contraseña);
      if (!isMatch) {
          return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      // Si la contraseña coincide, devolver el userId
      res.json({ 
          message: "Inicio de sesión exitoso", 
          correo: user.correo, 
          userId: user._id // Incluye el ID del usuario
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});

  
// Endpoint para obtener usuarios
router.get('/users', async (req, res) => {
    try {
      const user = await User.find(); // Obtener todos los usuarios
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


// Obtener perfil de usuario
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Editar datos del usuario
router.put('/edit/:id', async (req, res) => {
  try {
      const { nombre, apellido, correo, telefono, contraseña } = req.body;
      const userId = req.params.id;

      const updates = { nombre, apellido, correo, telefono };

      // Si la contraseña fue proporcionada, rehashearla
      if (contraseña) {
          const hashedPassword = await bcrypt.hash(contraseña, 10);
          updates.contraseña = hashedPassword;
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

      if (!updatedUser) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ message: "Datos actualizados con éxito", user: updatedUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});


// Obtener puntos y nivel de un usuario por su ID
router.get('/point/:id', async (req, res) => {
  try {
      const user = await User.findById(req.params.id, 'puntos nivel');
      if (!user) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({ puntos: user.puntos, nivel: user.nivel });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});

// Actualizar puntos y nivel de un usuario
router.put('/points/:id', async (req, res) => {
  try {
      const { puntos, nivel } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          { puntos, nivel },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ message: "Puntos actualizados con éxito", user: updatedUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});

// Enviar correo para restablecer contraseña
router.post('/forgot-password', async (req, res) => {
  const { correo } = req.body;

  try {
      const user = await User.findOne({ correo });
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await user.save();

      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      const mailOptions = {
          to: correo,
          subject: 'Restablecimiento de contraseña',
          text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetUrl}`,
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: 'Correo enviado para restablecer contraseña.' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al enviar el correo.' });
  }
});

// Restablecer contraseña
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { contraseña } = req.body;

  try {
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) return res.status(400).json({ message: 'Token inválido o expirado' });

      user.contraseña = await bcrypt.hash(contraseña, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al restablecer la contraseña.' });
  }
});

module.exports = router;
