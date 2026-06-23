import { FiBookOpen } from "react-icons/fi";

function Footer() {
  return (
    <footer className="py-5 mt-auto border-top border-secondary" style={{ background: "rgba(11, 15, 25, 0.9)" }}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
              <FiBookOpen className="me-2 text-cyan" size={24} style={{ color: "#06b6d4" }} />
              <h5 className="m-0 fw-bold bg-gradient text-white">ETLP</h5>
            </div>
            <p className="text-secondary small m-0">
              JNTU-GV student learning ecosystem for artificial intelligence, cloud computing, cybersecurity, web & mobile applications.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="text-secondary small m-0">
              © {new Date().getFullYear()} ETLP. All Rights Reserved. Crafted for JNTU-GV Student Lifecycle Ecosystem.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;