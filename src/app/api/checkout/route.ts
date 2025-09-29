import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { items, userEmail } = await req.json();
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items,
        payer: { email: userEmail },
        back_urls: {
          success: `${BASE_URL}/success`,
          failure: `${BASE_URL}/failure`,
          pending: `${BASE_URL}/pending`
        },
        auto_return: 'approved'
      })
    });
    const data = await response.json();
    return NextResponse.json({ init_point: data.init_point, mp_response: data });
  } catch (error) {
    return NextResponse.json({ error: 'Error creando preferencia', details: error }, { status: 500 });
  }
}
