import { auth } from '@/firebase'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'

// Googleログイン
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup(auth, provider)
  } catch (error) {
    console.error('Google sign in error:', error)
  }
}

// ログアウト
export const logout = async () => {
  try {
    await signOut(auth)
    // Firebaseの認証状態をクリア
    await auth.signOut()
    // ローカルストレージをクリア
    window.localStorage.clear()
    // セッションストレージをクリア
    window.sessionStorage.clear()
    // ブラウザのキャッシュをクリア
    if (window.caches) {
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key))
      })
    }
    // ホームページにリダイレクト
    window.location.href = '/'
  } catch (error) {
    console.error('Logout error:', error)
  }
} 