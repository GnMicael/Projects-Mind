import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile, signInWithPopup, signInWithRedirect,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u);
    setAuthReady(true);
    if (!u) { setProfile(null); setProfileReady(true); } else setProfileReady(false);
  }), []);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    return onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        // primeiro acesso (ex.: Google): cria o perfil base
        await setDoc(ref, { name: user.displayName || '', email: user.email, onboardingCompleted: false, createdAt: serverTimestamp() });
        return;
      }
      setProfile(snap.data());
      setProfileReady(true);
    });
  }, [user]);

  const register = async ({ name, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), { name, email, onboardingCompleted: false, createdAt: serverTimestamp() });
  };
  const login = ({ email, password }) => signInWithEmailAndPassword(auth, email, password);
  const google = () => (isMobile() ? signInWithRedirect(auth, googleProvider) : signInWithPopup(auth, googleProvider));
  const reset = (email) => sendPasswordResetEmail(auth, email);
  const logout = () => signOut(auth);
  const saveProfile = (data) => setDoc(doc(db, 'users', user.uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });

  return (
    <Ctx.Provider value={{ user, profile, loading: !authReady || !profileReady, register, login, google, reset, logout, saveProfile }}>
      {children}
    </Ctx.Provider>
  );
}
