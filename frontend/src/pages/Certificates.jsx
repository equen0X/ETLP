import { useEffect, useState } from "react";
import API from "../services/api";

function Certificates() {

  const [certificates,
    setCertificates] =
    useState([]);

  useEffect(() => {

    fetchCertificates();

  }, []);

  const fetchCertificates =
    async () => {

      try {

        const res =
          await API.get(
            "/certificates"
          );

        setCertificates(
          res.data.certificates
        );

      } catch (error) {

        console.log(error);

      }
    };

  return (
    <div className="container mt-5">

      <h2>
        My Certificates
      </h2>

      <div className="row">

        {certificates.map((cert) => (

          <div
            key={cert.id}
            className="col-md-4 mb-3"
          >

            <div className="card p-3">

              <h5>
                {cert.course_name}
              </h5>

              <p>
                Issued :
                {cert.issue_date}
              </p>

              <a
                href={cert.file_url}
                className="btn btn-primary"
              >
                Download
              </a>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Certificates;