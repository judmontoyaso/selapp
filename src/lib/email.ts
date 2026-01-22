import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Envía un email genérico
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Selapp'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error('No se pudo enviar el email');
  }
}

/**
 * Envía un email de recuperación de contraseña
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #8b5cf6;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
            color: #4b5563;
          }
          .button {
            display: inline-block;
            background-color: #8b5cf6;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #7c3aed;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .expiry {
            font-size: 14px;
            color: #6b7280;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌱 Selapp</div>
            <h1 class="title">Recuperación de Contraseña</h1>
          </div>
          
          <div class="content">
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Selapp.</p>
            <p>Si fuiste tú quien realizó esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            
            <p class="expiry">⏰ Este enlace expirará en 1 hora por seguridad.</p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura. Tu contraseña no será cambiada.
            </div>
            
            <p>Si el botón no funciona, también puedes copiar y pegar este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">
              ${resetUrl}
            </p>
          </div>
          
          <div class="footer">
            <p>Este es un email automático de Selapp - Tu compañero espiritual</p>
            <p>Por favor, no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: '🔐 Recuperación de Contraseña - Selapp',
    html,
  });
}

/**
 * Envía un email de confirmación después de cambiar la contraseña
 */
export async function sendPasswordChangedEmail(email: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #8b5cf6;
            margin-bottom: 10px;
          }
          .success-icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
            color: #4b5563;
          }
          .info-box {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .button {
            display: inline-block;
            background-color: #8b5cf6;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌱 Selapp</div>
            <div class="success-icon">✅</div>
            <h1 class="title">Contraseña Actualizada</h1>
          </div>
          
          <div class="content">
            <p>Hola,</p>
            <p>Te confirmamos que la contraseña de tu cuenta en Selapp ha sido actualizada exitosamente.</p>
            
            <div class="info-box">
              <strong>✓ Cambio realizado:</strong> ${new Date().toLocaleString('es-ES', { 
                dateStyle: 'full', 
                timeStyle: 'short',
                timeZone: 'America/Mexico_City'
              })}
            </div>
            
            <p>Si no realizaste este cambio, por favor contacta a nuestro equipo de soporte de inmediato para proteger tu cuenta.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/auth/signin" class="button">Iniciar Sesión</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Este es un email automático de Selapp - Tu compañero espiritual</p>
            <p>Por favor, no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: '✅ Contraseña Actualizada - Selapp',
    html,
  });
}
