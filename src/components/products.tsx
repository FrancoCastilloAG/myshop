"use client"
import { Card, CardBody, CardFooter, Image, Button } from "@heroui/react";
import Link from "next/link";
import { clothingList } from "../productsData";

export default function Products() {
  // Usar la lista centralizada de productos

  return (
  <div className="gap-8 grid grid-cols-2 sm:grid-cols-4" style={{padding: '0rem 0', margin: '0.5rem auto 0 auto', justifyContent: 'center', alignItems: 'flex-start', maxWidth: '1200px'}}>
      {clothingList.map((item, index) => (
        <Link key={index} href={`/product-detail/${index}`}> 
          <Card isPressable shadow="sm" className="glass" style={{ width: '100%', minHeight: 320, maxHeight: 340, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardBody className="overflow-visible p-0" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                alt={item.name}
                className="object-cover rounded-lg"
                radius="lg"
                shadow="sm"
                src={item.img}
                width={180}
                height={180}
                style={{ maxHeight: 180, maxWidth: 180 }}
              />
            </CardBody>
            <CardFooter className="text-small justify-between" style={{ padding: '0.75rem 1rem' }}>
              <b>{item.name}</b>
              <p className="text-default-500">{item.price}</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
