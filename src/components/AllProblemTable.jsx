import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore"; // onSnapshot をインポート
import db from "../firebase"; // Firebase 設定のインポート

function AllProblemTable() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firestore からデータをリアルタイムで取得する useEffect
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "custom_question_db"),
      (snapshot) => {
        // ドキュメントを取得し、リストにまとめる
        const customList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 取得したデータを状態に格納
        setProblems(customList);
        setLoading(false); // データ取得完了
      },
      (error) => {
        console.error("Error fetching data: ", error);
        setLoading(false); // エラーが発生した場合も終了
      }
    );

    // クリーンアップ（コンポーネントがアンマウントされたときにリスナーを解除）
    return () => unsubscribe();
  }, []);

  // ローディング中は "Loading..." を表示
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {problems.length > 0 ? (
        <table className="table02">
          <thead>
            <tr>
              <th>id</th>
              <th>登録日</th>
              <th>更新日</th>
              <th>name</th>
              <th>operator</th>
              <th>x</th>
              <th>y</th>
              <th>編集する</th>
            </tr>
          </thead>
          <tbody>
            {/* Firestore から取得した問題データを表示 */}
            {problems.map((problem) => (
              <tr key={problem.id}>
                <td>{problem.id}</td>
                <td>{problem.createdAt ? problem.createdAt.toDate().toLocaleString() : "N/A"}</td> {/* 作成日 */}
                <td>{problem.updatedAt ? problem.updatedAt.toDate().toLocaleString() : "N/A"}</td> {/* 更新日 */}
                <td>{problem.name}</td>
                <td>{problem.operator}</td>
                <td>{problem.x ? problem.x.join(", ") : "N/A"}</td>
                <td>{problem.y ? problem.y.join(", ") : "N/A"}</td>
                <td><button>...</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>カスタム問題の登録がありません。</p>
      )}
    </>
  );
}

export default AllProblemTable;
