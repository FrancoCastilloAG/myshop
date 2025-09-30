import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getDatabase();

export async function POST(req: NextRequest) {
  try {
    const { userId, order } = await req.json();
    console.log("[API/pedidos] userId:", userId);
    console.log("[API/pedidos] order:", order);
    if (!userId || !order) {
      console.error("[API/pedidos] Faltan datos: userId u order");
      return NextResponse.json({ error: 'userId y order son requeridos' }, { status: 400 });
    }
    const orderRef = ref(db, `orders/${userId}`);
    const newOrderRef = push(orderRef);
    try {
      await set(newOrderRef, { ...order, id: newOrderRef.key, createdAt: Date.now(), status: 'pagado' });
    } catch (firebaseError) {
      console.error("[API/pedidos] Error Firebase:", firebaseError);
      return NextResponse.json({ error: 'Error guardando pedido en Firebase', details: firebaseError }, { status: 500 });
    }
    return NextResponse.json({ success: true, id: newOrderRef.key });
  } catch (error) {
    console.error("[API/pedidos] Error general:", error);
    return NextResponse.json({ error: 'Error guardando pedido', details: error }, { status: 500 });
  }
}
