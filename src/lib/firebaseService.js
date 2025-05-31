import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore'
import { db } from '@/firebase'

/**
 * Firebase Firestore操作を統一するサービスクラス
 */
export class FirebaseService {
  
  /**
   * 基本問題を取得
   */
  static async getBasicProblems() {
    try {
      const snapshot = await getDocs(collection(db, "basic_question_db"))
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        collection: "basic_question_db"
      }))
    } catch (error) {
      console.error("Error fetching basic problems:", error)
      throw error
    }
  }

  /**
   * ユーザーのカスタム問題を取得
   */
  static async getUserProblems(userId) {
    if (!userId) return []
    
    try {
      const userQuestionsRef = collection(db, "users", userId, "questions")
      const snapshot = await getDocs(userQuestionsRef)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        collection: "users"
      }))
    } catch (error) {
      console.error("Error fetching user problems:", error)
      throw error
    }
  }

  /**
   * 特定の問題を取得
   */
  static async getProblem(problemId, collectionName, userId = null) {
    try {
      let docRef
      if (collectionName === "users" && userId) {
        docRef = doc(db, "users", userId, "questions", problemId)
      } else {
        docRef = doc(db, collectionName, problemId)
      }

      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error("Error fetching problem:", error)
      throw error
    }
  }

  /**
   * カスタム問題を作成
   */
  static async createCustomProblem(userId, problemData) {
    try {
      const userQuestionsRef = collection(db, "users", userId, "questions")
      
      // 重複チェック
      const q = query(userQuestionsRef, where("name", "==", problemData.name))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        throw new Error("同じ名前の問題が既に存在します")
      }

      const docRef = await addDoc(userQuestionsRef, {
        ...problemData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return docRef.id
    } catch (error) {
      console.error("Error creating custom problem:", error)
      throw error
    }
  }

  /**
   * カスタム問題を更新
   */
  static async updateCustomProblem(userId, problemId, problemData) {
    try {
      const problemRef = doc(db, "users", userId, "questions", problemId)
      await updateDoc(problemRef, {
        ...problemData,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating custom problem:", error)
      throw error
    }
  }

  /**
   * カスタム問題を削除
   */
  static async deleteCustomProblem(userId, problemId) {
    try {
      // 問題を削除
      const problemRef = doc(db, "users", userId, "questions", problemId)
      await deleteDoc(problemRef)

      // 関連する結果も削除
      const resultsRef = collection(db, "users", userId, "results")
      const q = query(resultsRef, where("problemId", "==", problemId))
      const resultsSnapshot = await getDocs(q)
      
      const deletePromises = resultsSnapshot.docs.map(resultDoc => 
        deleteDoc(doc(db, "users", userId, "results", resultDoc.id))
      )
      
      await Promise.all(deletePromises)
    } catch (error) {
      console.error("Error deleting custom problem:", error)
      throw error
    }
  }

  /**
   * ユーザーの結果を取得
   */
  static async getUserResults(userId) {
    try {
      const resultsCollection = collection(db, "users", userId, "results")
      const q = query(resultsCollection, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error("Error fetching user results:", error)
      throw error
    }
  }

  /**
   * 結果を保存
   */
  static async saveResult(userId, resultData) {
    try {
      const resultsCollection = collection(db, "users", userId, "results")
      const docRef = await addDoc(resultsCollection, {
        ...resultData,
        createdAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error("Error saving result:", error)
      throw error
    }
  }

  /**
   * ユーザーデータを取得（リアルタイム）
   */
  static subscribeToUserData(userId, callback) {
    const userRef = doc(db, 'users', userId)
    return onSnapshot(userRef, callback)
  }

  /**
   * カスタム問題の数を取得
   */
  static async getCustomProblemCount(userId) {
    try {
      const userQuestionsRef = collection(db, "users", userId, "questions")
      const snapshot = await getDocs(userQuestionsRef)
      return snapshot.size
    } catch (error) {
      console.error("Error fetching custom problem count:", error)
      return 0
    }
  }
} 