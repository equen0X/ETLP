import { useEffect, useState } from "react";

import API from "../services/api";

import { Link } from "react-router-dom";

const filters = ["All", "AI", "Cloud", "Data", "Web3", "Quantum", "IoT"];
const cybersecurityCourseImage = "/images/cybersecurity-course.png";
const quantumCourseImage = "/images/quantum-computing-course.png";
const iotCourseImage = "/images/iot-workshop-course.png";

const fallbackCourses = [
  {
    id: "cybersecurity-certification-course",
    title: "Cybersecurity Certification Course",
    instructor_name: "ETLP Faculty",
    category: "Cybersecurity",
    rating: "4.8",
    students: "1.2k",
    duration: "12h",
    image: cybersecurityCourseImage
  },
  {
    id: "quantum-computing-certification-course",
    title: "Quantum Computing Certification Course",
    description: "Learn qubits, quantum gates, entanglement, circuits, algorithms, and practical quantum computing concepts through week-wise recorded sessions.",
    instructor_name: "ETLP Faculty",
    category: "Quantum Computing",
    rating: "4.9",
    students: "850",
    duration: "4 Weeks",
    video_url: "https://drive.google.com/drive/folders/1yfDiApYVpsvFI-cS4N5xb_hN48a8VYWT",
    image: quantumCourseImage
  },
  {
    id: "iot-workshop",
    title: "Internet of Things (IoT) Workshop",
    description: "Explore connected devices, sensors, microcontrollers, cloud integration, and practical IoT systems through recorded workshop sessions.",
    instructor_name: "ETLP Faculty",
    category: "IoT",
    rating: "4.8",
    students: "720",
    duration: "16 Sessions",
    video_url: "https://drive.google.com/drive/folders/1mYBY6YtGV9VGGXi8ZTv0HqGw1N8F8Mpo",
    image: iotCourseImage
  }
  ,
  {
    id: "ai-tools-course",
    title: "AI Tools Course",
    description: "Learn popular AI tools, workflows, and applications through recorded sessions.",
    instructor_name: "ETLP Faculty",
    category: "AI",
    rating: "4.7",
    students: "900",
    duration: "13 Sessions",
    video_url: "https://drive.google.com/drive/folders/1RB4hKDQIwfw0y3T-CBfBP9Gmjjfep7vV",
    image: "/images/ai-tools-course-custom.svg"
  }
];

function Courses() {

  const [courses, setCourses] =
    useState([]);
  const [search, setSearch] =
    useState("");
  const [activeFilter, setActiveFilter] =
    useState("All");

  useEffect(() => {

    fetchCourses();

  }, []);

  const fetchCourses = async () => {

    try {

      const res =
        await API.get("/courses");

      const apiCourses = res.data.courses || [];
      const hasQuantum = apiCourses.some((course) =>
        `${course.title || ""} ${course.category || ""}`.toLowerCase().includes("quantum")
      );
      const hasIot = apiCourses.some((course) =>
        `${course.title || ""} ${course.category || ""}`.toLowerCase().includes("iot")
      );
      const hasAi = apiCourses.some((course) =>
        `${course.title || ""} ${course.category || ""}`.toLowerCase().includes("ai")
      );
      if (!apiCourses.length) {
        setCourses(fallbackCourses);
      } else {
        const mergedCourses = [...apiCourses];
        if (!hasQuantum) mergedCourses.push(fallbackCourses[1]);
        if (!hasIot) mergedCourses.push(fallbackCourses[2]);
        if (!hasAi) mergedCourses.push(fallbackCourses[3]);
        // Ensure AI fallback has image when API returns an AI course without thumbnail
        for (let c of mergedCourses) {
          const text = `${c.title || ""} ${c.category || ""}`.toLowerCase();
          if ((c.id === "ai-tools-course" || text.includes("ai")) && !c.image && !c.thumbnail) {
            c.image = "/images/ai-tools-course-custom.svg";
            c.thumbnail = "/images/ai-tools-course-custom.svg";
          }
        }
        setCourses(mergedCourses);
      }

    } catch (error) {

      console.log(error);

    }
  };

  const visibleCourses = (courses.length ? courses : fallbackCourses).filter((course) => {
    const text = `${course.title || ""} ${course.description || ""} ${course.category || ""}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      text.includes(activeFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  const getCategory = (course) =>
    course.category || course.domain || course.level || "Cybersecurity";

  const getAuthor = (course) =>
    course.instructor_name || course.instructor || course.faculty_name || "ETLP Faculty";

  const getCourseImage = (course) => {
    if (course.image || course.thumbnail) {
      return course.image || course.thumbnail;
    }

    const courseText = `${course.title || ""} ${course.category || ""}`.toLowerCase();
    if (courseText.includes("cyber")) return cybersecurityCourseImage;
    if (courseText.includes("quantum")) return quantumCourseImage;
    if (courseText.includes("iot") || courseText.includes("internet of things")) return iotCourseImage;
    return null;
  };

  return (
    <div className="explore-courses-page">
      <section className="explore-courses-shell">
        <h1 className="explore-courses-title">
          Explore
          <span>Courses</span>
        </h1>

        <div className="explore-search-wrap">
          <input
            type="search"
            className="explore-search"
            placeholder="Search for courses, technologies, or modules"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="explore-filters" aria-label="Course filters">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`explore-filter-pill ${activeFilter === filter ? "active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="explore-course-list">
          {visibleCourses.map((course, index) => (
            (() => {
              const courseImage = getCourseImage(course);
              return (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="explore-course-card"
            >
              <div className="explore-course-media">
                {courseImage ? (
                  <img src={courseImage} alt={`${course.title} course`} />
                ) : null}
                <span className={`explore-category-badge badge-tone-${index % 3}`}>
                  {getCategory(course)}
                </span>
              </div>

              <div className="explore-course-body">
                <h2>{course.title}</h2>
                <p>{getAuthor(course)}</p>

                <div className="explore-course-meta">
                  <span>
                    <strong>★</strong> {course.rating || "4.8"} ({course.students || "1.2k"})
                  </span>
                  <span>
                    ◷ {course.duration || "12h"}
                  </span>
                </div>
              </div>
            </Link>
              );
            })()
          ))}

          {visibleCourses.length === 0 && (
            <p className="explore-empty">
              No courses found.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Courses;
