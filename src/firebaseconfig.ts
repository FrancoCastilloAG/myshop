
/**
 * Crea un usuario en la base de datos si no existe, con rol "user" por defecto.
 */
export async function createUserIfNotExists({ uid, email, displayName }: { uid: string; email: string | null; displayName: string | null; }) {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) {
    await set(userRef, {
      email,
      displayName,
      role: "user"
    });
  }
}



import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};




import { getDatabase, ref, set, get } from "firebase/database";
// Eliminado: Firebase Storage


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
// export const storage = getStorage(app); // Eliminado: no se usa Storage

// Eliminada función uploadImageToFirebase: ahora se usa Cloudinary
