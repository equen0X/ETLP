import { useEffect, useState } from "react";
import API from "../services/api";

function Quiz() {

  const [questions, setQuestions] =
    useState([]);

  const [answers, setAnswers] =
    useState({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {

    try {

      const res =
        await API.get("/questions");

      setQuestions(res.data.questions);

    } catch (error) {

      console.log(error);

    }
  };

  const handleChange = (
    questionId,
    optionId
  ) => {

    setAnswers({
      ...answers,
      [questionId]: optionId
    });

  };

  const submitQuiz = async () => {

    try {

      await API.post(
        "/submissions",
        {
          answers
        }
      );

      alert(
        "Quiz Submitted Successfully"
      );

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <div className="container mt-5">

      <h2>Quiz</h2>

      {questions.map((q) => (

        <div
          key={q.id}
          className="card mb-3 p-3"
        >

          <h5>{q.question}</h5>

          {q.options?.map((option) => (

            <div
              key={option.id}
              className="form-check"
            >

              <input
                type="radio"
                className="form-check-input"
                name={`question-${q.id}`}
                onChange={() =>
                  handleChange(
                    q.id,
                    option.id
                  )
                }
              />

              <label
                className="form-check-label"
              >
                {option.option_text}
              </label>

            </div>

          ))}

        </div>

      ))}

      <button
        className="btn btn-success"
        onClick={submitQuiz}
      >
        Submit Quiz
      </button>

    </div>
  );
}

export default Quiz;