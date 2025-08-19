import React, { useState } from 'react';
import { formatDate } from '../../utils/dateHelpers';

const LeaveCard = ({ leave, showActions, onApprove, onReject, compact = false }) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [comments, setComments] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAction = (type) => {
    setActionType(type);
    setShowCommentModal(true);
  };

  const confirmAction = () => {
    if (actionType === 'approved' && onApprove) {
      onApprove(leave._id, comments);
    } else if (actionType === 'rejected' && onReject) {
      onReject(leave._id, comments);
    }
    setShowCommentModal(false);
    setComments('');
    setActionType('');
  };

  return (
    <>
      <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
        compact ? 'bg-gray-50' : 'bg-white'
      }`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-gray-900">
                {leave.employeeId?.name || 'Unknown Employee'}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Department:</strong> {leave.employeeId?.department}</p>
              <p><strong>Duration:</strong> {formatDate(leave.startDate)} to {formatDate(leave.endDate)}</p>
              <p><strong>Days:</strong> {leave.daysRequested}</p>
              <p><strong>Reason:</strong> {leave.reason}</p>
              {leave.reviewComments && (
                <p><strong>Comments:</strong> {leave.reviewComments}</p>
              )}
            </div>
          </div>

          {showActions && leave.status === 'pending' && (
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleAction('approved')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction('rejected')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Applied: {formatDate(leave.createdAt)}
          {leave.reviewedAt && (
            <span className="ml-4">
              Reviewed: {formatDate(leave.reviewedAt)}
            </span>
          )}
        </div>
      </div>

      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'approved' ? 'Approve' : 'Reject'} Leave Request
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any comments..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmAction}
                className={`flex-1 py-2 px-4 rounded-md text-white ${
                  actionType === 'approved' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}
              </button>
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveCard;
