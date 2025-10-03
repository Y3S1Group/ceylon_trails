import { useEffect, useState } from "react";
import axios from "axios";
import ReportPostModel from "../../components/AdminDash/ReportPostModel";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(""); // empty = all


  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5006/api/reports/all",
          { withCredentials: true }
        );
        if (res.data.success) {
          setReports(res.data.reports);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

    const filteredReports = reports.filter((report) => {
        if (!statusFilter) return true; // show all
        return report.status === statusFilter;
    });

  const handleViewReportPost = (report) => {
    setSelectedUser(report);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">Loading reports...</div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
        <div className="flex items-center gap-3 mb-4">
        <label className="font-medium text-gray-700">Filter by status:</label>
        <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
        >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Resolved">Resolved</option>
        </select>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Report Description</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map((report, index) => (
              <tr key={report._id} className="hover:bg-gray-100 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">{report.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">{report.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(report.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold 
                      ${
                        report.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : report.status === "reviewed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewReportPost(report)} // show reporter profile
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    View Reporter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Profile Modal */}
      <ReportPostModel
        reportId={selectedUser?._id}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onReportUpdated = {() => {
            const fetchReports = async () => {
                try {
                    const res = await axios.get("http://localhost:5006/api/reports/all", { withCredentials: true });
                    if (res.data.success) setReports(res.data.reports);
                } catch (err) {
                    console.error(err);
                }
                };
            fetchReports();
        }}
      />
    </div>
  );
}
