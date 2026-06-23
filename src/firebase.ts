import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  getDocFromServer,
  onSnapshot,
  query,
  orderBy,
  addDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Article } from './types';
import { INITIAL_ARTICLES } from './data';
import { parseLegacyDateToISO } from './utils/date';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with Database ID (Critical)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Test Connection on Boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test-connection-ledger', 'status'));
    console.log("Firebase Connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
  }
}
testConnection();

// Operation Types defined by the Firebase Integration Skill instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Error Interface
export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Universal Firestore error catcher
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seeding function to populates initial news ledger in the cloud
export async function seedArticlesIfEmpty() {
  const path = 'articles';
  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) {
      console.log('No articles found in Firestore database. Seeding initial reports...');
      for (const article of INITIAL_ARTICLES) {
        const seededArticle = {
          ...article,
          publishedAt: isNaN(Date.parse(article.publishedAt)) 
            ? parseLegacyDateToISO(article.publishedAt)
            : article.publishedAt
        };
        await setDoc(doc(db, 'articles', article.id), seededArticle);
      }
      console.log('Seeding finished successfully.');
    } else {
      // Migrate existing legacy articles in Firestore to proper ISO timestamps
      snapshot.forEach(async (snapshotDoc) => {
        const data = snapshotDoc.data() as Article;
        if (data.publishedAt && isNaN(Date.parse(data.publishedAt))) {
          const newDate = parseLegacyDateToISO(data.publishedAt);
          console.log(`Migrating article ${data.id} legacy date "${data.publishedAt}" to "${newDate}"`);
          await setDoc(doc(db, 'articles', data.id), { ...data, publishedAt: newDate });
        }
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Real-time synchronization of all articles
export function subscribeToArticles(callback: (articles: Article[]) => void) {
  const path = 'articles';
  const q = query(collection(db, path));
  
  return onSnapshot(q, (snapshot) => {
    const list: Article[] = [];
    snapshot.forEach((snapshotDoc) => {
      list.push(snapshotDoc.data() as Article);
    });
    // Sort articles so newer/modified or default ordered are displayed beautifully
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

// Save or Update an Article in the cloud
export async function saveArticleToFirestore(article: Article) {
  const path = `articles/${article.id}`;
  try {
    await setDoc(doc(db, 'articles', article.id), article);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Delete an Article in the cloud
export async function deleteArticleFromFirestore(id: string) {
  const path = `articles/${id}`;
  try {
    await deleteDoc(doc(db, 'articles', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Real-time comment stream subcollection listener
export function subscribeToArticleComments(
  articleId: string, 
  callback: (comments: Array<{ name: string; text: string; date: string }>) => void
) {
  const path = `articles/${articleId}/comments`;
  const q = query(collection(db, 'articles', articleId, 'comments'));
  
  return onSnapshot(q, (snapshot) => {
    const list: Array<{ name: string; text: string; date: string }> = [];
    snapshot.forEach((snapshotDoc) => {
      const data = snapshotDoc.data();
      list.push({
        name: data.name || 'Anonymous Reader',
        text: data.text || '',
        date: data.date || 'Just now'
      });
    });
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, path);
  });
}

// Add comments under articles inside subcollection
export async function addCommentToFirestore(
  articleId: string, 
  comment: { name: string; text: string; date: string }
) {
  const path = `articles/${articleId}/comments`;
  try {
    // Generate simple doc id or add doc to subcollection
    const collRef = collection(db, 'articles', articleId, 'comments');
    await addDoc(collRef, comment);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Sync trigger: accounts aligned to enable direct sync to AI Studio.

