import { NextRequest, NextResponse } from "next/server";
import { getDatabase, ref, push, set } from "firebase/database";
import { app } from "../../../firebaseconfig";
const db = getDatabase(app);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[WEBHOOK] body recibido:", body);

    // Mercado Pago envía `data.id` (payment_id)
    const paymentId = body?.data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: "payment_id no encontrado" }, { status: 400 });
    }

    // Consultar pago en Mercado Pago
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!res.ok) {
      console.error("[WEBHOOK] Error consultando pago:", res.status);
      return NextResponse.json({ error: "No se pudo consultar pago" }, { status: 500 });
    }

    const pago = await res.json();
    console.log("[WEBHOOK] Pago recibido:", pago);

    // Validar estado
    if (pago.status !== "approved") {
      console.log("[WEBHOOK] Pago no aprobado, ignorado.");
      return NextResponse.json({ success: true });
    }

  // Extraer datos
  const userId = pago.external_reference; // lo mandaste al crear la preferencia
  const metadata = pago.metadata || {};
  const items = metadata.items ? JSON.parse(metadata.items) : [];
  const address = metadata.address ? JSON.parse(metadata.address) : {};
  const total = metadata.total ? Number(metadata.total) : pago.transaction_amount;
  const userEmail = pago.payer?.email || metadata.userEmail || '';
  const userName = pago.payer?.first_name || '';
    

    if (!userId) {
      console.error("[WEBHOOK] userId no encontrado en external_reference");
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    // Guardar pedido en Firebase
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

    // Enviar emails a usuario y admin a través de la API /api/email
    if (userEmail) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toUser: userEmail,
            userName,
            orderId: pedido.id!,
            items: pedido.items,
            total: pedido.total,
            address: pedido.address,
            status: pedido.status,
            createdAt: pedido.createdAt,
            mp_payment_id: pedido.mp_payment_id
          })
        });
      } catch (e) {
        console.error("[WEBHOOK] Error enviando emails:", e);
      }
    }

  // Pedido guardado, no exponer datos sensibles

    // Responder 200 para que Mercado Pago no reintente
    return NextResponse.json({ success: true, id: newOrderRef.key });
  } catch (err) {
    console.error("[WEBHOOK] Error general:", err);
    return NextResponse.json({ error: "Error en webhook", details: err }, { status: 500 });
  }
}
