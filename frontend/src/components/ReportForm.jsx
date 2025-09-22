import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ReportForm = ({ isOpen, onClose, postId }) => {
  const { isLoggedIn, user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason for reporting');
      return;
    }
    if (!isLoggedIn || !user?.id) {
      setError('Please log in to report a post');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5006/api/reports/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for auth, like SavedPost
        body: JSON.stringify({
          postId,
          reason,
          description: description.trim(),
          userId: user.id
        })
      });

      const data = await response.json();
      console.log('Report post response:', data); // Debug log, like SavedPost
      if (response.ok && data.success) {
        setSubmitted(true);
        setTimeout(() => onClose(), 2000);
      } else {
        setError(data.message || 'Failed to submit report');
      }
    } catch (err) {
      console.error('Report submission error:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!isLoggedIn || !user?.id) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Report Post</h2>
          </div>
          <p className="text-red-500 text-sm mb-4">Please log in to report a post.</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-2xl bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Report Post</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {loading && (
          <div className="flex justify-center mb-4">
            <div className="w-6 h-6 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {submitted ? (
          <p className="text-teal-600 text-sm mb-4">Report submitted. Thank you!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
                required
              >
                <option value="">Select a reason</option>
                <option value="Spam">Spam</option>
                <option value="Inappropriate">Inappropriate</option>
                <option value="Harassment">Harassment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="4"
                disabled={loading}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg ${loading ? 'bg-teal-300' : 'bg-teal-600 hover:bg-teal-700'} disabled:opacity-50`}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportForm;