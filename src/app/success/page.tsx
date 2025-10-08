"use client";
import { useEffect, useState, Suspense } from "react";
import { useCart } from "@/CartContext";
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
  const searchParams = useSearchParams();
  const collectionStatus = searchParams.get("collection_status");
  const paymentStatus = collectionStatus === "approved";
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(paymentStatus);

  useEffect(() => {
    if (paymentStatus) {
      setLoading(true);
      setTimeout(() => {
        clearCart();
        setLoading(false);
      }, 3000);
    }
    // eslint-disable-next-line
  }, [paymentStatus]);

  return (
    <div style={{ minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {paymentStatus && loading ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <svg style={{ margin: 12 }} width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="20" stroke="#1976d2" strokeWidth="4" opacity="0.2" />
              <circle cx="24" cy="24" r="20" stroke="#1976d2" strokeWidth="4" strokeDasharray="100" strokeDashoffset="60" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
            <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 18 }}>Procesando tu compra...</div>
          </div>
        </>
      ) : (
        <>
          <h2 style={{ color: paymentStatus ? '#1976d2' : '#e53935', fontWeight: 700, fontSize: 28 }}>
            {paymentStatus ? '¡Pago realizado con éxito!' : 'El pago no fue aprobado.'}
          </h2>
          <div style={{ marginTop: 18, fontSize: 16, color: '#555', textAlign: 'center' }}>
            {paymentStatus
              ? 'Gracias por tu compra. Pronto recibirás un correo con el resumen de tu pedido.'
              : 'No se pudo procesar el pago. Si tienes dudas, contáctanos.'}
          </div>
        </>
      )}
    </div>
  );
}

