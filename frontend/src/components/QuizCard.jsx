function QuizCard({ quiz }) {
  return (
    <div className="card shadow mb-3">

      <div className="card-body">

        <h5>{quiz.title}</h5>

        <p>
          Total Questions :
          {quiz.totalQuestions}
        </p>

        <button
          className="btn btn-success"
        >
          Start Quiz
        </button>

      </div>

    </div>
  );
}

export default QuizCard;