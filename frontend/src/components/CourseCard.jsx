import { Link } from "react-router-dom";

function CourseCard({ course }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100 shadow">

        <img
          src={
            course.image ||
            "https://via.placeholder.com/300x200"
          }
          className="card-img-top"
          alt={course.title}
        />

        <div className="card-body">

          <h5 className="card-title">
            {course.title}
          </h5>

          <p className="card-text">
            {course.description}
          </p>

          <Link
            to={`/course/${course.id}`}
            className="btn btn-primary"
          >
            View Course
          </Link>

        </div>

      </div>
    </div>
  );
}

export default CourseCard;