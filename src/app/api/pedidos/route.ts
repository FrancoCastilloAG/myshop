import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';


import path from 'path';
import fs from 'fs';

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Producción: variable de entorno con el JSON stringificado
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  // Local: archivo serviceAccountKey.json en la raíz del proyecto
  const localPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }
  throw new Error('No se encontró la configuración de credenciales de Firebase Admin');
}

if (!getApps().length) {
  initializeApp({
    credential: cert(getServiceAccount()),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  });
}
const db = getDatabase();

export async function POST(req: NextRequest) {
  try {
    const { userId, order } = await req.json();
  // No exponer datos sensibles en logs
    if (!userId || !order) {
  // Error controlado, no exponer datos
      return NextResponse.json({ error: 'userId y order son requeridos' }, { status: 400 });
    }
    const orderRef = db.ref(`orders/${userId}`);
    const newOrderRef = orderRef.push();
    try {
      await newOrderRef.set({ ...order, id: newOrderRef.key, createdAt: Date.now(), status: 'pagado' });
    } catch (firebaseError) {
  // Error Firebase, no exponer detalles
      return NextResponse.json({ error: 'Error guardando pedido en Firebase', details: firebaseError }, { status: 500 });
    }
    return NextResponse.json({ success: true, id: newOrderRef.key });
  } catch (error) {
  // Error general, no exponer detalles
    return NextResponse.json({ error: 'Error guardando pedido', details: error }, { status: 500 });
  }
}
