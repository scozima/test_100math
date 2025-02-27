import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, deleteDoc, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db, auth } from "../firebase";
import AddQuestion from "./AddQuestion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function AllProblemTable() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const user = auth.currentUser; // 現在のユーザーを取得
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userQuestionsRef = collection(db, `users/${user.uid}/questions`);

    const unsubscribe = onSnapshot(
      userQuestionsRef,
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
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const openModal = (problem) => {
    setEditTarget(problem);
  };

  const closeModal = () => {
    setEditTarget(null);
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id)
    setIsDeleteDialogOpen(true)
  }

  const deleteProblem = async (id) => {
    if (!user) return;

    toast.promise(
      (async () => {
        // 問題を削除
        await deleteDoc(doc(db, `users/${user.uid}/questions`, id));

        // この問題に関連する回答データを取得
        const resultsRef = collection(db, `users/${user.uid}/results`);
        const q = query(resultsRef, where("problemId", "==", id));
        const querySnapshot = await getDocs(q);

        // バッチ処理で関連する回答データを削除
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        closeModal();
      })(),
      {
        loading: '削除中...',
        success: '問題と関連する回答データを削除しました',
        error: '削除に失敗しました'
      }
    );
  };

  return (
    <div className="space-y-4">
      {problems.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead>更新日</TableHead>
                <TableHead>問題名</TableHead>
                <TableHead className="w-[80px]">演算子</TableHead>
                <TableHead>X値</TableHead>
                <TableHead>Y値</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell className="font-mono">{problem.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    {problem.createdAt ? problem.createdAt.toDate().toLocaleString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    {problem.updatedAt ? problem.updatedAt.toDate().toLocaleString() : "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">{problem.name}</TableCell>
                  <TableCell className="text-center">{problem.operator}</TableCell>
                  <TableCell>{problem.x ? problem.x.join(", ") : "N/A"}</TableCell>
                  <TableCell>{problem.y ? problem.y.join(", ") : "N/A"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => openModal(problem)}
                    >
                      <span className="sr-only">編集</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          問題の登録がありません。問題を登録してください。
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。問題と関連する回答データがすべて削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deleteProblem(deleteTargetId)
                setIsDeleteDialogOpen(false)
              }}
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 編集モーダル */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <AddQuestion 
              title="編集する" 
              btnTitle="編集完了" 
              problem={editTarget} 
              closeModal={closeModal} 
            />
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => handleDeleteClick(editTarget.id)}
              >
                削除する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllProblemTable;
