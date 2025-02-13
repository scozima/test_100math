import React, { useState, useEffect } from "react";
import { doc, updateDoc, collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db, auth } from '../firebase';

const AddQuestion = ({ title, btnTitle, problem, closeModal }) => {
  const [name, setName] = useState(problem?.name || "");
  const [operator, setOperator] = useState(problem?.operator || "");
  const [x, setX] = useState(problem?.x ? problem.x.join(", ") : "");
  const [y, setY] = useState(problem?.y ? problem.y.join(", ") : "");

  useEffect(() => {
    if (problem) {
      setName(problem.name || "");
      setOperator(problem.operator || "");
      setX(problem.x ? problem.x.join(", ") : "");
      setY(problem.y ? problem.y.join(", ") : "");
    }
  }, [problem]);

  const handleSubmit = async () => {
    if (!name || !operator || !x || !y) {
      alert("すべての項目を入力してください！");
      return;
    }

    const xArray = x.split(",").map(Number);
    const yArray = y.split(",").map(Number);
    
    const user = auth.currentUser;
    if (!user) {
      alert("ログインしてください！");
      return;
    }

    const userUid = user.uid;
    const userCollectionRef = collection(db, "users", userUid, "questions");

    try {
      if (problem) {
        // 既存の問題を更新
        const problemRef = doc(userCollectionRef, problem.id);
        await updateDoc(problemRef, {
          name,
          operator,
          x: xArray,
          y: yArray,
          updatedAt: serverTimestamp(),
        });
        alert("更新成功！");
      } else {
        // 同じ名前の問題が既にあるかチェック
        const q = query(userCollectionRef, where("name", "==", name));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          alert("同じ問題名が既に存在します。別の名前を使用してください。");
          return;
        }

        // 新規登録
        await addDoc(userCollectionRef, {
          name,
          operator,
          x: xArray,
          y: yArray,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        alert("登録成功！");
      }

      closeModal();
    } catch (error) {
      console.error("エラー:", error);
      alert("エラーが発生しました：" + error.message);
    }
  };

  return (
    <div className="container owl10">
      <h2>{title}</h2>

      <table className="table02">
        <tbody>
          <tr className="form-group">
            <th>問題名</th>
            <td>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </td>
          </tr>
          <tr className="form-group">
            <th>演算子</th>
            <td>
              <select value={operator} onChange={(e) => setOperator(e.target.value)} required>
                <option value="" disabled>選択してください</option>
                {["+", "-", "✕", "÷"].map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </td>
          </tr>
          <tr className="form-group">
            <th>Xの値</th>
            <td>
              <input type="text" value={x} onChange={(e) => setX(e.target.value)} required />
            </td>
          </tr>
          <tr className="form-group">
            <th>Yの値</th>
            <td>
              <input type="text" value={y} onChange={(e) => setY(e.target.value)} required />
            </td>
          </tr>
        </tbody>
      </table>

      <button className="btn01" onClick={handleSubmit}>{btnTitle}</button>
    </div>
  );
};

export default AddQuestion;
