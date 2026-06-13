import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, updateApplicationStatus, updateChecklist } from '../../services/api';
import { formatDate, formatDateTime } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiX, FiEye, FiCheckSquare } from 'react-icons/fi';

const CHECKLIST_LABELS = {
  studentIdVerified: 'Student ID Verified',
  nationalIdVerified: 'National ID Verified',
  bankAccountVerified: 'Bank Account Verified',
  paymentReceiptVerified: 'Payment Receipt Verified',
  cafeteriaCardSurrendered: 'Cafeteria Card Surrendered',
  studentInfoVerified: 'Student Information Verified',
};

const DocLink = ({ label, path }) => {
  if (!path) return <span className="text-gray-400 text-sm">Not uploaded</span>;
  return (
    <a
      href={path}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary-600 hover:underline text-sm"
    >
      <FiEye className="h-3 w-3" /> View {label}
    </a>
  );
};

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [additionalDocRequest, setAdditionalDocRequest] = useState('');
  const [checklist, setChecklist] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getApplicationById(id);
        setApp(data.data);
        setChecklist(data.data.verificationChecklist || {});
      } catch (err) {
        toast.error('Failed to load application');
        navigate('/admin/applications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusUpdate = async (status, reason = '') => {
    setUpdating(true);
    try {
      const payload = { status };
      if (reason) payload.rejectionReason = reason;
      if (additionalDocRequest) payload.additionalDocumentRequest = additionalDocRequest;
      const { data } = await updateApplicationStatus(id, payload);
      setApp(data.data);
      setShowRejectModal(false);
      toast.success(`Application ${status} successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleChecklistUpdate = async (key, value) => {
    const newChecklist = { ...checklist, [key]: value };
    setChecklist(newChecklist);
    try {
      await updateChecklist(id, { verificationChecklist: newChecklist });
      toast.success('Checklist updated');
    } catch {
      toast.error('Failed to update checklist');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!app) return null;

  const student = app.studentId;
  const user = app.userId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Application Review</h1>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Student Information</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Full Name', user?.fullName],
                ['Email', user?.email],
                ['Student ID', student?.studentId],
                ['Department', student?.department],
                ['Year of Study', `Year ${student?.year}`],
                ['Phone', student?.phone],
                ['Bank Name', student?.bankName],
                ['Account No.', student?.accountNumber],
                ['Account Holder', student?.accountHolderName],
                ['Submitted', formatDateTime(app.submittedAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Reason for Non-Cafeteria Service</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{app.reason}</p>
          </div>

          {/* Documents */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Uploaded Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Student ID Card', app.studentIdDocument],
                ['National ID Card', app.nationalIdDocument],
                ['Bank Account Proof', app.bankProof],
                ['Payment Receipt', app.paymentReceipt],
                ['Declaration Form', app.declarationForm],
                ['Passport Photo', app.photo],
              ].map(([label, path]) => (
                <div key={label} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <DocLink label={label} path={path} />
                </div>
              ))}
            </div>
          </div>

          {/* Rejection reason if exists */}
          {app.rejectionReason && (
            <div className="card border-red-200 dark:border-red-800">
              <h2 className="font-semibold text-red-700 dark:text-red-400 mb-2">Rejection Reason</h2>
              <p className="text-sm text-red-600 dark:text-red-300">{app.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          {/* Verification checklist */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiCheckSquare className="h-4 w-4" /> Verification Checklist
            </h2>
            <div className="space-y-3">
              {Object.entries(CHECKLIST_LABELS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist[key] || false}
                    onChange={(e) => handleChecklistUpdate(key, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className={`text-sm ${checklist[key] ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {Object.values(checklist).filter(Boolean).length} / {Object.keys(CHECKLIST_LABELS).length} verified
            </p>
          </div>

          {/* Actions */}
          {['pending', 'under_review'].includes(app.status) && (
            <div className="card space-y-3">
              <h2 className="font-semibold text-gray-900 dark:text-white">Actions</h2>

              {app.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('under_review')}
                  disabled={updating}
                  className="btn-secondary w-full justify-center gap-2"
                >
                  Mark Under Review
                </button>
              )}

              <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={updating}
                className="btn-primary w-full justify-center gap-2"
              >
                {updating ? <LoadingSpinner size="sm" /> : <FiCheck />}
                Approve Application
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={updating}
                className="btn-danger w-full justify-center gap-2"
              >
                <FiX /> Reject Application
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Request Additional Docs</label>
                <textarea
                  value={additionalDocRequest}
                  onChange={(e) => setAdditionalDocRequest(e.target.value)}
                  rows={3}
                  className="input-field text-sm resize-none"
                  placeholder="Specify what additional documents are needed..."
                />
                {additionalDocRequest && (
                  <button
                    onClick={() => handleStatusUpdate('under_review')}
                    className="btn-secondary text-sm w-full mt-2"
                  >
                    Send Request
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Approval letter info */}
          {app.status === 'approved' && app.approvalLetterPath && (
            <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-2">✅ Approval letter generated</p>
              <a
                href={app.approvalLetterPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline"
              >
                View approval letter →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reject Application</h3>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rejection Reason *</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="input-field resize-none mb-4"
              placeholder="Explain why this application is rejected..."
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRejectModal(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => {
                  if (!rejectionReason.trim()) { toast.error('Rejection reason is required'); return; }
                  handleStatusUpdate('rejected', rejectionReason);
                }}
                disabled={updating}
                className="btn-danger"
              >
                {updating ? <LoadingSpinner size="sm" /> : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPage;
