import { useEffect, useState } from "react";
import API from "../services/api";

function MyCourses() {

  const [courses, setCourses] =
    useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses =
    async () => {

      try {

        const res =
          await API.get(
            "/enrollments/my-courses"
          );

        setCourses(
          res.data.courses
        );

      } catch (error) {

        console.log(error);

      }
    };

  return (
    <div className="container mt-5">

      <h2>
        My Enrolled Courses
      </h2>

      <div className="row">

        {courses.map((course) => (

          <div
            className="col-md-4 mb-4"
            key={course.id}
          >

            <div className="card p-3">

              <h5>
                {course.title}
              </h5>

              <p>
                {course.description}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default MyCourses;