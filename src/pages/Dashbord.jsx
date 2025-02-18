import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (user) {
        try {
          const resultsCollection = collection(db, "users", user.uid, "results");
          const querySnapshot = await getDocs(resultsCollection);

          const resultsData = [];
          querySnapshot.forEach((doc) => {
            resultsData.push({ id: doc.id, ...doc.data() });
          });

          if (resultsData.length === 0) {
            console.log("No results found for this user.");
          }

          setResults(resultsData);
        } catch (error) {
          console.error("Error fetching results:", error.message);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No user authenticated.");
      }
    };

    fetchResults();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <>
          <h2 className="mb20">{user.displayName || "User"}</h2>
          {results.length > 0 ? (
            <table className="table02">
              <thead>
                <tr>
                  <th style={{minWidth: "150px"}}>Problem</th>
                  <th>Score</th>
                  <th>Time</th>
                  <th>Created At</th>
                  <th>Answers</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.problemName}</td>
                    <td>{result.score}</td>
                    <td>{result.time}</td>
                    <td>{new Date(result.createdAt.seconds * 1000).toLocaleString()}</td>
                    <td>
                      <ul>
                        {result.answers.map((answer, index) => (
                          <span key={index}>
                            {answer.isCorrect ? "◯" : "✕"}
                          </span>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No results found.</p>
          )}
        </>
      ) : (
        <h2>Please log in.</h2>
      )}
    </div>
  );
};

export default Dashboard;
