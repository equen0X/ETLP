import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FiAward, FiBell, FiBookOpen, FiBookmark, FiCheck, FiCheckCircle,
  FiChevronLeft, FiClock, FiCpu, FiDownload, FiEdit3, FiExternalLink,
  FiLayers, FiMessageCircle, FiPlay, FiPlus, FiSend, FiStar, FiUser, FiZap
} from "react-icons/fi";

import API from "../services/api";
import VideoPlayer from "../components/VideoPlayer";

const courseMaterialUrl =
  "https://drive.google.com/drive/folders/1wWqAMtKA6nL5ohKEBR6lqQBmElQyyo2Q";
const cybersecurityCourseImage = "/images/cybersecurity-course.png";
const quantumCourseImage = "/images/quantum-computing-course.png";
const iotCourseImage = "/images/iot-workshop-course.png";
const quantumMaterialUrl =
  "https://drive.google.com/drive/folders/1yfDiApYVpsvFI-cS4N5xb_hN48a8VYWT";
const iotMaterialUrl =
  "https://drive.google.com/drive/folders/1mYBY6YtGV9VGGXi8ZTv0HqGw1N8F8Mpo";
const aiMaterialUrl =
  "https://drive.google.com/drive/folders/1RB4hKDQIwfw0y3T-CBfBP9Gmjjfep7vV";

const quantumCourse = {
  id: "quantum-computing-certification-course",
  title: "Quantum Computing Certification Course",
  description:
    "Build a practical foundation in qubits, quantum gates, superposition, entanglement, quantum circuits, and algorithms through structured week-wise recorded sessions.",
  category: "Quantum Computing",
  instructor_name: "ETLP Faculty",
  rating: "4.9",
  students: "850",
  duration: "4 Weeks",
  video_url: quantumMaterialUrl,
  thumbnail: quantumCourseImage,
  badges: ["Quantum Computing", "Certification"]
};

const iotCourse = {
  id: "iot-workshop",
  title: "IOT Workshop",
  description:
    "Learn how sensors, microcontrollers, wireless networks, cloud platforms, and connected devices work together through practical instructor-led IoT workshop sessions.",
  category: "IoT",
  instructor_name: "ETLP Faculty",
  rating: "4.8",
  students: "720",
  duration: "16 Sessions",
  video_url: iotMaterialUrl,
  thumbnail: iotCourseImage,
  badges: ["IoT Workshop", "Hands-on"]
};

const aiCourse = {
  id: "ai-tools-course",
  title: "AI Tools Course",
  description:
    "Learn popular AI tools, workflows, and applications through recorded sessions.",
  category: "AI",
  instructor_name: "ETLP Faculty",
  rating: "4.7",
  students: "900",
  duration: "13 Sessions",
  video_url: aiMaterialUrl,
  thumbnail: "/images/ai-tools-course-custom.svg",
  image: "/images/ai-tools-course-custom.svg",
  badges: ["AI", "Tools"]
};

const IOT_INCOMPLETE_FILE_IDS = new Set([
  "11EntbDBa6A2xGCKNI3yfOu_ODvTlgaBr",
  "1iqKhaAEn6uXTSQJMWoL1uRmjYMn7tyTt",
  "1mDrggbfV5NY-e-riroTViX0_ZPJndM_g",
  "1lZws2gAmBNHogUkuYTUSjZj_syOtFMJt"
]);

// Local fallback mapping for folderId -> array of file IDs (used when Drive API
// is unreachable or files are not publicly listable). Replace or extend as needed.
const DRIVE_FALLBACK = {
  "1wWqAMtKA6nL5ohKEBR6lqQBmElQyyo2Q": [
    "1ROePYzWckoz26i8zl3Hv-GOYAZeqgSpm",
    "1_LyCc8vsyCAoOJ1oOoZ-6IRQrrBedhJS",
    "1K421ZqOc4tP7e0UmsEtF3YPsbvlNoJbR"
  ]
};

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    fetchCourse();
  }, [id]);

  

  const fetchCourse = async () => {
    if (id === quantumCourse.id) {
      setCourse(quantumCourse);
      return;
    }
    if (id === iotCourse.id) {
      setCourse(iotCourse);

      // Populate IoT workshop modules (session list) with compact Week · Session labels
      const rawCount = 13;
      const iotModules = Array.from({ length: rawCount }).map((_, idx) => {
        const sessionNum = idx + 1;
        // assign week number every 3 sessions (approx)
        const weekNum = Math.ceil(sessionNum / 3);
        return {
          id: `iot-${sessionNum}`,
          // displayName is preferred by getLessonName()
          displayName: `Week ${weekNum} · Session ${sessionNum}`,
          name: `Week ${weekNum} · Session ${sessionNum}`
        };
      });

      setModules(iotModules);
      if (iotModules.length > 0) setSelectedVideo(iotModules[0]);

      return;
    }
    if (id === aiCourse.id) {
      setCourse(aiCourse);
      // Let the Drive fetch populate modules when Modules tab is opened
      return;
    }

    try {
      const res = await API.get(`/courses/${id}`);
      const apiCourse = res.data.course || {};
      // If API returns AI course but no thumbnail, use our fallback SVG
      if ((apiCourse.id === 'ai-tools-course' || (`${apiCourse.title || ''} ${apiCourse.category || ''}`).toLowerCase().includes('ai')) && !apiCourse.thumbnail) {
        apiCourse.thumbnail = '/images/ai-tools-course-custom.svg';
      }
      // Ensure known courses have the correct Drive folder set for modules
      const text = (`${apiCourse.title || ''} ${apiCourse.category || ''}`).toLowerCase();
      if (!apiCourse.video_url) {
        if (text.includes('iot') || text.includes('internet of things')) {
          apiCourse.video_url = iotMaterialUrl;
        } else if (text.includes('quantum')) {
          apiCourse.video_url = quantumMaterialUrl;
        } else if (text.includes('ai')) {
          apiCourse.video_url = aiMaterialUrl;
        }
      }
      setCourse(apiCourse);
    } catch (error) {
      console.log(error);
      setCourse({
        id,
        title: "Cybersecurity Certification Course",
        description:
          "Master the building blocks of modern cybersecurity. In this comprehensive course, you will dive deep into network defense, threat analysis, secure systems, and practical protection workflows.",
        category: "Cybersecurity",
        instructor_name: "ETLP Faculty",
        rating: "4.8",
        students: "2.4k",
        video_url: courseMaterialUrl,
        thumbnail:
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=1",
        badges: ["Best Seller", "Beginner"]
      });
    }
  };

  const enrollCourse = async () => {
    // redirect to login immediately if user not authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to enroll.", "error");
      navigate("/login", { state: { from: `/course/${course?.id}` } });
      return;
    }

    try {
      const res = await API.post("/enrollments/enroll", {
        courseId: course.id
      });

      if (res.data && res.data.success !== true) {
        showToast(res.data.message || 'Enrollment failed', 'error');
        return;
      }

      setIsEnrolled(true);
      showToast("Course Enrolled Successfully", "success");
    } catch (error) {
      console.log(error);
      const status = error?.response?.status;
      if (status === 401) {
        showToast("Please login to enroll.", "error");
        navigate("/login", { state: { from: `/course/${course?.id}` } });
        return;
      }
      const errMsg = error?.response?.data?.message;
      showToast(errMsg || "Enrollment failed. Please try again.", "error");
    }
  };
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    // check enrollment status when course loads
    const checkEnrollment = async () => {
      if (!course?.id) return;
      try {
        const res = await API.get(`/enrollments/status/${course.id}`);
        if (res.data && res.data.isEnrolled) setIsEnrolled(true);
      } catch (err) {
        // ignore — unauthenticated or not enrolled
      }
    };
    checkEnrollment();
  }, [course]);
  const courseIdentity = `${course?.title || ""} ${course?.category || ""}`.toLowerCase();
  const isQuantumCourse = courseIdentity.includes("quantum");
  const isIotCourse = courseIdentity.includes("iot") || courseIdentity.includes("internet of things");
  const lessons = isQuantumCourse ? [
    {
      icon: <FiCpu />,
      title: "Qubits and Quantum Gates",
      text: "Understand superposition, measurement, Bloch spheres, and the gates used to build quantum circuits."
    },
    {
      icon: <FiLayers />,
      title: "Week-wise Recorded Sessions",
      text: "Progress through four structured weeks of instructor-led sessions, examples, and quantum computing discussions."
    }
  ] : isIotCourse ? [
    {
      icon: <FiCpu />,
      title: "Connected Devices and Sensors",
      text: "Understand sensing, embedded controllers, communication protocols, and real-world connected-device workflows."
    },
    {
      icon: <FiLayers />,
      title: "Practical Workshop Sessions",
      text: "Follow the complete workshop from inauguration through hands-on IoT implementation sessions."
    }
  ] : [
    {
      icon: <FiCpu />,
      title: "Security Architectures",
      text: "Learn firewalls, IDS, VPNs, zero trust, and layered security models."
    },
    {
      icon: <FiLayers />,
      title: "Hands-on Labs",
      text: "Build and test your own defenses using guided practical exercises."
    }
  ];
  const materialUrl = course?.video_url || courseMaterialUrl;
  const courseImage =
    course?.thumbnail ||
    (`${course?.title || ""} ${course?.category || ""}`.toLowerCase().includes("cyber")
      ? cybersecurityCourseImage
      : `${course?.title || ""} ${course?.category || ""}`.toLowerCase().includes("quantum")
        ? quantumCourseImage
        : isIotCourse
          ? iotCourseImage
          : null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modules, setModules] = useState([]);
  const [openWeeks, setOpenWeeks] = useState({});
  const playerRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [studyPanel, setStudyPanel] = useState("notes");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I’m your AI learning assistant. Ask me to explain this lesson, create a summary, or quiz you on the key ideas."
    }
  ]);

  const lessonNames = [
    "Introduction to Cybersecurity",
    "Core Security Principles",
    "Threats and Vulnerabilities",
    "Network Defense Essentials",
    "Identity and Access Control",
    "Incident Response Basics"
  ];

  const getLessonName = (module, index) => {
    if (module?.displayName) return module.displayName;
    const name = module?.name || "";
    return name.startsWith("Module -") ? lessonNames[index] || `Lesson ${index + 1}` : name;
  };

  const getQuantumModuleMeta = (file) => {
    const name = file.name || "";
    const upper = name.toUpperCase();
    const weekMatch = upper.match(/WEEK\s*[-_ ]?\s*(\d+)/);
    const sessionMatch = upper.match(/SESSION\s*[-_ ]?\s*(\d+)/);
    const dateMatch = name.match(/(20\d{6})_(\d{6})/);
    const partMatch = name.match(/Recording\s+(\d+)/i);
    const isValedictory = /VALIDECTORY|VALEDICTORY/.test(upper);
    const week = isValedictory ? 5 : Number(weekMatch?.[1] || 99);
    const session = Number(sessionMatch?.[1] || 1);
    let dateLabel = "";
    let sortStamp = "99999999999999";

    if (dateMatch) {
      const rawDate = dateMatch[1];
      const rawTime = dateMatch[2];
      const date = new Date(
        Number(rawDate.slice(0, 4)),
        Number(rawDate.slice(4, 6)) - 1,
        Number(rawDate.slice(6, 8))
      );
      dateLabel = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
      sortStamp = `${rawDate}${rawTime}`;
    }

    const weekLabel = isValedictory ? "Special Session" : `Week ${week}`;
    const partLabel = partMatch ? ` · Part ${partMatch[1]}` : "";
    return {
      week,
      weekLabel,
      session,
      sortStamp,
      displayName: isValedictory
        ? `Valedictory Session${dateLabel ? ` — ${dateLabel}` : ""}`
        : `Session ${session}${dateLabel ? ` — ${dateLabel}` : ""}${partLabel}`
    };
  };

  const moduleGroups = modules.reduce((groups, module) => {
    const label = module.weekLabel || "Course Modules";
    const existing = groups.find((group) => group.label === label);
    if (existing) existing.modules.push(module);
    else groups.push({ label, modules: [module] });
    return groups;
  }, []);

  function fmtTime(s) {
    if (!s && s !== 0) return "0:00";
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    const min = Math.floor(s / 60);
    return `${min}:${sec}`;
  }

  const handleNewNote = () => {
    const time = playerRef.current?.getCurrentTime?.() || 0;
    const text = window.prompt(`Add note at ${fmtTime(time)}:`);
    if (text && text.trim()) {
      setNotes((p) => [{ time, text: text.trim() }, ...p]);
    }
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || chatLoading) return;
    setChatInput("");
    setChatMessages((current) => [...current, { role: "user", text: message }]);
    setChatLoading(true);

    try {
      const response = await API.post("/ai/chatbot", {
        message,
        context: {
          courseTitle: course?.title,
          moduleTitle: selectedVideo?.name || course?.title
        }
      });
      setChatMessages((current) => [
        ...current,
        { role: "assistant", text: response.data?.reply || "I could not generate a response." }
      ]);
    } catch {
      setChatMessages((current) => [
        ...current,
        { role: "assistant", text: "I’m having trouble reaching the AI service right now. Try asking again in a moment." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Toast for non-blocking feedback
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const showToast = (message, type = "info", ms = 3000) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "info" }), ms);
  };

  useEffect(() => {
    // Fetch Drive folder files when Modules tab is active and course material points to a Drive folder
    const fetchDriveFiles = async () => {
      try {
        const match = materialUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
        const folderId = match ? match[1] : null;
        if (!folderId) return;
        let files = [];
        let saEnabled = false;

        // Only use the native streaming route when the service account can
        // actually read this folder. Having credentials configured alone does
        // not guarantee that the Drive files were shared with that account.
        try {
          const res = await API.get(`/drive/sa/files?folderId=${folderId}`);
          files = res.data.files || [];
          saEnabled = true;
        } catch (err) {
          console.warn("Drive service account cannot access this folder", err?.message);
        }

        if (!files.length) {
          try {
            const res = await API.get(`/drive/files?folderId=${folderId}`);
            files = res.data.files || [];
          } catch (err) {
            console.warn("Public Drive API list failed, falling back to local mapping", err?.message);
          }
        }

        // If Drive API didn't return usable files, check local fallback map
        if ((!files || files.length === 0) && DRIVE_FALLBACK[folderId]) {
          files = DRIVE_FALLBACK[folderId].map((id) => ({ id, name: `Module - ${id}`, mimeType: "video/mp4", thumbnailLink: null }));
        }

        const IOT_FOLDER_ID = "1mYBY6YtGV9VGGXi8ZTv0HqGw1N8F8Mpo";
        const AI_FOLDER_ID = "1RB4hKDQIwfw0y3T-CBfBP9Gmjjfep7vV";
        const isQuantumCourse = folderId === "1yfDiApYVpsvFI-cS4N5xb_hN48a8VYWT";
        const isAiCourse = folderId === AI_FOLDER_ID;
        const videoFiles = files.filter((f) => (f.mimeType || "").startsWith("video/") && (!isQuantumCourse || !/transcript/i.test(f.name || "")));

        // For IoT folder, expose all sessions and map to compact Week · Session labels
        const selectedFiles = isQuantumCourse ? videoFiles : videoFiles; // include all by default

        let mapped = [];

        if (folderId === IOT_FOLDER_ID || isAiCourse) {
          // Build IoT modules using the drive files order and produce Week headings
          mapped = selectedFiles.map((f, idx) => {
            const sessionNum = idx + 1;
            const week = Math.ceil(sessionNum / 3);
            return {
              id: f.id || `iot-${sessionNum}`,
              // weekLabel becomes the heading (e.g. 'Week 1') used by moduleGroups
              weekLabel: `Week ${week}`,
              // session number for sorting/presentation
              session: sessionNum,
              // displayName is the sub-session label shown under the week heading
              displayName: `Session ${sessionNum}`,
              name: `Session ${sessionNum}`,
              mimeType: f.mimeType,
              embedUrl: f.id ? `https://drive.google.com/file/d/${f.id}/preview` : null,
              streamUrl: saEnabled ? `${API.defaults.baseURL}/drive/sa/file/${f.id}` : null,
              thumbnail: f.thumbnailLink || null
            };
          });
        } else {
          mapped = selectedFiles
            .map((f) => ({
              id: f.id,
              name: f.name || `Module ${f.id}`,
              mimeType: f.mimeType,
              embedUrl: `https://drive.google.com/file/d/${f.id}/preview`,
              streamUrl: saEnabled ? `${API.defaults.baseURL}/drive/sa/file/${f.id}` : null,
              thumbnail: f.thumbnailLink || null,
              ...(isQuantumCourse ? getQuantumModuleMeta(f) : {})
            }))
            .sort((a, b) => (a.week || 0) - (b.week || 0) || (a.sortStamp || "").localeCompare(b.sortStamp || "") || (a.session || 0) - (b.session || 0) || a.name.localeCompare(b.name));
        }

        // Ensure IoT shows all sessions (fallback to placeholders if Drive returns fewer)
        if (folderId === IOT_FOLDER_ID) {
          const EXPECTED_IOT_COUNT = 13;
          if (mapped.length < EXPECTED_IOT_COUNT) {
            const filled = Array.from({ length: EXPECTED_IOT_COUNT }).map((_, idx) => {
              if (mapped[idx]) return mapped[idx];
              const sessionNum = idx + 1;
              const week = Math.ceil(sessionNum / 3);
              return {
                id: `iot-placeholder-${sessionNum}`,
                weekLabel: `Week ${week}`,
                session: sessionNum,
                name: `Session ${sessionNum}`,
                displayName: `Session ${sessionNum}`,
                mimeType: null,
                embedUrl: null,
                streamUrl: null,
                thumbnail: null
              };
            });
            setModules(filled);
            if (filled.length > 0) setSelectedVideo(filled[0]);
          } else {
            setModules(mapped);
            if (mapped.length > 0) setSelectedVideo(mapped[0]);
          }
        } else {
          setModules(mapped);
          if (mapped.length > 0) setSelectedVideo(mapped[0]);
        }
      } catch (error) {
        console.error("Failed to fetch Drive files", error);
      }
    };

    if (activeTab === "Modules") {
      fetchDriveFiles();
    }
  }, [activeTab, materialUrl]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await API.post('/uploads/cloudinary', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) => {
          if (ev.total) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      });

      if (res.data && res.data.success && res.data.url) {
        const newMod = {
          id: `uploaded-${Date.now()}`,
          name: res.data.originalName || file.name,
          embedUrl: res.data.url,
          streamUrl: null,
          thumbnail: null
        };

        setModules((p) => [newMod, ...p]);
        setSelectedVideo(newMod);
      } else {
        showToast('Upload failed', 'error');
      }
    } catch (err) {
      console.error('Upload error', err);
      showToast('Upload error', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!course) {
    return (
      <div className="course-detail-page">
        <div className="course-detail-shell">
          <p className="course-detail-loading">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      {/* Toast container */}
      {toast.visible && (
        <div style={{ position: 'fixed', right: 20, bottom: 24, zIndex: 9999 }}>
          <div style={{
            background: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#111827',
            color: '#fff', padding: '12px 16px', borderRadius: 8, boxShadow: '0 6px 18px rgba(2,6,23,0.2)',
            minWidth: 260
          }}>
            {toast.message}
          </div>
        </div>
      )}
      <section className={`course-detail-shell ${activeTab === "Modules" ? "modules-active" : ""}`}>
        <header className="course-mobile-topbar">
          <Link to="/courses" className="course-top-icon" aria-label="Back to courses">
            <FiChevronLeft />
          </Link>
          <div className="course-brand">
            <span className="course-brand-mark">
              <FiBookOpen />
            </span>
            <strong>Elite Portal</strong>
          </div>
          <button type="button" className="course-top-icon" aria-label="Notifications">
            <FiBell />
          </button>
        </header>

        <div className="course-detail-grid">
          <div className="course-detail-main">
            <div className="course-hero-card">
              <div className="course-hero-image">
                {courseImage ? <img src={courseImage} alt={`${course.title} course`} /> : null}
                <div className="course-hero-overlay">
                  <div className="course-hero-badges">
                    {(course.badges || [course.category || "Cybersecurity"]).map((b, i) => (
                      <span key={i}>{b}</span>
                    ))}
                  </div>

                  <h1>{course.title}</h1>
                  <p>Build practical skills for secure systems, network defense, and threat analysis.</p>

                  <div className="course-hero-meta">
                    <span>
                      <FiUser /> {course.instructor_name || "ETLP Faculty"}
                    </span>
                    <span>
                      <FiStar /> {course.rating || "4.8"} ({course.students || "2.4k"} reviews)
                    </span>
                    <span>
                      <FiClock /> {course.duration || "12h"}
                    </span>
                    
                  </div>

                </div>
              </div>
            </div>

            <nav className="course-tabs">
              {["Overview", "Modules", "Reviews"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => {
                    if (tab === "Modules" && !isEnrolled) {
                      showToast("Please enroll in the course to access Modules.", "error");
                      setActiveTab("Overview");
                      return;
                    }
                    setActiveTab(tab);
                  }}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <main className="course-detail-content">
              {activeTab === "Overview" && (
                <>
                  <h2>About this course</h2>
                  <p>
                    {course.description ||
                      "Master the building blocks of modern cybersecurity. In this comprehensive course, you will dive deep into network defense, threat analysis, secure systems, and practical protection workflows."}
                  </p>

                  <div className="course-learn-list">
                    {lessons.map((lesson) => (
                      <article key={lesson.title} className="course-learn-card">
                        <span>{lesson.icon}</span>
                        <div>
                          <h3>{lesson.title}</h3>
                          <p>{lesson.text}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "Modules" && (
                <>
                  {false && (
                  <>
                  <h2>Modules</h2>
                  <div className="modules-grid">
                    <aside className="modules-list">
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <button type="button" className="btn-premium-cyan" onClick={handleUploadClick}>Upload Video</button>
                        {uploading && <div style={{ color: 'var(--text-secondary)' }}>Uploading {uploadProgress}%</div>}
                        <input ref={fileInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />
                      </div>
                      <ul>
                        {modules.length > 0 ? (
                          modules.map((m) => (
                            <li key={m.id}>
                              <button type="button" onClick={() => setSelectedVideo(m)}>
                                {m.name}
                              </button>
                            </li>
                          ))
                        ) : (
                          // Fallback: open folder link
                          <li>
                            <a href={materialUrl} target="_blank" rel="noreferrer">
                              Open Drive Folder <FiExternalLink />
                            </a>
                          </li>
                        )}
                      </ul>
                    </aside>

                    <section className="modules-player">
                      <div className="player-shell">
                        <div className="player-header">
                          <div className="player-title">{selectedVideo?.name || course.title}</div>
                          <div className="player-actions">
                            <button type="button" title="Bookmark">Bookmark</button>
                            <button type="button" title="Resources">Resources</button>
                          </div>
                        </div>

                        <div className="player-body">
                          <div className="player-main">
                            <VideoPlayer ref={playerRef} video={selectedVideo || { embedUrl: materialUrl }} />
                          </div>

                          <aside className="player-sidebar">
                            <div className="notes-tabs">
                              <div className="tabs">
                                <button className="active">Notes</button>
                                <button>AI Assistant</button>
                              </div>

                              <div className="notes-area">
                                <div className="note-meta">Take dynamic notes synced to the video timestamp.</div>
                                <div className="note-list">
                                  {notes.length === 0 ? (
                                    <div className="note-empty">No notes yet — add one.</div>
                                  ) : (
                                    notes.map((n, i) => (
                                      <div className="note-item" key={i}><strong>{fmtTime(n.time)}</strong> {n.text}</div>
                                    ))
                                  )}
                                </div>
                                <button type="button" className="new-note" onClick={handleNewNote}>New Note</button>
                              </div>
                            </div>

                            <div className="lesson-playlist">
                              <h5>Lesson Playlist</h5>
                              <ul>
                                {modules.map((mod, idx) => (
                                  <li key={mod.id} className={selectedVideo?.id === mod.id ? 'active' : ''}>
                                    <button type="button" onClick={() => setSelectedVideo(mod)}>
                                      <div className="lesson-meta">
                                        <span className="lesson-title">{idx + 1}. {mod.name}</span>
                                        <span className="lesson-time">{mod.duration ? fmtTime(mod.duration) : '0:00'}</span>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </aside>
                        </div>
                      </div>
                    </section>
                  </div>
                  </>
                  )}
                  <section className="learning-workspace">
                    <div className="learning-video-column">
                      <div className="learning-video-card">
                        <VideoPlayer ref={playerRef} video={selectedVideo || { embedUrl: materialUrl }} />
                      </div>

                      <div className="learning-title-row">
                        <div>
                          <div className="learning-kicker">
                            <span>{course.category || "Course"}</span>
                            <span>{selectedVideo?.weekLabel || `Module ${Math.max(1, modules.findIndex((item) => item.id === selectedVideo?.id) + 1)}`}</span>
                          </div>
                          <h1>{getLessonName(selectedVideo, Math.max(0, modules.findIndex((item) => item.id === selectedVideo?.id))) || course.title}</h1>
                          <p>{course.description}</p>
                        </div>
                        <div className="learning-actions">
                          <button type="button"><FiBookmark /> Bookmark</button>
                        </div>
                      </div>

                      <div className="lesson-playlist learning-playlist">
                        <div className="playlist-heading">
                          <div><span className="playlist-eyebrow">Course content</span><h2>Lesson playlist</h2></div>
                          <span>{modules.length || 3} lessons · 42 min</span>
                        </div>
                        <ul>
                          {moduleGroups.length > 0 ? (
                            moduleGroups.map((group) => {
                              const isOpen = !!openWeeks[group.label];
                              return (
                                <li key={group.label} className="week-group">
                                  <div className="week-module-heading">
                                    <button
                                      type="button"
                                      className={`week-toggle ${isOpen ? 'open' : ''}`}
                                      onClick={() => setOpenWeeks((prev) => ({ ...prev, [group.label]: !prev[group.label] }))}
                                    >
                                      <strong>{group.label}</strong>
                                      <span>{group.modules.length} sessions</span>
                                    </button>
                                  </div>

                                  {isOpen && (
                                    <ul className="week-sessions">
                                      {group.modules.map((mod, idx) => {
                                        const active = selectedVideo?.id === mod.id;
                                        const selectedIndex = modules.findIndex((item) => item.id === selectedVideo?.id);
                                        const complete = modules.findIndex((item) => item.id === mod.id) < Math.max(0, selectedIndex);
                                        return (
                                          <li key={mod.id} className={`${active ? 'active' : complete ? 'complete' : ''}`}>
                                            <button type="button" onClick={() => {
                                              if (!isEnrolled) {
                                                showToast('Enroll in the course to access this module.', 'error');
                                                return;
                                              }
                                              setSelectedVideo(mod);
                                            }}>
                                              <span className="lesson-status">{active ? <FiPlay /> : complete ? <FiCheck /> : <span>{modules.findIndex((item) => item.id === mod.id) + 1}</span>}</span>
                                              <span className="lesson-copy">
                                                <strong>{getLessonName(mod, modules.findIndex((item) => item.id === mod.id))}</strong>
                                                <small>{active ? 'In progress' : complete ? 'Completed' : 'Video lesson'} · {mod.duration ? fmtTime(mod.duration) : `${8 + idx * 3}:20`}</small>
                                              </span>
                                              {complete && <FiCheckCircle className="lesson-check" />}
                                            </button>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </li>
                              );
                            })
                          ) : (
                            <li className="playlist-empty"><a href={materialUrl} target="_blank" rel="noreferrer">Open course folder <FiExternalLink /></a></li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <aside className="study-panel">
                      <div className="study-tabs">
                        <button type="button" className={studyPanel === "notes" ? "active" : ""} onClick={() => setStudyPanel("notes")}><FiEdit3 /> Notes</button>
                        <button type="button" className={studyPanel === "assistant" ? "active" : ""} onClick={() => setStudyPanel("assistant")}><FiZap /> AI Assistant</button>
                      </div>

                      {studyPanel === "notes" ? (
                        <div className="study-notes">
                          <div className="study-panel-heading">
                            <div><span>Synced workspace</span><h2>Lesson notes</h2></div>
                            <button type="button" onClick={handleNewNote}><FiPlus /> New note</button>
                          </div>
                          <p className="study-helper">Capture important ideas at the exact video timestamp.</p>
                          <div className="note-list">
                            {notes.length === 0 ? (
                              <>
                                <article className="note-item"><strong>02:45</strong><p>Security works best in layers: prevention, detection, response, and recovery.</p></article>
                                <article className="note-item"><strong>08:12</strong><p>Least privilege limits every identity to only the access needed for its task.</p></article>
                              </>
                            ) : notes.map((note, index) => (
                              <article className="note-item" key={`${note.time}-${index}`}><strong>{fmtTime(note.time)}</strong><p>{note.text}</p></article>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="assistant-panel">
                          <div className="assistant-heading">
                            <span className="assistant-orb"><FiMessageCircle /></span>
                            <div><h2>Learning assistant</h2><p>Ask about this lesson</p></div>
                            <span className="assistant-online">Online</span>
                          </div>
                          <div className="assistant-prompts">
                            {["Summarize this lesson", "Quiz me", "Explain the key idea"].map((prompt) => (
                              <button key={prompt} type="button" onClick={() => setChatInput(prompt)}>{prompt}</button>
                            ))}
                          </div>
                          <div className="chat-messages">
                            {chatMessages.map((message, index) => (
                              <div key={index} className={`chat-message ${message.role}`}>
                                {message.role === "assistant" && <span className="chat-avatar"><FiZap /></span>}
                                <p>{message.text}</p>
                              </div>
                            ))}
                            {chatLoading && <div className="chat-message assistant"><span className="chat-avatar"><FiZap /></span><p>Thinking…</p></div>}
                          </div>
                          <form className="chat-composer" onSubmit={handleChatSubmit}>
                            <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask anything about this lesson…" />
                            <button type="submit" aria-label="Send message" disabled={chatLoading || !chatInput.trim()}><FiSend /></button>
                          </form>
                        </div>
                      )}
                    </aside>
                  </section>
                </>
              )}

              {activeTab === "Reviews" && (
                <>
                  <h2>Reviews</h2>
                  <p>Learners rate this course {course.rating || "4.8"} for practical, beginner-friendly cybersecurity coverage.</p>
                </>
              )}
            </main>
          </div>

          <aside className="course-sidebar">
            <div className="course-sidebar-card">
              <div className="course-price">Free</div>
              <button
                type="button"
                onClick={enrollCourse}
                className={isEnrolled ? "btn btn-success w-100 py-3" : "btn btn-premium-indigo w-100 py-3"}
                disabled={isEnrolled}
              >
                {isEnrolled ? (
                  <>
                    <FiCheck className="me-2" /> Enrolled
                  </>
                ) : (
                  "Enroll Now for Free"
                )}
              </button>

              <div className="course-sidebar-list">
                <span><FiClock /> {course.duration || "12h"} course duration</span>
                <span><FiBookOpen /> Beginner friendly modules</span>
                <span><FiAward /> Certificate eligible</span>
                <span><FiStar /> {course.rating || "4.8"} learner rating</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default CourseDetails;
