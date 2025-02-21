import AddQuestion from "../components/AddQuestion"
import AllProblemTable from "../components/AllProblemTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function Problem() {
  return (
    <>
      <div className="container my-5">
        <Tabs defaultValue="add">
          <TabsList>
            <TabsTrigger value="add">作成</TabsTrigger>
            <TabsTrigger value="edit">編集・削除</TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <AddQuestion title="問題を作成する" btnTitle="登録する" />
          </TabsContent>
          <TabsContent value="edit">
            <AllProblemTable title="編集する" btnTitle="登録する" />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default Problem
