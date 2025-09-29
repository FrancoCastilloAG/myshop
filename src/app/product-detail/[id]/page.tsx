"use client";
import React from "react";

import { useParams } from "next/navigation";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Card, CardBody, Button, Select, SelectItem, Input } from "@heroui/react";
import { useCart } from "../../../CartContext";
import { db } from "../../../firebaseconfig";
import { ref as dbRef, get as dbGet } from "firebase/database";


	export default function ProductDetail() {
		const params = useParams();
		const { addToCart } = useCart();
		const [selectedSize, setSelectedSize] = React.useState("");
		const [quantity, setQuantity] = React.useState(1);
		const [product, setProduct] = React.useState<any>(null);
		const [loading, setLoading] = React.useState(true);

		React.useEffect(() => {
			const fetchProduct = async () => {
				if (!params?.id) return setLoading(false);
				const snap = await dbGet(dbRef(db, `products/${params.id}`));
				if (snap.exists()) {
					setProduct(snap.val());
				}
				setLoading(false);
			};
			fetchProduct();
		}, [params?.id]);

		if (loading) return <div>Cargando producto...</div>;
		if (!product) return <div>Producto no encontrado</div>;

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
							<div style={{ maxWidth: 900, margin: "2rem auto" }}>
								<Card className="glass">
									<CardBody>
										<div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
											<div style={{ flex: '0 0 320px', maxWidth: 320 }}>
												<img src={product.imageUrl || product.img} alt={product.name} style={{ width: '100%', borderRadius: 12 }} />
											</div>
											<div style={{ flex: 1 }}>
												<h2 className="mt-4">{product.name}</h2>
												<p className="font-bold text-lg">{product.price}</p>
												<div className="my-4">
													<b>Tallas disponibles:</b>
													<ul>
														{Object.entries(product.sizes).map(([size, stock]) => (
															<li key={size}>{size}: {String(stock)} disponibles</li>
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
											</div>
										</div>
									</CardBody>
								</Card>
							</div>
						);
	}
