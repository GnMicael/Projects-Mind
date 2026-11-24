import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { createOwned } from './crud';
import { ord } from '../config/tasks';

const col = collection(db, 'projects');
// Firestore recusa valores undefined; descarta-os para que os padrões (ex.: prioridade 'Média') valham
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

export const subscribeProjects = (uid, onData, onError) =>
  onSnapshot(query(col, where('ownerId', '==', uid)),
    (s) => onData(s.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);

export const getProject = async (id) => {
  const s = await getDoc(doc(db, 'projects', id));
  return s.exists() ? { id: s.id, ...s.data() } : null;
};

export const createProject = (uid, data) =>
  addDoc(col, { progress: 0, status: 'Planejamento', priority: 'Média', ...clean(data), ownerId: uid, favorite: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateProject = (id, data) => updateDoc(doc(db, 'projects', id), { ...clean(data), updatedAt: serverTimestamp() });
export const deleteProject = async (uid, id) => {
  const batch = writeBatch(db);
  for (const name of ['tasks', 'events', 'stakeholders', 'risks', 'goals', 'milestones', 'notes']) {
    const snap = await getDocs(query(collection(db, name), where('ownerId', '==', uid), where('projectId', '==', id)));
    snap.docs.forEach((d) => batch.delete(d.ref));
  }
  batch.delete(doc(db, 'projects', id));
  await batch.commit();
};

export const duplicateProject = async (uid, p, tasks = []) => {
  const { id, createdAt, updatedAt, ownerId, ...rest } = p;
  const ref = await createProject(uid, { ...rest, name: `${p.name} (cópia)`, favorite: false, status: 'Planejamento', progress: 0 });
  const first = p.columns?.[0]?.id || 'todo';
  const base = Date.now();
  await Promise.all([...tasks].sort((a, b) => ord(a) - ord(b)).map((t, i) => {
    const { id: _i, ownerId: _o, createdAt: _c, updatedAt: _u, completedAt: _d, order: _r, ...rest2 } = t;
    return createOwned('tasks', uid, { ...rest2, projectId: ref.id, status: first, order: base + i,
      checklist: (t.checklist || []).map((x) => ({ ...x, done: false })), subtasks: (t.subtasks || []).map((x) => ({ ...x, done: false })) });
  }));
  return ref;
};
