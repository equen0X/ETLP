import { FaUsers, FaBook, FaChartBar } from "react-icons/fa";

function AdminDashboard() {
  return (
    <div className="container mt-5">

      <h1 className="mb-4">
        Admin Dashboard
      </h1>

      <div className="row">

        <div className="col-md-4 mb-4">
          <div className="card shadow dashboard-card">
            <div className="card-body text-center">
              <FaUsers size={40} />
              <h3 className="mt-3">250</h3>
              <p>Total Users</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card shadow dashboard-card">
            <div className="card-body text-center">
              <FaBook size={40} />
              <h3 className="mt-3">35</h3>
              <p>Total Courses</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card shadow dashboard-card">
            <div className="card-body text-center">
              <FaChartBar size={40} />
              <h3 className="mt-3">85%</h3>
              <p>Completion Rate</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;