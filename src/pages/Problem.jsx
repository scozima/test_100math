import React from "react";
import AddQuestion from "../components/AddQuestion";
import AllProblemTable from "../components/AllProblemTable";

function Problem() {
  return (
    <>
      <h2>Problem</h2>
      <div className="owl60">
        <AddQuestion />
        <AllProblemTable />
      </div>
    </>
  );
}

export default Problem;
