import nodemailer from 'nodemailer';

const adminEmail = process.env.ADMIN_EMAIL || '';
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 465;

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendOrderEmails({
  toUser,
  userName,
  orderId,
  items,
  total,
  address
}: {
  toUser: string,
  userName?: string,
  orderId: string,
  items: any[],
  total: number,
  address: any
}) {
  const orderList = items.map(
    (item) => `- ${item.name || item.title} x${item.quantity} ($${item.price || item.unit_price})`
  ).join('\n');
  const addressStr = address ? `${address.street || ''} ${address.number || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}` : '';

  // Email para usuario
  await transporter.sendMail({
    from: smtpUser,
    to: toUser,
    subject: `¡Gracias por tu compra! Pedido #${orderId}`,
    text: `Hola${userName ? ' ' + userName : ''},\n\nTu pedido fue recibido y está en proceso.\n\nResumen:\n${orderList}\n\nTotal: $${total}\nEnviado a: ${addressStr}`,
  });

  // Email para admin
  if (adminEmail) {
    await transporter.sendMail({
      from: smtpUser,
      to: adminEmail,
      subject: `Nuevo pedido pagado #${orderId}`,
      text: `Nuevo pedido pagado:\n\nUsuario: ${toUser}${userName ? ' (' + userName + ')' : ''}\nResumen:\n${orderList}\nTotal: $${total}\nEnviado a: ${addressStr}`,
    });
  }
}
