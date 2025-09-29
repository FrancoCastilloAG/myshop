import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('payment_id');
  if (!paymentId) {
    return NextResponse.json({ error: 'payment_id requerido' }, { status: 400 });
  }
  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      }
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'No se pudo consultar el pago', status: res.status }, { status: 500 });
    }
    const pago = await res.json();
    return NextResponse.json({ status: pago.status, status_detail: pago.status_detail, pago });
  } catch (error) {
    return NextResponse.json({ error: 'Error consultando pago', details: error }, { status: 500 });
  }
}
