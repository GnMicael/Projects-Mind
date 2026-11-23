import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export const subscribeOwned = (name, uid, onData, onError) =>
  onSnapshot(query(collection(db, name), where('ownerId', '==', uid)),
    (s) => onData(s.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
const stamp = (name, data) => (name === 'tasks' && 'status' in data ? { ...data, completedAt: data.status === 'done' ? serverTimestamp() : null } : data);
export const createOwned = (name, uid, data) =>
  addDoc(collection(db, name), { ...stamp(name, data), ...(name === 'tasks' && data.order == null ? { order: Date.now() } : {}), ownerId: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
export const updateOwned = (name, id, data) => updateDoc(doc(db, name, id), { ...stamp(name, data), updatedAt: serverTimestamp() });
export const removeOwned = (name, id) => deleteDoc(doc(db, name, id));
