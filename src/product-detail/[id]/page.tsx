"use client";
import { clothingList } from "../../productsData";
import { useParams } from "next/navigation";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Button, IconButton, Badge, Drawer, List, ListItem, ListItemText } from "@mui/material";
import { useState } from "react";
import { useCart } from "../../CartContext";

export default function ProductDetail() {
	const params = useParams();
	const productIndex = params?.id ? Number(params.id) : -1;
	const product = clothingList[productIndex];
	const { cart, addToCart } = useCart();
	const [cartOpen, setCartOpen] = useState(false);

	if (!product) {
		return <div>Producto no encontrado</div>;
	}

	return (
		<div style={{ maxWidth: 500, margin: "2rem auto", padding: 20, border: "1px solid #eee", borderRadius: 8 }}>
			{/* Carrito en la parte superior derecha */}
			<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
				<IconButton color="primary" onClick={() => setCartOpen(true)}>
					<Badge badgeContent={cart.length} color="secondary">
						<ShoppingCartIcon />
					</Badge>
				</IconButton>
			</div>
			<Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
				<div style={{ width: 300, padding: 16 }}>
					<h3>Carrito</h3>
					{cart.length === 0 ? (
						<p>El carrito está vacío</p>
					) : (
						<List>
							{cart.map((item, idx) => (
								<ListItem key={idx}>
									<ListItemText primary={item.name} secondary={item.price} />
								</ListItem>
							))}
						</List>
					)}
				</div>
			</Drawer>
			<img src={product.img} alt={product.name} style={{ width: "100%", borderRadius: 8 }} />
			<h2 style={{ marginTop: 16 }}>{product.name}</h2>
			<p style={{ fontWeight: "bold", fontSize: 18 }}>{product.price}</p>
			<div style={{ margin: "1rem 0" }}>
				<b>Tallas disponibles:</b>
				<ul>
					{Object.entries(product.sizes).map(([size, stock]) => (
						<li key={size}>{size}: {stock} disponibles</li>
					))}
				</ul>
			</div>
			<Button variant="contained" color="primary" startIcon={<ShoppingCartIcon />} onClick={() => addToCart(product)}>
				Agregar al carrito
			</Button>
		</div>
	);
}
