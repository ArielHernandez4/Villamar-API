const nodemailer = require('nodemailer');

// Configura el transporte SMTP con Mailgun
const transporter = nodemailer.createTransport({
    host: process.env.MAILGUN_SMTP_SERVER,
    port: process.env.MAILGUN_SMTP_PORT,
    secure: false, // true para puerto 465 (SSL)
    auth: {
        user: process.env.MAILGUN_SMTP_USER, // Usuario SMTP (postmaster@sandbox...)
        pass: process.env.MAILGUN_SMTP_PASS, // Contraseña SMTP
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.MAILGUN_FROM_EMAIL, // Remitente (dominio sandbox)
            to,                                    // Destinatario (autorizado)
            subject,                               // Asunto
            text,                                  // Texto sin formato
            html,                                  // HTML opcional
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo enviado con éxito');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('No se pudo enviar el correo.');
    }
};

module.exports = sendEmail;
