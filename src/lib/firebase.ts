import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  onSnapshot,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Comment,
  DirectMessage,
  DraftVideo,
  LiveStream,
  NotificationItem,
  User,
  Video,
} from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test per skill requirements
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

// Initial auto test
testConnection();

// Initial database seeding if collections are empty
export async function seedFirestoreIfEmpty(
  seedUsers: User[],
  seedVideos: Video[],
  seedComments: Comment[],
  seedLiveStreams: LiveStream[]
) {
  try {
    const videoSnap = await getDocs(collection(db, 'videos'));
    if (videoSnap.empty) {
      console.log('Seeding initial data into Firestore...');
      for (const u of seedUsers) {
        await setDoc(doc(db, 'users', u.id), u);
      }
      for (const v of seedVideos) {
        await setDoc(doc(db, 'videos', v.id), v);
      }
      for (const c of seedComments) {
        await setDoc(doc(db, 'comments', c.id), c);
      }
      for (const ls of seedLiveStreams) {
        await setDoc(doc(db, 'liveStreams', ls.id), ls);
      }
      console.log('Seeding finished successfully.');
    }
  } catch (error) {
    console.warn('Initial seed check skipped or non-blocking:', error);
  }
}

// Real-time collection subscriptions
export function subscribeToUsers(callback: (users: User[]) => void): Unsubscribe {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: User[] = [];
      snap.forEach((d) => list.push(d.data() as User));
      if (list.length > 0) callback(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeToVideos(callback: (videos: Video[]) => void): Unsubscribe {
  const path = 'videos';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: Video[] = [];
      snap.forEach((d) => list.push(d.data() as Video));
      if (list.length > 0) callback(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeToComments(callback: (comments: Comment[]) => void): Unsubscribe {
  const path = 'comments';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: Comment[] = [];
      snap.forEach((d) => list.push(d.data() as Comment));
      callback(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeToLiveStreams(callback: (streams: LiveStream[]) => void): Unsubscribe {
  const path = 'liveStreams';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const list: LiveStream[] = [];
      snap.forEach((d) => list.push(d.data() as LiveStream));
      callback(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

// Mutations
export async function syncPublishVideo(video: Video) {
  const path = `videos/${video.id}`;
  try {
    await setDoc(doc(db, 'videos', video.id), video);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncUpdateVideo(videoId: string, partial: Partial<Video>) {
  const path = `videos/${videoId}`;
  try {
    await updateDoc(doc(db, 'videos', videoId), partial);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function syncDeleteVideo(videoId: string) {
  const path = `videos/${videoId}`;
  try {
    await deleteDoc(doc(db, 'videos', videoId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncAddComment(comment: Comment) {
  const path = `comments/${comment.id}`;
  try {
    await setDoc(doc(db, 'comments', comment.id), comment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncUpdateComment(commentId: string, partial: Partial<Comment>) {
  const path = `comments/${commentId}`;
  try {
    await updateDoc(doc(db, 'comments', commentId), partial);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function syncDeleteComment(commentId: string) {
  const path = `comments/${commentId}`;
  try {
    await deleteDoc(doc(db, 'comments', commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncUpdateUser(userId: string, partial: Partial<User>) {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), partial, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function syncSaveDraft(draft: DraftVideo) {
  const path = `drafts/${draft.id}`;
  try {
    await setDoc(doc(db, 'drafts', draft.id), draft);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncDeleteDraft(draftId: string) {
  const path = `drafts/${draftId}`;
  try {
    await deleteDoc(doc(db, 'drafts', draftId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Google Authentication
export async function signInWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  const fbUser = cred.user;

  // Check if user doc exists in Firestore
  const userDocRef = doc(db, 'users', fbUser.uid);
  const existing = await getDoc(userDocRef);

  if (existing.exists()) {
    return existing.data() as User;
  }

  // Create new profile for first-time Google user
  const newUser: User = {
    id: fbUser.uid,
    username: (fbUser.displayName || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 16) || `user_${Date.now().toString().slice(-4)}`,
    displayName: fbUser.displayName || 'Google User',
    email: fbUser.email || '',
    avatar: fbUser.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${fbUser.uid}`,
    bio: 'Joined ☆MEDIA via Google Firebase authentication.',
    createdAt: new Date().toISOString(),
    verified: false,
    role: 'creator',
    canGoLive: true,
    coinBalance: 500,
    region: 'Global',
    subscribedCreatorIds: [],
    subscriptionPrice: 4.99,
    isMonetized: true,
    followers: [],
    following: [],
    blockedUsers: [],
    online: true,
    privacy: {
      privateAccount: false,
      allowComments: 'everyone',
      allowMessages: 'everyone',
      showActivityStatus: true,
    },
    notificationPrefs: {
      likes: true,
      comments: true,
      follows: true,
      messages: true,
      mentions: true,
      earnings: true,
      subscriptions: true,
    },
  };

  await setDoc(userDocRef, newUser);
  return newUser;
}

export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}
