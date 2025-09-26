"use client"
import { Card, CardBody, CardFooter, Image } from "@heroui/react";
import Link from "next/link";
import { clothingList } from "../productsData";

export default function Products() {
  // Usar la lista centralizada de productos

  return (
    <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
      {clothingList.map((item, index) => (
        <Link key={index} href={`/product-detail/${index}`}> 
          <Card isPressable shadow="sm"> 
            <CardBody className="overflow-visible p-0">
              <Image
                alt={item.name}
                className="w-full object-cover h-[140px]"
                radius="lg"
                shadow="sm"
                src={item.img}
                width="100%"
              />
            </CardBody>
            <CardFooter className="text-small justify-between">
              <b>{item.name}</b>
              <p className="text-default-500">{item.price}</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
