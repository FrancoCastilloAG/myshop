import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails } from "./emailUtils";

export async function POST(req: NextRequest) {
  try {
    const pedido = await req.json();
    await sendOrderEmails(pedido);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
