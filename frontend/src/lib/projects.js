import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const col = collection(db, 'projects');

export const subscribeProjects = (uid, onData, onError) =>
  onSnapshot(query(col, where('ownerId', '==', uid)),
    (s) => onData(s.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);

export const getProject = async (id) => {
  const s = await getDoc(doc(db, 'projects', id));
  return s.exists() ? { id: s.id, ...s.data() } : null;
};

export const createProject = (uid, data) =>
  addDoc(col, { progress: 0, status: 'Planejamento', priority: 'Média', ...data, ownerId: uid, favorite: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateProject = (id, data) => updateDoc(doc(db, 'projects', id), { ...data, updatedAt: serverTimestamp() });
export const deleteProject = async (uid, id) => {
  const batch = writeBatch(db);
  for (const name of ['tasks', 'events', 'stakeholders', 'risks', 'goals', 'milestones', 'notes']) {
    const snap = await getDocs(query(collection(db, name), where('ownerId', '==', uid), where('projectId', '==', id)));
    snap.docs.forEach((d) => batch.delete(d.ref));
  }
  batch.delete(doc(db, 'projects', id));
  await batch.commit();
};

export const duplicateProject = (uid, p) => {
  const { id, createdAt, updatedAt, ownerId, ...rest } = p;
  return createProject(uid, { ...rest, name: `${p.name} (cópia)`, favorite: false, status: 'Planejamento', progress: 0 });
};
