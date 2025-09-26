import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { items, userEmail } = req.body;
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
            success: 'https://tu-tienda.com/success',
            failure: 'https://tu-tienda.com/failure',
            pending: 'https://tu-tienda.com/pending'
          },
          auto_return: 'approved'
        })
      });
      const data = await response.json();
      res.status(200).json({ init_point: data.init_point, mp_response: data });
    } catch (error) {
      res.status(500).json({ error: 'Error creando preferencia', details: error });
    }
  } else {
    res.status(405).end();
  }
}
