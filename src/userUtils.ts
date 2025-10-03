// Centraliza la obtención de datos del usuario autenticado y su rol/dirección
import { auth, db } from "./firebaseconfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref as dbRef, get as dbGet } from "firebase/database";

export type UserData = {
  user: User | null;
  uid: string | null;
  role: string | null;
  address: any;
};

export function listenUserData(callback: (data: UserData) => void) {
  let unsub = onAuthStateChanged(auth, async (user) => {
    let role: string | null = null;
    let address: any = null;
    let uid: string | null = user?.uid || null;
    if (user) {
      // Rol
      const roleSnap = await dbGet(dbRef(db, `users/${user.uid}/role`));
      role = roleSnap.exists() ? roleSnap.val() : null;
      // Dirección principal
      const addrSnap = await dbGet(dbRef(db, `users/${user.uid}/addresses`));
      if (addrSnap.exists()) {
        const addresses = addrSnap.val();
        address = Array.isArray(addresses) ? addresses[0] : addresses;
      }
    }
    callback({ user, uid, role, address });
  });
  return unsub;
}

export async function getUserData(): Promise<UserData> {
  return new Promise((resolve) => {
    listenUserData((data) => {
      resolve(data);
    });
  });
}
