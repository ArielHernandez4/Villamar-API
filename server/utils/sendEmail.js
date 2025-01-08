const nodemailer = require('nodemailer');

// Configura el transporte SMTP con SendGrid
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net', // Servidor SMTP de SendGrid
    port: 587,                 // Puerto para STARTTLS
    secure: false,             // Usar SSL/TLS solo en el puerto 465
    auth: {
        user: 'apikey',        // Usuario SMTP (siempre es "apikey")
        pass: process.env.SENDGRID_API_KEY, // API Key de SendGrid
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.SENDGRID_FROM_EMAIL, // Remitente (debe ser un correo verificado o autenticado)
            to,                                    // Destinatario
            subject,                               // Asunto
            text,                                  // Texto sin formato
            html,                                  // Versión HTML (opcional)
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo enviado con éxito');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('No se pudo enviar el correo.');
    }
};

module.exports = sendEmail;
