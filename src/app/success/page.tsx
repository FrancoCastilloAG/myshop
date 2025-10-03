"use client";
import { useEffect, useState, Suspense } from "react";
import { getUserData, UserData } from "@/userUtils";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [statusMsg, setStatusMsg] = useState<string>("Validando pago...");


    useEffect(() => {
        // Leer parámetros de MercadoPago
        const paymentId = searchParams.get("payment_id");
        const collectionStatus = searchParams.get("collection_status");

        let unsubscribe: (() => void) | null = null;
        let resolved = false;

        async function obtenerResumenPedido(): Promise<any | null> {
            // 1. Intenta localStorage (flujo clásico)
            const lastOrder = localStorage.getItem("lastOrder");
            if (lastOrder) {
                try {
                    return JSON.parse(lastOrder);
                } catch {}
            }
            // 2. Si no hay, intenta desde MercadoPago (metadata)
            if (paymentId) {
                try {
                    const res = await fetch(`/api/validate-payment?payment_id=${paymentId}`);
                    const pago = await res.json();
                    if (pago.pago && pago.pago.metadata) {
                        return {
                            ...pago.pago.metadata,
                            savedToDb: false // para mantener la lógica
                        };
                    }
                } catch {}
            }
            return null;
        }

        function handleNoAuth() {
            setStatusMsg("Debes iniciar sesión para guardar tu pedido.");
            setTimeout(() => router.replace("/login"), 3500);
        }

        async function validarYGuardarPedido(retries = 0) {
            let pagoAprobado = false;
            const userData: UserData = await getUserData();
            let userId = userData.uid;
            let resumenPedido = await obtenerResumenPedido();
            console.log('[SUCCESS] userId:', userId);
            console.log('[SUCCESS] resumenPedido:', resumenPedido);
            if (!resumenPedido) {
                setStatusMsg("No se encontró información de la compra.");
                setTimeout(() => router.replace("/"), 3000);
                return;
            }
            setOrder(resumenPedido);
            if (paymentId) {
                // Validar con el endpoint backend seguro
                try {
                    const res = await fetch(`/api/validate-payment?payment_id=${paymentId}`);
                    const pago = await res.json();
                    if (pago.status === "approved") {
                        pagoAprobado = true;
                    }
                } catch (e) {
                    console.error('[SUCCESS] Error validando pago:', e);
                    setStatusMsg("No se pudo validar el pago. Intenta recargar la página.");
                    return;
                }
            } else if (collectionStatus === "approved") {
                pagoAprobado = true;
            } else {
                pagoAprobado = true;
            }

            if (!userId && retries < 5) {
                setStatusMsg("Esperando sesión de usuario...");
                setTimeout(() => validarYGuardarPedido(retries + 1), 700);
                return;
            }

            if (userId && resumenPedido && !resumenPedido.savedToDb && pagoAprobado) {
                setStatusMsg("Guardando tu pedido...");
                try {
                    console.log('[SUCCESS] Enviando a /api/pedidos:', { userId, order: resumenPedido });
                    const res = await fetch("/api/pedidos", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId, order: resumenPedido })
                    });
                    const data = await res.json();
                    console.log('[SUCCESS] Respuesta /api/pedidos:', data);
                    if (data.success) {
                        localStorage.setItem("lastOrder", JSON.stringify({ ...resumenPedido, savedToDb: true }));
                        setStatusMsg("¡Pago realizado con éxito!");
                        setTimeout(() => router.replace("/perfil"), 3500);
                    } else {
                        setStatusMsg("No se pudo guardar el pedido. Intenta recargar la página.");
                    }
                } catch (e) {
                    console.error('[SUCCESS] Error guardando pedido:', e);
                    setStatusMsg("No se pudo guardar el pedido. Intenta recargar la página.");
                }
            } else if (!pagoAprobado) {
                setStatusMsg("El pago no fue aprobado. No se guardó el pedido.");
                setTimeout(() => router.replace("/"), 3500);
            } else if (!userId) {
                handleNoAuth();
            } else {
                setStatusMsg("¡Pago realizado con éxito!");
                setTimeout(() => router.replace("/perfil"), 3500);
            }
        }

        validarYGuardarPedido();
        // eslint-disable-next-line
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

