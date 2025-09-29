"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebaseconfig";
import { ref as dbRef, get as dbGet } from "firebase/database";
import dynamic from "next/dynamic";

const AddProduct = dynamic(() => import("./add-product"), { ssr: false });
const ManageProducts = dynamic(() => import("./manage-products"), { ssr: false });

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/");
        return;
      }
      // Limpieza: sin logs en producción
      const roleSnap = await dbGet(dbRef(db, `users/${user.uid}/role`));
      if (roleSnap.exists() && roleSnap.val() === "admin") {
        setIsAdmin(true);
      } else {
        router.replace("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };


  if (loading) return <div>Cargando...</div>;
  if (!isAdmin) return null;

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto" }}>
      <h2>Panel de Administrador</h2>
      <AddProduct />
      <div style={{ marginTop: 40 }}>
        <ManageProducts />
      </div>
    </div>
  );
}
