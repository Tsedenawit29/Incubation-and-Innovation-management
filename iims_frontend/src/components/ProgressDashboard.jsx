import React, { useEffect, useState } from "react";
import { getTrackings, getSubmissions } from "../api/progresstracking";

export default function ProgressDashboard() {
  const [trackings, setTrackings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getTrackings(), getSubmissions()])
      .then(([trackings, submissions]) => {
        setTrackings(trackings);
        setSubmissions(submissions);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Startup Progress Overview</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Startup</th>
              <th className="border px-2 py-1">Template</th>
              <th className="border px-2 py-1">Completed Tasks</th>
              <th className="border px-2 py-1">Total Tasks</th>
            </tr>
          </thead>
          <tbody>
            {trackings.map(tracking => {
              const startupId = tracking.assignment?.assignedToId;
              const templateId = tracking.assignment?.templateId;
              const completed = submissions.filter(
                s => s.trackingId === tracking.id && s.status === 'Completed'
              ).length;
              const total = submissions.filter(
                s => s.trackingId === tracking.id
              ).length;
              return (
                <tr key={tracking.id}>
                  <td className="border px-2 py-1">{startupId}</td>
                  <td className="border px-2 py-1">{templateId}</td>
                  <td className="border px-2 py-1">{completed}</td>
                  <td className="border px-2 py-1">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
} 