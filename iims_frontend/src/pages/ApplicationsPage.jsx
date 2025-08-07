import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getAllApplicationsForTenant,
  getAllApplicationForms,
  updateApplicationStatus,
} from "../api/applicationForms";

export default function ApplicationsPage() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedFormId, setSelectedFormId] = useState(null);

  // --- New State for Custom Pop-ups ---
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState({
    appId: null,
    newStatus: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  // --- End New State ---

  useEffect(() => {
    if (!token || !user?.tenantId) return;

    setLoading(true);
    setError("");

    Promise.all([
      getAllApplicationsForTenant(token, user.tenantId),
      getAllApplicationForms(token, user.tenantId),
    ])
      .then(([apps, formsData]) => {
        setApplications(apps);
        setForms(formsData);
      })
      .catch((err) => setError(err.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, [token, user?.tenantId]);

  const getFormName = (formId) => {
    const form = forms.find((f) => f.id === formId);
    return form ? form.name : "Unknown Form";
  };

  const filteredApplications = selectedFormId
    ? applications.filter((app) => app.formId === selectedFormId)
    : [];

  // --- Handlers for Custom Pop-ups and Status Update Logic ---

  // Initiates the confirmation popup
  const initiateStatusChange = (appId, newStatusValue) => {
    setPendingStatusChange({ appId, newStatus: newStatusValue });
    setShowConfirmPopup(true);
  };

  // Confirms the status change and calls the API
  const confirmStatusChange = async () => {
    setShowConfirmPopup(false); // Close confirmation popup
    const { appId, newStatus } = pendingStatusChange;

    if (!token || !user?.tenantId || !appId || !newStatus) {
      setError("Authentication token, tenant ID, or status details missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const updatedApp = await updateApplicationStatus(
        token,
        user.tenantId,
        appId,
        newStatus
      );

      setApplications((prevApps) =>
        prevApps.map((app) => (app.id === appId ? updatedApp : app))
      );

      if (selectedApplication && selectedApplication.id === appId) {
        setSelectedApplication(updatedApp);
      }

      setLoading(false);
      setSuccessMessage(
        `Application status updated to ${newStatus} successfully!`
      );
      setShowSuccessPopup(true); // Show success popup
    } catch (err) {
      setError(err.message || "Failed to update application status.");
      setLoading(false);
    } finally {
      setPendingStatusChange({ appId: null, newStatus: null }); // Clear pending state
    }
  };

  // Cancels the status change (closes confirmation popup)
  const cancelStatusChange = () => {
    setShowConfirmPopup(false);
    setPendingStatusChange({ appId: null, newStatus: null });
  };

  // Closes the success popup
  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    setSuccessMessage("");
  };

  // --- End Handlers ---

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-blue-600 text-center py-8">Loading data...</div>
      );
    }

    if (error) {
      return <div className="text-red-600 text-center py-8">{error}</div>;
    }

    if (!selectedFormId) {
      return (
        <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">
            Available Application Forms
          </h1>
          {forms.length === 0 ? (
            <div className="text-gray-500 text-center">
              No application forms found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="bg-gray-50 rounded-lg shadow-md p-6 m-2 cursor-pointer hover:shadow-lg transition-shadow duration-300 border border-blue-200"
                  onClick={() => setSelectedFormId(form.id)}
                >
                  <h2 className="text-xl font-bold text-blue-700 mb-2">
                    {form.name}
                  </h2>
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Status:</span>{" "}
                    {form.status || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Created At:</span>{" "}
                    {form.createdAt
                      ? new Date(form.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex w-full max-w-7xl h-full">
        {/* Left Sidebar */}
        <div className="w-1/4 bg-white rounded-lg shadow-lg p-6 mr-4 overflow-y-auto">
          <h2 className="text-xl font-bold text-blue-800 mb-4">
            Application Forms
          </h2>
          <ul className="space-y-2">
            {forms.map((form) => (
              <li key={form.id}>
                <button
                  className={`block w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                    selectedFormId === form.id
                      ? "bg-blue-100 text-blue-800 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedFormId(form.id)}
                >
                  {form.name}
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setSelectedFormId(null)}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium shadow"
          >
            Back to All Forms
          </button>
        </div>

        {/* Right Content Area for Applications */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-blue-700 mb-6">
            Applications for: {getFormName(selectedFormId)}
          </h1>
          {filteredApplications.length === 0 ? (
            <div className="text-gray-500">
              No applications found for this form.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 border">Applicant</th>
                    <th className="px-4 py-2 border">Email</th>
                    <th className="px-4 py-2 border">Type</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Submitted</th>
                    <th className="px-4 py-2 border">View</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-blue-50">
                      <td className="px-4 py-2 border">
                        {app.firstName || "-"} {app.lastName || "-"}
                      </td>
                      <td className="px-4 py-2 border">{app.email}</td>
                      <td className="px-4 py-2 border">{app.applicantType}</td>
                      <td className="px-4 py-2 border">
                        <span
                          className={`font-bold ${
                            app.status === "APPROVED"
                              ? "text-green-600"
                              : app.status === "REJECTED"
                              ? "text-red-600"
                              : "text-orange-500"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border">
                        {app.submittedAt
                          ? new Date(app.submittedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => setSelectedApplication(app)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Back to Dashboard Button */}
      <div className="bg-white shadow-md py-4 px-6">
        <button
          onClick={() => window.location.href = "/tenant-admin/dashboard"}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex justify-center py-10 px-4">
        {renderContent()}
      </div>

      {/* --- Modal for application details (Enhanced UI) --- */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative border border-gray-200 animate-fade-in-down">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-light leading-none"
              onClick={() => setSelectedApplication(null)}
            >
              &times;
            </button>

            <h2 className="text-3xl font-extrabold text-blue-800 mb-6 border-b pb-4">
              Application Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-700">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-600 text-sm mb-0.5">Applicant Name:</span>
                <span className="text-lg">
                  {selectedApplication.firstName || "-"} {selectedApplication.lastName || "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-600 text-sm mb-0.5">Email:</span>
                <span className="text-lg">{selectedApplication.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-600 text-sm mb-0.5">Applicant Type:</span>
                <span className="text-lg">{selectedApplication.applicantType}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-600 text-sm mb-0.5">Applied For Form:</span>
                <span className="text-lg">{getFormName(selectedApplication.formId)}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-600 text-sm mb-0.5">Submitted On:</span>
                <span className="text-lg">
                  {selectedApplication.submittedAt
                    ? new Date(selectedApplication.submittedAt).toLocaleString()
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-600 text-sm mb-0.5">Current Status:</span>
                <span
                  className={`text-lg font-bold px-3 py-1 rounded-full inline-block ${
                    selectedApplication.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : selectedApplication.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {selectedApplication.status}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Applicant Responses:</h3>
              <ul className="space-y-3">
                {selectedApplication.fieldResponses &&
                selectedApplication.fieldResponses.length > 0 ? (
                  selectedApplication.fieldResponses.map((resp, idx) => (
                    <li key={idx} className="bg-gray-50 p-3 rounded-md border border-gray-100">
                      <span className="font-semibold text-blue-800">
                        {resp.fieldLabel}:
                      </span>{" "}
                      <span className="text-gray-800">{resp.response}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600 italic">No detailed responses found.</li>
                )}
              </ul>
            </div>

            {/* Action buttons inside the modal with rounded corners */}
            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() =>
                  initiateStatusChange(selectedApplication.id, "APPROVED")
                }
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading &&
                pendingStatusChange.newStatus === "APPROVED" &&
                pendingStatusChange.appId === selectedApplication.id
                  ? "Approving..."
                  : "Approve"}
              </button>
              <button
                onClick={() =>
                  initiateStatusChange(selectedApplication.id, "REJECTED")
                }
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-medium shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading &&
                pendingStatusChange.newStatus === "REJECTED" &&
                pendingStatusChange.appId === selectedApplication.id
                  ? "Rejecting..."
                  : "Reject"}
              </button>
              <button
                onClick={() =>
                  initiateStatusChange(selectedApplication.id, "PENDING")
                }
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading &&
                pendingStatusChange.newStatus === "PENDING" &&
                pendingStatusChange.appId === selectedApplication.id
                  ? "Setting Pending..."
                  : "Set Pending"}
              </button>
              <button
                onClick={() => setSelectedApplication(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-full font-medium shadow-md transition-transform transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Custom Confirmation Popup --- */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Are you sure?</h3>
            <p className="text-gray-600 text-lg mb-6">
              Do you really want to change the status to "
              <span className="font-semibold text-blue-700">
                {pendingStatusChange.newStatus}
              </span>
              "? This action can be reversed.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmStatusChange}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Yes, Change It
              </button>
              <button
                onClick={cancelStatusChange}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- End Custom Confirmation Popup --- */}

      {/* --- Custom Success Popup --- */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center border border-gray-200">
            <svg
              className="mx-auto mb-4 text-green-500 w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Success!</h3>
            <p className="text-gray-600 text-lg mb-6">{successMessage}</p>
            <button
              onClick={closeSuccessPopup}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {/* --- End Custom Success Popup --- */}
    </div>
  );
}