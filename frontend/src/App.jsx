import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import FacultyRoute from "./components/FacultyRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Search from "./pages/Search";
import Progress from "./pages/Progress";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";

/* ADD THESE IMPORTS */
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Certificates from "./pages/Certificates";
import Notifications from "./pages/Notifications";

function AppContent() {
  const location = useLocation();
  const hideChrome = location.pathname.startsWith("/course/");

  return (
    <>

      {!hideChrome && <Navbar />}

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/courses" element={<Courses />} />

        <Route
          path="/course/:id"
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/faculty"
          element={
            <FacultyRoute>
              <FacultyDashboard />
            </FacultyRoute>
          }
        />

        {/* PASTE THEM HERE */}

        <Route
          path="/quiz"
          element={<Quiz />}
        />

        <Route
          path="/results"
          element={<Results />}
        />

        <Route
          path="/certificates"
          element={<Certificates />}
        />
        <Route
          path="/search"
          element={<Search />}
        />

        <Route
          path="/progress"
          element={<Progress />}
        />
        <Route
          path="/notifications"
          element={<Notifications />}
        />

      </Routes>

      {!hideChrome && <Footer />}

    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
