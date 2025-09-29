import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { items, userEmail } = await req.json();
  try {
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
          success: 'https://localhost:3000/success',
          failure: 'https://localhost:3000/failure',
          pending: 'https://localhost:3000/pending'
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
