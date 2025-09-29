"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [statusMsg, setStatusMsg] = useState<string>("Validando pago...");

    useEffect(() => {
        // Recupera el resumen de la última compra del localStorage
        const lastOrder = localStorage.getItem("lastOrder");
        if (!lastOrder) {
            setStatusMsg("No se encontró información de la compra.");
            setTimeout(() => router.replace("/"), 3000);
            return;
        }
        const parsedOrder = JSON.parse(lastOrder);
        setOrder(parsedOrder);

        // Intenta obtener el userId de Firebase Auth (localStorage)
        const userStr = localStorage.getItem("firebase:authUser:default");
        let userId: string | null = null;
        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                userId = userObj.uid;
            } catch { }
        }

        // Leer parámetros de MercadoPago
        const paymentId = searchParams.get("payment_id");
        const collectionStatus = searchParams.get("collection_status");
        // Si no hay payment_id, igual intentamos guardar (modo sandbox/local)

        async function validarYGuardarPedido() {
            let pagoAprobado = false;
            if (paymentId) {
                // Validar con la API de MercadoPago
                try {
                    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || process.env.MERCADOPAGO_ACCESS_TOKEN}`
                        }
                    });
                    const pago = await res.json();
                    if (pago.status === "approved") {
                        pagoAprobado = true;
                    }
                } catch {
                    // Si falla la validación, no guardamos
                    setStatusMsg("No se pudo validar el pago. Intenta recargar la página.");
                    return;
                }
            } else if (collectionStatus === "approved") {
                pagoAprobado = true;
            } else {
                // Si no hay payment_id ni status, asumimos éxito (modo local)
                pagoAprobado = true;
            }

            if (userId && parsedOrder && !parsedOrder.savedToDb && pagoAprobado) {
                setStatusMsg("Guardando tu pedido...");
                try {
                    const res = await fetch("/api/pedidos", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId, order: parsedOrder })
                    });
                    const data = await res.json();
                    if (data.success) {
                        localStorage.setItem("lastOrder", JSON.stringify({ ...parsedOrder, savedToDb: true }));
                        setStatusMsg("¡Pago realizado con éxito!");
                        setTimeout(() => router.replace("/perfil"), 3500);
                    } else {
                        setStatusMsg("No se pudo guardar el pedido. Intenta recargar la página.");
                    }
                } catch {
                    setStatusMsg("No se pudo guardar el pedido. Intenta recargar la página.");
                }
            } else if (!pagoAprobado) {
                setStatusMsg("El pago no fue aprobado. No se guardó el pedido.");
                setTimeout(() => router.replace("/"), 3500);
            } else {
                setStatusMsg("¡Pago realizado con éxito!");
                setTimeout(() => router.replace("/perfil"), 3500);
            }
        }
        validarYGuardarPedido();
        // eslint-disable-next-line
        //
    }, []);

    return (
        <div style={{ minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: '#1976d2', fontWeight: 700, fontSize: 28 }}>{statusMsg}</h2>
            {order && (
                <div style={{ marginTop: 18, background: 'rgba(255,255,255,0.7)', borderRadius: 14, boxShadow: '0 2px 8px 0 rgba(33,150,243,0.08)', padding: 18, minWidth: 320 }}>
                    <div style={{ fontWeight: 600, fontSize: 17, color: '#1976d2' }}>Resumen de tu compra</div>
                    <div style={{ fontSize: 15, margin: '8px 0' }}>Total: <b>${order.total?.toLocaleString() || '—'}</b></div>
                    <div style={{ fontSize: 15, marginBottom: 8 }}>Productos:
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                            {order.items?.map((item: any, idx: number) => (
                                <li key={idx} style={{ marginBottom: 4 }}>
                                    <span style={{ fontWeight: 500 }}>{item.name}</span> x{item.quantity} ({item.selectedSize})
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div style={{ fontSize: 15, color: '#555' }}>Dirección: {order.address ? `${order.address.street}, ${order.address.number} - ${order.address.city}, ${order.address.region}, ${order.address.country}` : '—'}</div>
                </div>
            )}
        </div>
    );
}

