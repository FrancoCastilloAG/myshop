import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { items, userEmail, shipping, address ,userId} = await req.json();
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const total = items.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0) + (shipping || 0);
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items,
        payer: { email: userEmail },
        external_reference: userId,
        back_urls: {
          success: `${BASE_URL}/success`,
          failure: `${BASE_URL}/failure`,
          pending: `${BASE_URL}/pending`
        },
        auto_return: 'approved',
        metadata: {
          items: JSON.stringify(items),
          address: JSON.stringify(address),
          shipping: shipping?.toString(),
          total: total.toString()
        }
      })
    });
    const data = await response.json();
    return NextResponse.json({ init_point: data.init_point, mp_response: data });
  } catch (error) {
    return NextResponse.json({ error: 'Error creando preferencia', details: error }, { status: 500 });
  }
}
