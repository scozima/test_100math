import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, deleteDoc, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db, auth } from "../firebase";
import AddQuestion from "./AddQuestion";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    return <p>{t('problem.allProblemTable.loading')}</p>;
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
        loading: t('problem.allProblemTable.deleteStatus.loading'),
        success: t('problem.allProblemTable.deleteStatus.success'),
        error: t('problem.allProblemTable.deleteStatus.error')
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
                <TableHead>{t('problem.allProblemTable.tableHeaders.problemName')}</TableHead>
                <TableHead className="w-[80px]">{t('problem.allProblemTable.tableHeaders.operator')}</TableHead>
                <TableHead>{t('problem.allProblemTable.tableHeaders.xValues')}</TableHead>
                <TableHead>{t('problem.allProblemTable.tableHeaders.yValues')}</TableHead>
                <TableHead>{t('problem.allProblemTable.tableHeaders.createdAt')}</TableHead>
                <TableHead>{t('problem.allProblemTable.tableHeaders.updatedAt')}</TableHead>
                <TableHead className="w-[80px]">{t('problem.allProblemTable.tableHeaders.edit')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell className="font-medium">{problem.name}</TableCell>
                  <TableCell className="text-center">{problem.operator}</TableCell>
                  <TableCell>{problem.x ? problem.x.join(", ") : "N/A"}</TableCell>
                  <TableCell>{problem.y ? problem.y.join(", ") : "N/A"}</TableCell>
                  <TableCell>
                    {problem.createdAt ? problem.createdAt.toDate().toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {problem.updatedAt ? problem.updatedAt.toDate().toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => openModal(problem)}
                    >
                      <span className="sr-only">{t('problem.allProblemTable.edit')}</span>
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
          {t('problem.allProblemTable.noProblems')}
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('problem.allProblemTable.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('problem.allProblemTable.deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('problem.allProblemTable.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deleteProblem(deleteTargetId)
                setIsDeleteDialogOpen(false)
              }}
            >
              {t('problem.allProblemTable.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 編集モーダル */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <AddQuestion
              title={t('problem.editQuestion.title')}
              btnTitle={t('problem.allProblemTable.editComplete')}
              problem={editTarget}
              closeModal={closeModal}
            />
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleDeleteClick(editTarget.id)}
              >
                {t('problem.allProblemTable.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllProblemTable;
