const axios = require('axios');

class EmailService {

    async sendPasswordResetEmail(to, resetLink) {

        try {

            const response = await axios.post(
                'https://api.brevo.com/v3/smtp/email',
                {
                    sender: {
                        name: 'BossBudget',
                        email: 'bossbudgetproyect@gmail.com'
                    },

                    to: [{ email: to }],

                    subject: '🔐 Recuperación de contraseña - BossBudget',

                    htmlContent: `
                    
                    <div style="
                        font-family: Arial, sans-serif;
                        background-color: #f4f7fb;
                        padding: 40px 20px;
                    ">

                        <div style="
                            max-width: 600px;
                            margin: auto;
                            background: white;
                            border-radius: 16px;
                            overflow: hidden;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                        ">

                            <div style="
                                background: linear-gradient(135deg, #2563eb, #1e40af);
                                padding: 30px;
                                text-align: center;
                                color: white;
                            ">

                                <h1 style="
                                    margin: 0;
                                    font-size: 28px;
                                ">
                                    BossBudget
                                </h1>

                                <p style="
                                    margin-top: 10px;
                                    opacity: 0.9;
                                ">
                                    Recuperación de contraseña
                                </p>

                            </div>

                            <div style="padding: 40px; color: #374151;">

                                <h2 style="margin-top: 0;">
                                    Hola 👋
                                </h2>

                                <p style="
                                    line-height: 1.7;
                                    font-size: 16px;
                                ">
                                    Hemos recibido una solicitud para restablecer tu contraseña.
                                </p>

                                <p style="
                                    line-height: 1.7;
                                    font-size: 16px;
                                ">
                                    Haz clic en el siguiente botón para continuar:
                                </p>

                                <div style="text-align: center; margin: 35px 0;">

                                    <a href="${resetLink}"
                                       style="
                                            background: #2563eb;
                                            color: white;
                                            text-decoration: none;
                                            padding: 14px 28px;
                                            border-radius: 10px;
                                            font-size: 16px;
                                            font-weight: bold;
                                            display: inline-block;
                                       ">

                                        Restablecer contraseña

                                    </a>

                                </div>

                                <p style="
                                    font-size: 14px;
                                    color: #6b7280;
                                    line-height: 1.6;
                                ">
                                    Este enlace expirará en 15 minutos por seguridad.
                                </p>

                                <p style="
                                    font-size: 14px;
                                    color: #6b7280;
                                    line-height: 1.6;
                                ">
                                    Si no solicitaste este cambio, puedes ignorar este correo.
                                </p>

                            </div>

                            <div style="
                                background: #f9fafb;
                                padding: 20px;
                                text-align: center;
                                font-size: 13px;
                                color: #9ca3af;
                            ">

                                © 2026 BossBudget · Controla tus finanzas fácilmente

                            </div>

                        </div>

                    </div>

                    `
                },
                {
                    headers: {
                        'api-key': process.env.BREVO_API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Correo enviado');
            console.log(response.data);

            return true;

        } catch (error) {

            console.log('❌ Error enviando correo');

            console.log(
                error.response?.data || error.message
            );

            return false;
        }
    }
}

module.exports = new EmailService();