import React from "react";
import AddQuestion from "../components/AddQuestion";
import AllProblemTable from "../components/AllProblemTable";

function Problem() {
  return (
    <>
      <h2>Problem</h2>
      <div className="owl60">
        <AddQuestion title="問題を作成する" btnTitle="登録する" />
        <AllProblemTable title="編集する" btnTitle="登録する" />
      </div>
    </>
  );
}

export default Problem;
