import { useEffect, useState } from "react";
import API from "../services/api";

function Results() {

  const [results, setResults] =
    useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {

    try {

      const res =
        await API.get("/results");

      setResults(res.data.results);

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <div className="container mt-5">

      <h2>My Results</h2>

      <table className="table table-bordered">

        <thead>

          <tr>
            <th>Course</th>
            <th>Score</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {results.map((result) => (

            <tr key={result.id}>

              <td>
                {result.course_name}
              </td>

              <td>
                {result.score}
              </td>

              <td>

                {result.score >= 50
                  ? "Pass"
                  : "Fail"}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default Results;