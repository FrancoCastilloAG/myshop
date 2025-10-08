import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {

    // Esperado: cada item debe tener id, selectedSize, quantity, title, unit_price
    // Ejemplo:
    // {
    //   id: "-OaLIhoHBrFJj1sgBdv7",
    //   selectedSize: "M",
    //   quantity: 2,
    //   title: "Polera Ralph Lauren",
    //   unit_price: 20000
    // }

    const { items, userEmail, shipping, address, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items es requerido y debe ser un array' }, { status: 400 });
    }
    // Validar que cada item tenga id y selectedSize
    for (const item of items) {
      if (!item.id || !item.selectedSize) {
        return NextResponse.json({
          error: 'Cada item debe tener id y selectedSize',
          item
        }, { status: 400 });
      }
    }

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Calcular total
    const total =
      items.reduce((acc: number, item: any) => acc + item.unit_price * item.quantity, 0) +
      (shipping || 0);

    // Crear preferencia en Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items,
        payer: { email: userEmail },
        external_reference: userId, // 👈 importante
        back_urls: {
          success: `${BASE_URL}/success`,
          failure: `${BASE_URL}/failure`,
          pending: `${BASE_URL}/pending`,
        },
        auto_return: 'approved',
        notification_url: `${BASE_URL}/api/webhook`,
        metadata: {
          userId, // 👈 lo guardamos también como respaldo
          items: JSON.stringify(items),
          address: JSON.stringify(address),
          shipping: shipping?.toString(),
          total: total.toString(),
        },
      }),
    });

    const data = await response.json();

    // Retornar init_point para redirigir al checkout
    return NextResponse.json({ init_point: data.init_point, mp_response: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creando preferencia', details: error },
      { status: 500 }
    );
  }
}
