
import { NextRequest, NextResponse } from "next/server";
import { getDatabase, ref, push, set } from "firebase/database";
import { app } from "../../../firebaseconfig";
import { sendOrderEmails } from "../email/route";

export const dynamic = "force-dynamic";
const db = getDatabase(app);

export async function POST(req: NextRequest) {

  const body = await req.json();
  console.log("[WEBHOOK] body recibido:", body);

  // Mercado Pago envía `data.id` (payment_id)
  const paymentId = body?.data?.id;
  if (!paymentId) {
    return NextResponse.json({ error: "payment_id no encontrado" }, { status: 400 });
  }

  // Validar pago usando el endpoint centralizado
  const validateRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/validate-payment?payment_id=${paymentId}`);
  const validateJson = await validateRes.json();
  if (validateJson.status !== "approved") {
    console.log("[WEBHOOK] Pago no aprobado, ignorado.");
    return NextResponse.json({ success: true });
  }
  const pago = validateJson.pago;

  // Extraer datos
  const userId = pago.external_reference;
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

  // Enviar email de resumen
  try {
    await sendOrderEmails({
      toUser: 'francocas453@gmail.com', // Cambia a userEmail cuando tu dominio esté verificado
      userName,
      orderId: pedido.id!,
      items: pedido.items,
      total: pedido.total,
      address: pedido.address,
      status: pedido.status,
      createdAt: pedido.createdAt,
      mp_payment_id: pedido.mp_payment_id
    });
    console.log("[WEBHOOK] sendOrderEmails ejecutado correctamente");
  } catch (e) {
    console.error("[WEBHOOK] Error enviando emails:", e);
  }

  // Pedido guardado, no exponer datos sensibles
  console.log("Pedido recibido para email:", JSON.stringify(pedido, null, 2));

  // Responder 200 para que Mercado Pago no reintente
  return NextResponse.json({ success: true, id: newOrderRef.key });
}