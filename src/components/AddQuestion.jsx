import React, { useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import db from "../firebase";

const AddQuestion = () => {
  const [name, setName] = useState("");
  const [operator, setOperator] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const handleSubmit = async () => {
    // 必須項目が空かどうかをチェック
    if (!name || !operator || !x || !y) {
      alert("すべての項目を入力してください！");
      return;
    }

    try {
      // 同じ名前のドキュメントが存在するかチェック
      const q = query(
        collection(db, "custom_question_db"),
        where("name", "==", name)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("同じ問題名が既に存在します。別の名前を使用してください。");
        return;
      }

      const xArray = x.split(",").map(Number);
      const yArray = y.split(",").map(Number);

      // コレクションにドキュメントを追加（IDは自動生成）
      await addDoc(collection(db, "custom_question_db"), {
        name,
        operator,
        x: xArray,
        y: yArray,
      });

      alert("登録成功！");
      setName("");
      setOperator("");
      setX("");
      setY("");
    } catch (error) {
      console.error("エラー:", error);
      alert("エラーが発生しました：" + error.message);
    }
  };

  return (
    <div className="container owl10">
      <h2>Firestore 登録フォーム</h2>

      <table className="table02">
        <tbody>
          <tr className="form-group">
            <th style={{ width: "100px" }}>問題名</th>
            <td>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
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
              <input
                type="text"
                value={x}
                onChange={(e) => setX(e.target.value)}
                required
              />
            </td>
          </tr>
          <tr className="form-group">
            <th>Yの値</th>
            <td>
              <input
                type="text"
                value={y}
                onChange={(e) => setY(e.target.value)}
                required
              />
            </td>
          </tr>
        </tbody>
      </table>

      <button className="btn01" onClick={handleSubmit}>Firestoreに登録</button>
    </div>
  );
};

export default AddQuestion;