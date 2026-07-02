import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, code: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎬 AfterPlot - Verifica tu email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a3a52 0%, #2dd4cf 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">AfterPlot</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">The ritual of tracking your favorite shows</p>
          </div>
          <div style="background: #f0f9fa; padding: 40px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1a3a52; margin-top: 0;">¡Bienvenido a AfterPlot!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Gracias por registrarte. Para activar tu cuenta, utiliza el siguiente código de verificación:
            </p>
            <div style="background: white; border: 2px solid #2dd4cf; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; margin: 0 0 10px 0;">Tu código de verificación</p>
              <h1 style="color: #2dd4cf; font-size: 48px; letter-spacing: 10px; margin: 0; font-family: monospace;">${code}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              Este código expira en <strong>24 horas</strong>. Si no solicitaste este email, puedes ignorarlo.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © 2026 AfterPlot por Tartessos Studio. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    })
    console.log(`Verification email sent to ${email}`)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
