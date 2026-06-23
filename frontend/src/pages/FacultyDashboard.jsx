function FacultyDashboard() {

  return (
    <div className="container mt-5">

      <h1>
        Faculty Dashboard
      </h1>

      <div className="row mt-4">

        <div className="col-md-4">
          <div className="card shadow p-3">
            <h4>My Courses</h4>
            <h2>10</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow p-3">
            <h4>Students</h4>
            <h2>180</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow p-3">
            <h4>Quizzes</h4>
            <h2>25</h2>
          </div>
        </div>

      </div>

    </div>
  );
}

export default FacultyDashboard;