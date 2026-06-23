import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function FacultyRoute({ children }) {
  const { user } = useContext(AuthContext);

  return user?.role === "faculty" || user?.role === "admin" ? children : <Navigate to="/" />;
}

export default FacultyRoute;