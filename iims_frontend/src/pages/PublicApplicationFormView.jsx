import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicationFormById, submitApplication } from "../api/applicationForms";

export default function PublicApplicationFormView() {
  const { id: formId } = useParams(); 
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!formId) {
      setError("Form ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    getApplicationFormById(null, null, formId)
      .then(data => {
        setForm(data);
        setApplicant(a => ({ ...a, applicantType: data.type }));
        setResponses(data.fields.map(f => ({ fieldId: f.id, response: "" })));
      })
      .catch(err => {
        console.error("Error loading public form:", err); 
        setError(err.message || "Failed to load application form.");
      })
      .finally(() => setLoading(false));
  }, [formId]); 
}