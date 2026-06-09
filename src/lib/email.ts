import { Resend } from 'resend'

let _resend: Resend | null = null
const resend = () => {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set')
    _resend = new Resend(key)
  }
  return _resend
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
  try {
    await resend().emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Reset your Bookroom password',
      html: `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <tr>
    <td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:40px;text-align:left">
        <tr>
          <td>
            <h1 style="font-size:24px;font-weight:600;margin:0 0 8px;color:#18181b">Reset your password</h1>
            <p style="font-size:15px;line-height:1.5;color:#52525b;margin:0 0 24px">
              We received a request to reset your Bookroom password. Click the button below to set a new one.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px">
              <tr>
                <td align="center" style="background-color:#18181b;border-radius:8px;padding:12px 24px">
                  <a href="${resetUrl}" style="color:#fff;font-size:15px;font-weight:500;text-decoration:none;display:inline-block">
                    Reset password
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-size:14px;line-height:1.5;color:#71717a;margin:0 0 16px">
              Or copy this link into your browser:
            </p>
            <p style="font-size:13px;line-height:1.5;color:#71717a;margin:0;word-break:break-all;background:#f4f4f5;padding:12px;border-radius:6px">
              ${resetUrl}
            </p>
            <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0" />
            <p style="font-size:13px;line-height:1.5;color:#a1a1aa;margin:0">
              If you didn't request this, you can safely ignore this email. The link expires in 1 hour.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`,
    })
    return true
  } catch (err) {
    console.error('Failed to send password reset email:', err)
    return false
  }
}
