import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, set } from "firebase/database";

// Config Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getDatabase();

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
    

    if (!userId) {
      console.error("[WEBHOOK] userId no encontrado en external_reference");
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    // Guardar pedido en Firebase
    const orderRef = ref(db, `orders/${userId}`);
    const newOrderRef = push(orderRef);

    await set(newOrderRef, {
      id: newOrderRef.key,
      items,
      address,
      total,
      status: "pagado",
      mp_payment_id: paymentId,
      createdAt: Date.now(),
    });

    console.log("[WEBHOOK] Pedido guardado con éxito en Firebase:", newOrderRef.key);

    // Responder 200 para que Mercado Pago no reintente
    return NextResponse.json({ success: true, id: newOrderRef.key });
  } catch (err) {
    console.error("[WEBHOOK] Error general:", err);
    return NextResponse.json({ error: "Error en webhook", details: err }, { status: 500 });
  }
}
