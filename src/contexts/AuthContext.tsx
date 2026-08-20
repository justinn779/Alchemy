import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithCredential,
  signInWithPopup,
  linkWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  /** Upgrades the current anonymous ("test mode") session to a real Google account, same uid preserved when possible. */
  linkWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// oxlint-disable-next-line react/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

function describeAuthError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code: unknown }).code);
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return '登入已取消。';
    }
    if (code === 'auth/popup-blocked') {
      return '瀏覽器封鎖了登入視窗，請允許彈出視窗後再試一次。';
    }
    if (code === 'auth/network-request-failed') {
      return '網路連線失敗，請檢查網路後再試一次。';
    }
  }
  return '登入失敗，請稍後再試一次。';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      setError(describeAuthError(err));
      throw err;
    }
  };

  const signInAsGuest = async () => {
    setError(null);
    try {
      await firebaseSignInAnonymously(auth);
    } catch (err) {
      setError(describeAuthError(err));
      throw err;
    }
  };

  const linkWithGoogle = async () => {
    setError(null);
    const current = auth.currentUser;
    if (!current) {
      await signInWithGoogle();
      return;
    }
    try {
      await linkWithPopup(current, new GoogleAuthProvider());
    } catch (err) {
      // That Google account is already a real account elsewhere — sign into
      // it directly instead. The anonymous test-mode session (which never
      // persisted anything of its own) is simply abandoned.
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: unknown }).code === 'auth/credential-already-in-use' &&
        'customData' in err
      ) {
        const credential = GoogleAuthProvider.credentialFromError(
          err as Parameters<typeof GoogleAuthProvider.credentialFromError>[0],
        );
        if (credential) {
          await signInWithCredential(auth, credential);
          return;
        }
      }
      setError(describeAuthError(err));
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signInWithGoogle, signInAsGuest, linkWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
