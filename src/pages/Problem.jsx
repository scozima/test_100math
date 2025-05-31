import { useTranslation } from "react-i18next"
import AddQuestion from "../components/AddQuestion"
import AllProblemTable from "../components/AllProblemTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePlanRestrictions } from "@/hooks/usePlanRestrictions"

function Problem() {
  const { t } = useTranslation()
  const { loading } = usePlanRestrictions()
  
  if (loading) {
    return <div className="container my-5">{t('dashboard.loading')}</div>
  }

  return (
    <div className="container my-5">
      <Tabs defaultValue="add">
        <TabsList>
          <TabsTrigger value="add">{t('problem.tabs.create')}</TabsTrigger>
          <TabsTrigger value="edit">{t('problem.tabs.editDelete')}</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <AddQuestion title={t('problem.addQuestion.title')} btnTitle={t('problem.addQuestion.btnTitle')} />
        </TabsContent>
        <TabsContent value="edit">
          <AllProblemTable title={t('problem.editQuestion.title')} btnTitle={t('problem.editQuestion.btnTitle')} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Problem
