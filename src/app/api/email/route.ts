export async function POST(req: NextRequest) {
  try {
    const pedido = await req.json();
    console.log('[EMAIL API] Pedido recibido:', JSON.stringify(pedido, null, 2));
    await sendOrderEmails(pedido);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[EMAIL API] Error enviando correo:', e);
    return NextResponse.json({ success: false, error: e.message });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';

const adminEmail = process.env.ADMIN_EMAIL;
const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

export async function sendOrderEmails({
  toUser,
  userName,
  orderId,
  items,
  total,
  address,
  status = 'pagado',
  createdAt,
  mp_payment_id
}: {
  toUser: string,
  userName?: string,
  orderId: string,
  items: any[],
  total: number,
  address: any,
  status?: string,
  createdAt?: number,
  mp_payment_id?: string
}) {
  console.log('[EMAIL API] Ejecutando sendOrderEmails con:', {
    toUser, userName, orderId, items, total, address, status, createdAt, mp_payment_id
  });
  const orderList = items.map(
    (item) => `- ${item.name || item.title} x${item.quantity} (${item.selectedSize ? 'Talla: ' + item.selectedSize + ', ' : ''}$${item.price || item.unit_price})\n  ${item.img ? item.img : ''}`
  ).join('\n');

  // HTML para productos con imagen
  const orderListHtml = items.map(
    (item) => `
      <div style="margin-bottom:10px;display:flex;align-items:center;gap:10px;">
        ${item.img ? `<img src="${item.img}" alt="${item.name || item.title}" style="width:48px;height:48px;object-fit:contain;border-radius:8px;border:1px solid #eee;" />` : ''}
        <div>
          <div><b>${item.name || item.title}</b> x${item.quantity} ${item.selectedSize ? `(Talla: ${item.selectedSize})` : ''}</div>
          <div style="color:#555;">$${item.price || item.unit_price}</div>
        </div>
      </div>
    `
  ).join('');
  const addressStr = address ? `${address.street || ''} ${address.number || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}` : '';
  const fecha = createdAt ? new Date(createdAt).toLocaleString() : '-';

  // LOG: Resumen de datos antes de enviar
  console.log('[EMAIL API] Enviando correo a usuario:', toUser);
  console.log('[EMAIL API] Enviando correo a admin:', adminEmail);

  // Email para usuario (HTML y texto)
  try {
    const result = await resend.emails.send({
      from: `MyShop <onboarding@resend.dev>`,
      to: ['francocas453@gmail.com'],
        subject: `Boleta de compra - Pedido #${orderId}`,
        text:
          `¡Gracias por tu compra${userName ? ', ' + userName : ''}!\n\n` +
          `Tu pedido fue recibido y está en proceso.\n\n` +
          `------------------------------\n` +
          `Pedido N°: ${orderId}\n` +
          `Fecha: ${fecha}\n` +
          `Estado: ${status}\n` +
          (mp_payment_id ? `ID Pago MP: ${mp_payment_id}\n` : '') +
          `------------------------------\n` +
          `Productos:\n${orderList}\n` +
          `------------------------------\n` +
          `Total: $${total}\n` +
          `Enviado a: ${addressStr}\n` +
          `------------------------------\n` +
          `Si tienes dudas, responde este correo.\n`,
        html:
          `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="color:#1976d2;">¡Gracias por tu compra${userName ? ', ' + userName : ''}!</h2>
            <p>Tu pedido fue recibido y está en proceso.</p>
            <hr />
            <div><b>Pedido N°:</b> ${orderId}</div>
            <div><b>Fecha:</b> ${fecha}</div>
            <div><b>Estado:</b> ${status}</div>
            ${mp_payment_id ? `<div><b>ID Pago MP:</b> ${mp_payment_id}</div>` : ''}
            <hr />
            <div><b>Productos:</b></div>
            ${orderListHtml}
            <hr />
            <div><b>Total:</b> $${total}</div>
            <div><b>Enviado a:</b> ${addressStr}</div>
            <hr />
            <div style="color:#888;font-size:13px;">Si tienes dudas, responde este correo.</div>
          </div>`
      });
    console.log('[EMAIL API] Respuesta de resend.emails.send (usuario):', result);
  } catch (err) {
    console.error('[EMAIL API] Error al enviar correo a usuario:', err);
  }

  // Email para admin (solo texto)
  if (adminEmail) {
    try {
      const result = await resend.emails.send({
        from: `MyShop <onboarding@resend.dev>`,
        to: ['francocas453@gmail.com'],
        subject: `Nuevo pedido pagado #${orderId}`,
        text:
          `Nuevo pedido pagado:\n` +
          `Usuario: ${toUser}${userName ? ' (' + userName + ')' : ''}\n` +
          `Pedido N°: ${orderId}\n` +
          `Fecha: ${fecha}\n` +
          `Estado: ${status}\n` +
          (mp_payment_id ? `ID Pago MP: ${mp_payment_id}\n` : '') +
          `------------------------------\n` +
          `Productos:\n${orderList}\n` +
          `------------------------------\n` +
          `Total: $${total}\n` +
          `Enviado a: ${addressStr}\n`
      });
      console.log('[EMAIL API] Respuesta de resend.emails.send (admin):', result);
    } catch (err) {
      console.error('[EMAIL API] Error al enviar correo a admin:', err);
    }
  }
}

