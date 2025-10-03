import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ReportDetailsModal({ reportId, isOpen, onClose, onReportUpdated }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  

  // Fetch report details whenever modal opens
  useEffect(() => {
    if (!isOpen || !reportId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5006/api/reports/${reportId}/single-report`, { withCredentials: true });
        if (res.data.success) {
          setReport(res.data.report);
        } else {
          alert("Failed to fetch report details");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching report details");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isOpen, reportId]);

  if (!isOpen) return null;

  // Delete post
  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setDeletingPost(true);
      const res = await axios.delete(`http://localhost:5006/api/reports/${report.postId._id}/delete`, { withCredentials: true });
      if (res.data.success) {
        alert("Post deleted successfully");
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    } finally {
      setDeletingPost(false);
    }
  };

  // Update report status
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setUpdatingStatus(true);
      const res = await axios.put(
        `http://localhost:5006/api/reports/${reportId}/update-status`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (res.data.success) {
        setReport(prev => ({ ...prev, status: newStatus }));
        alert("Report status updated");
        onReportUpdated?.(); // optional callback to update parent table
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[900px] max-w-full p-6 z-10 overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
        >
          ✕
        </button>

        {/* Loading */}
        {loading && <p className="text-gray-500">Loading report details...</p>}

        {!loading && report && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Report Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left - Post Details */}
              <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Post Details</h3>
                {report.postId ? (
                  <div className="space-y-2 text-gray-700">
                    <p><span className="font-semibold">Caption:</span> {report.postId.caption}</p>
                    {report.postId.imageUrls && report.postId.imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {report.postId.imageUrls.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Post image ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                    <p>
                      <span className="font-semibold">Created At:</span>{" "}
                      {new Date(report.postId.createdAt).toLocaleString()}
                    </p>
                    {report.postId.userId && (
                      <p>
                        <span className="font-semibold">Original Poster:</span>{" "}
                        {report.postId.userId.username} ({report.postId.userId.email})
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Post details not available</p>
                )}
              </div>

              {/* Right - Users */}
              <div className="bg-gray-50 rounded-xl p-4 shadow-inner space-y-4">
                {/* Post Creator */}
                <div>
                  <p className="font-semibold text-blue-600 mb-2">Post Creator</p>
                  {report.postCreator ? (
                    <div className="space-y-1 text-gray-700">
                      <p><span className="font-semibold">Username:</span> {report.postCreator.name}</p>
                      <p><span className="font-semibold">Email:</span> {report.postCreator.email}</p>
                      <p><span className="font-semibold">Role:</span> {report.postCreator.role}</p>
                      <p><span className="font-semibold">Joined:</span> {new Date(report.postCreator.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-semibold">Last Login:</span> {report.postCreator.lastLogin ? new Date(report.postCreator.lastLogin).toLocaleString() : "-"}</p>
                      <p><span className="font-semibold">Login Count:</span> {report.postCreator.loginCount}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Creator details not available</p>
                  )}
                </div>

                {/* Reporter */}
                <div>
                  <p className="font-semibold text-red-600 mb-2">Reporter</p>
                  {report.reporter ? (
                    <div className="space-y-1 text-gray-700">
                      <p><span className="font-semibold">Username:</span> {report.reporter.name}</p>
                      <p><span className="font-semibold">Email:</span> {report.reporter.email}</p>
                      <p><span className="font-semibold">Role:</span> {report.reporter.role}</p>
                      <p><span className="font-semibold">Joined:</span> {new Date(report.reporter.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-semibold">Last Login:</span> {report.reporter.lastLogin ? new Date(report.reporter.lastLogin).toLocaleString() : "-"}</p>
                      <p><span className="font-semibold">Login Count:</span> {report.reporter.loginCount}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Reporter details not available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Report Info */}
            <div className="mt-6 bg-gray-100 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Report Information</h3>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Reason:</span> {report.reason}</p>
                <p><span className="font-semibold">Description:</span> {report.description || "N/A"}</p>
                <p>
                    <span className="font-semibold">Status:</span>{" "}
                    <select
                    value={report.status}
                    onChange={handleStatusChange}
                    disabled={updatingStatus}
                    className="ml-2 border px-2 py-1 rounded"
                    >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Resolved">Resolved</option>
                    </select>
                </p>
                <p><span className="font-semibold">Reported At:</span> {new Date(report.createdAt).toLocaleString()}</p>
              </div>
                          {/* Actions */}
            {/* Actions */}
                <div className="mt-4 flex justify-end gap-3">
                <button
                    onClick={handleDeletePost}
                    disabled={deletingPost}
                    className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                    Delete Post
                </button>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
