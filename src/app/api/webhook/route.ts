import { NextRequest, NextResponse } from "next/server";
import { getDatabase, ref, push, set } from "firebase/database";
import { app } from "../../../firebaseconfig";
import { sendOrderEmails } from "../email/route";

const db = getDatabase(app);



export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('Webhook recibido:', JSON.stringify(body));
  const paymentId = body?.data?.id;
  if (!paymentId) {
    // Notificación irrelevante (ej: merchant_order), responder 200 para evitar reintentos
    return NextResponse.json({ success: true });
  }
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  if (!mpRes.ok) {
    return NextResponse.json({ error: 'Error consultando pago en Mercado Pago' }, { status: 500 });
  }
  const pago = await mpRes.json();
  console.log('Pago consultado en MP:', JSON.stringify(pago));
  if (pago.status !== "approved") {
    return NextResponse.json({ success: true });
  }
  const userId = pago.external_reference;
  const metadata = pago.metadata || {};
  const items = metadata.items ? JSON.parse(metadata.items) : [];
  const address = metadata.address ? JSON.parse(metadata.address) : {};
  const total = metadata.total ? Number(metadata.total) : pago.transaction_amount;
  const userEmail = pago.payer?.email || metadata.userEmail || '';
  const userName = pago.payer?.first_name || '';
  console.log('Items recibidos:', JSON.stringify(items));
  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }
  const orderRef = ref(db, `orders/${userId}`);
  const newOrderRef = push(orderRef);
  const pedido = {
    id: newOrderRef.key,
    items,
    address,
    total,
    status: "pagado",
    mp_payment_id: paymentId,
    createdAt: Date.now(),
  };
  await set(newOrderRef, pedido);

  // Descontar stock de productos por talla (robusto)
  const { get, update } = await import('firebase/database');
  for (const item of items) {
    console.log('Procesando item:', JSON.stringify(item));
    if (!item.id || !item.selectedSize || typeof item.quantity !== 'number') {
      console.log('Item inválido para descuento de stock:', item);
      continue;
    }
    const sizePath = `products/${item.id}/sizes/${item.selectedSize}`;
    const sizeRef = ref(db, sizePath);
    try {
      const snap = await get(sizeRef);
      if (!snap.exists()) {
        console.log('No existe la talla en DB:', sizePath);
        continue;
      }
      const currentStock = snap.val();
      const newStock = Math.max(0, currentStock - item.quantity);
      console.log(`Stock actual: ${currentStock}, nuevo stock: ${newStock} para ${sizePath}`);
      await update(ref(db, `products/${item.id}/sizes`), { [item.selectedSize]: newStock });
      console.log('Stock actualizado correctamente');
    } catch (err) {
      console.error('Error actualizando stock:', err);
    }
  }
  try {
    await sendOrderEmails({
      toUser: userEmail,
      userName,
      orderId: pedido.id!,
      items: pedido.items,
      total: pedido.total,
      address: pedido.address,
      status: pedido.status,
      createdAt: pedido.createdAt,
      mp_payment_id: pedido.mp_payment_id
    });
  } catch (e) {}
  return NextResponse.json({ success: true, id: newOrderRef.key });
}