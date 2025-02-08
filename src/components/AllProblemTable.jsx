import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db, auth, provider } from '../firebase';
import "./AllProblemTable.scss";
import AddQuestion from "./AddQuestion";

function AllProblemTable() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "custom_question_db"),
      (snapshot) => {
        const customList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProblems(customList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  const openModal = (problem) => {
    setEditTarget(problem); // 編集するデータをセット
  };

  const closeModal = () => {
    setEditTarget(null); // モーダルを閉じる
  };

  const deleteProblem = async (id) => {
    const confirmDelete = window.confirm("本当に削除しますか？");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "custom_question_db", id));
      // alert("削除しました");
      closeModal(); // モーダルを閉じる
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました");
    }
  };

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
            {problems.map((problem) => (
              <tr key={problem.id}>
                <td>{problem.id}</td>
                <td>{problem.createdAt ? problem.createdAt.toDate().toLocaleString() : "N/A"}</td>
                <td>{problem.updatedAt ? problem.updatedAt.toDate().toLocaleString() : "N/A"}</td>
                <td>{problem.name}</td>
                <td>{problem.operator}</td>
                <td>{problem.x ? problem.x.join(", ") : "N/A"}</td>
                <td>{problem.y ? problem.y.join(", ") : "N/A"}</td>
                <td>
                  <button className="edit-btn" onClick={() => openModal(problem)}>...</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>問題の登録がありません。問題を登録してください。</p>
      )}

      {editTarget && (
        <div className="modal-wrapper">
          <div className="modal-content owl10">
            <span className="close-btn" onClick={closeModal}>×</span>
            <AddQuestion title="編集する" btnTitle="編集完了" problem={editTarget} closeModal={closeModal} />
            <button className="btn01 -delete" onClick={() => deleteProblem(editTarget.id)}>削除する</button>
          </div>
        </div>
      )}
    </>
  );
}

export default AllProblemTable;
