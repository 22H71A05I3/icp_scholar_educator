import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { backend } from "../backend/backend";

const CertificateViewer = () => {
  const { courseId } = useParams();
  const [certificate, setCertificate] = useState("");

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const cert = await backend.get_certificate(BigInt(courseId));
        setCertificate(cert);
      } catch (err) {
        console.error(err);
        setCertificate("Failed to fetch certificate.");
      }
    };

    fetchCertificate();
  }, [courseId]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow text-center">
      <h2 className="text-xl font-semibold mb-4">Course Certificate</h2>
      <p className="text-lg text-gray-700">{certificate}</p>
    </div>
  );
};

export default CertificateViewer;
