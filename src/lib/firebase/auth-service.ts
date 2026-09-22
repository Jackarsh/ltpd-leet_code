import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  applyActionCode,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./config";

export interface FirebaseVerificationResult {
  success: boolean;
  error?: string;
}

export interface SocialAuthResult {
  success: boolean;
  user?: {
    email: string;
    displayName: string | null;
    photoURL: string | null;
    uid: string;
  };
  error?: string;
}

/**
 * Creates/authenticates user in Firebase and sends an official email verification link.
 */
export async function sendFirebaseVerification(
  email: string,
  password: string
): Promise<FirebaseVerificationResult> {
  if (!isFirebaseConfigured() || !auth) {
    return {
      success: false,
      error: "Firebase is not configured yet. Add your Firebase keys to .env to send real verification emails.",
    };
  }

  try {
    let user: User | null = null;

    try {
      // 1. Try to create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
    } catch (createErr: unknown) {
      const err = createErr as { code?: string };
      // If user already exists in Firebase Auth, sign in to resend verification
      if (err.code === "auth/email-already-in-use") {
        const loginCredential = await signInWithEmailAndPassword(auth, email, password);
        user = loginCredential.user;
      } else {
        throw createErr;
      }
    }

    if (!user) {
      return { success: false, error: "Failed to initialize Firebase user." };
    }

    // 2. Dispatch official Firebase verification email with callback URL
    const appOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const actionCodeSettings = {
      url: `${appOrigin}/auth/firebase-verify?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true,
    };

    await sendEmailVerification(user, actionCodeSettings);

    // 3. Sign out of Firebase so unverified session is not retained
    await signOut(auth);

    return { success: true };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error("Firebase sendEmailVerification error:", error);

    let message = error.message || "Failed to send verification email via Firebase.";
    if (error.code === "auth/invalid-email") message = "The email address is invalid.";
    if (error.code === "auth/weak-password") message = "Password should be at least 6 characters in Firebase.";
    if (error.code === "auth/too-many-requests") message = "Too many requests. Please wait a moment and try again.";

    return { success: false, error: message };
  }
}

/**
 * Validates an email action code sent by Firebase in the verification link.
 */
export async function verifyFirebaseCode(actionCode: string): Promise<FirebaseVerificationResult> {
  if (!isFirebaseConfigured() || !auth) {
    return {
      success: false,
      error: "Firebase is not configured.",
    };
  }

  try {
    await applyActionCode(auth, actionCode);
    return { success: true };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error("Firebase applyActionCode error:", error);

    let message = "Invalid or expired verification link.";
    if (error.code === "auth/expired-action-code") message = "This verification link has expired.";
    if (error.code === "auth/invalid-action-code") message = "Invalid verification code or link has already been used.";

    return { success: false, error: message };
  }
}

/**
 * Initiates Google Sign-In via Firebase popup.
 */
export async function signInWithGoogle(): Promise<SocialAuthResult> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: false, error: "Firebase is not configured." };
  }
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (!user.email) {
      return { success: false, error: "Google account does not have an email associated." };
    }
    return {
      success: true,
      user: {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
      },
    };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error("Google sign-in error:", error);
    let message = error.message || "Failed to sign in with Google.";
    if (error.code === "auth/popup-closed-by-user") message = "Sign-in popup was closed.";
    if (error.code === "auth/operation-not-allowed") {
      message = "Google Sign-In is not enabled yet in your Firebase Console (Authentication -> Sign-in method -> Google).";
    }
    return { success: false, error: message };
  }
}

/**
 * Initiates Apple Sign-In via Firebase popup.
 */
export async function signInWithApple(): Promise<SocialAuthResult> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: false, error: "Firebase is not configured." };
  }
  try {
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (!user.email) {
      return { success: false, error: "Apple account did not return an email." };
    }
    return {
      success: true,
      user: {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
      },
    };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error("Apple sign-in error:", error);
    let message = error.message || "Failed to sign in with Apple.";
    if (error.code === "auth/popup-closed-by-user") message = "Sign-in popup was closed.";
    if (error.code === "auth/operation-not-allowed") {
      message = "Apple Sign-In is not enabled yet in your Firebase Console (Authentication -> Sign-in method -> Apple).";
    }
    return { success: false, error: message };
  }
}

