"use client";
import React from "react";
import { useParams } from "next/navigation";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Card, CardBody, CardFooter, Button, Select, SelectItem, Input } from "@heroui/react";
import { clothingList } from "@/productsData";
import { useCart } from "@/CartContext";

export default function ProductDetail() {
	const params = useParams();
	const productIndex = params?.id ? Number(params.id) : -1;
	const product = clothingList[productIndex];
	const { addToCart } = useCart();
	const [selectedSize, setSelectedSize] = React.useState("");
	const [quantity, setQuantity] = React.useState(1);

	if (!product) {
		return <div>Producto no encontrado</div>;
	}

	const handleAddToCart = () => {
		if (!selectedSize) return alert("Selecciona una talla");
		if (quantity < 1) return alert("Cantidad inválida");
		// Filtrar tallas válidas
		const validSizes: Record<string, number> = {};
		Object.entries(product.sizes).forEach(([size, stock]) => {
			if (typeof stock === "number" && !isNaN(stock)) {
				validSizes[size] = stock;
			}
		});
		addToCart({
			...product,
			sizes: validSizes,
			selectedSize,
			quantity,
		});
	};

	return (
		<div style={{ maxWidth: 500, margin: "2rem auto" }}>
			<Card className="glass">
				<CardBody>
					<h2 className="mb-2">Índice: {productIndex}</h2>
					<img src={product.img} alt={product.name} className="w-full rounded-lg" />
					<h2 className="mt-4">{product.name}</h2>
					<p className="font-bold text-lg">{product.price}</p>
					<div className="my-4">
						<b>Tallas disponibles:</b>
						<ul>
							{Object.entries(product.sizes).map(([size, stock]) => (
								<li key={size}>{size}: {stock} disponibles</li>
							))}
						</ul>
					</div>
					<Select
						label="Talla"
						selectedKeys={selectedSize ? [selectedSize] : []}
						onSelectionChange={keys => {
							const keyArr = Array.from(keys as Set<string>);
							setSelectedSize(keyArr[0] || "");
						}}
						className="mb-4 glass"
						fullWidth
					>
						{Object.keys(product.sizes).map(size => (
							<SelectItem key={size} className="glass">{size}</SelectItem>
						))}
					</Select>
					<Input
						type="number"
						label="Cantidad"
						value={String(quantity)}
						onChange={e => setQuantity(Number(e.target.value))}
						min={1}
						max={selectedSize ? product.sizes[selectedSize as keyof typeof product.sizes] : 1}
						className="mb-4 glass"
						fullWidth
					/>
					<Button className="btn-glass" startContent={<ShoppingCartIcon />} onClick={handleAddToCart} fullWidth>
						Agregar al carrito
					</Button>
				</CardBody>
			</Card>
		</div>
	);
}
