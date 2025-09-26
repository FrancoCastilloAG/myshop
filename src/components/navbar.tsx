"use client"
import React, { useState } from "react";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { IconButton, Badge, Drawer, List, ListItem, ListItemText } from "@mui/material";
import { useCart } from "../CartContext";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@heroui/react";

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];

  const { cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <AcmeLogo />
          <p className="font-bold text-inherit">ACME</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarBrand>
          <AcmeLogo />
          <p className="font-bold text-inherit">ACME</p>
        </NavbarBrand>
        <NavbarItem>
          <Link color="foreground" href="#">
            Features
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link aria-current="page" href="#">
            Customers
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Integrations
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="warning" href="#" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
        <NavbarItem>
          <IconButton color="primary" onClick={() => setCartOpen(true)}>
            <Badge badgeContent={cart.length} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </NavbarItem>
      </NavbarContent>

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

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 2 ? "warning" : index === menuItems.length - 1 ? "danger" : "foreground"
              }
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}

