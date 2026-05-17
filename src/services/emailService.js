// services/emailService.js
const brevo = require('@getbrevo/brevo');

class EmailService {
    constructor() {
        this.apiInstance = new brevo.TransactionalEmailsApi();
        this.apiInstance.setApiKey(
            brevo.TransactionalEmailsApiApiKeys.apiKey,
            process.env.BREVO_API_KEY
        );
        this.senderEmail = process.env.EMAIL_FROM || 'no-reply@bossbudget.com';
        this.senderName = 'BossBudget';
    }

    async sendPasswordResetEmail(to, resetLink) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = 'Recuperación de contraseña - BossBudget';
        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.sender = { 
            name: this.senderName, 
            email: this.senderEmail 
        };
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #2563eb;">Recuperación de Contraseña</h2>
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                    Restablecer Contraseña
                </a>
                <p><small>El enlace expira en 15 minutos.</small></p>
            </div>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Correo enviado exitosamente, ID:', response?.messageId);
            return true;
        } catch (error) {
            console.error('❌ Error enviando email:', error);
            throw new Error('Error al enviar el correo de recuperación');
        }
    }
}

module.exports = new EmailService();