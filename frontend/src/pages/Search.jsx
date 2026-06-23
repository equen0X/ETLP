import { useState } from "react";
import API from "../services/api";
import CourseCard from "../components/CourseCard";
import SearchBar from "../components/SearchBar";

function Search() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (keyword) => {
    setLoading(true);
    setError("");

    try {
      const res = await API.get(
        `/search?keyword=${encodeURIComponent(keyword)}`
      );
      setCourses(res.data.courses || []);
    } catch (err) {
      console.log(err);
      setError("Unable to load search results. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">

      <h2>
        Search Courses
      </h2>

      <SearchBar onSearch={handleSearch} />

      {loading && <p className="text-muted">Searching courses...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && courses.length === 0 && (
        <p className="text-muted">
          Enter a keyword and click Search to find courses.
        </p>
      )}

      <div className="row">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

    </div>
  );
}

export default Search;