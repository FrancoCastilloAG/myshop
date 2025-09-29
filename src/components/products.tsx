"use client"
import { Card, CardBody, CardFooter, Image, CircularProgress } from "@heroui/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { db } from "../firebaseconfig";
import { ref as dbRef, onValue } from "firebase/database";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    const productsRef = dbRef(db, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(Object.entries(data).map(([id, prod]: any) => ({ id, ...prod })));
      } else {
        setProducts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="gap-8 grid grid-cols-2 sm:grid-cols-4" style={{padding: '0rem 0', margin: '0.5rem auto 0 auto', justifyContent: 'center', alignItems: 'flex-start', maxWidth: '1200px'}}>
      {products.length === 0 ? (
        <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', width: '100%' }}>
          <CircularProgress size="lg" color="primary" />
        </div>
      ) : (
        products.map((item, index) => (
          <Link key={item.id} href={`/product-detail/${item.id}`}> 
            <Card isPressable shadow="sm" className="glass" style={{ width: '100%', minHeight: 320, maxHeight: 340, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <CardBody className="overflow-visible p-0" style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {/* Fondo blur con color dominante */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    borderRadius: 16,
                    filter: 'blur(32px) saturate(120%)',
                    background: item.dominantColor || '#e3e6ee',
                    opacity: 0.45,
                    transition: 'background 0.3s',
                  }}
                />
                <Image
                  alt={item.name}
                  className="object-contain"
                  radius="none"
                  shadow="none"
                  src={item.imageUrl}
                  width={240}
                  height={240}
                  style={{ height: '100%', width: '100%', zIndex: 1, background: 'transparent', border: 'none', boxShadow: 'none', objectFit: 'contain', display: 'block' }}
                />
              </CardBody>
              <CardFooter className="text-small justify-between" style={{ padding: '0.75rem 1rem' }}>
                <b>{item.name}</b>
                <p className="text-default-500">${item.price}</p>
              </CardFooter>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
