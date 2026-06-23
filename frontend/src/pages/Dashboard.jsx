import ProgressBar
from "../components/ProgressBar";

function Dashboard() {

  return (
    <div className="container mt-5">

      <h1>
        Student Dashboard
      </h1>

      <div className="row mt-4">

        <div className="col-md-4">

          <div className="card p-3 shadow">

            <h4>
              Enrolled Courses
            </h4>

            <h2>5</h2>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card p-3 shadow">

            <h4>
              Completed
            </h4>

            <h2>2</h2>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card p-3 shadow">

            <h4>
              Certificates
            </h4>

            <h2>2</h2>

          </div>

        </div>

      </div>

      <div className="mt-5">

        <h3>
          Learning Progress
        </h3>

        <ProgressBar
          progress={70}
        />

      </div>

    </div>
  );
}

export default Dashboard;