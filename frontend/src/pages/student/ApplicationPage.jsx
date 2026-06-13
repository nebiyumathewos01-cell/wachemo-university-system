import { useState, useEffect } from 'react';
import { getMyApplication, submitApplication, downloadApprovalLetter } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS, BANKS, formatDate, downloadBlob } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiUpload, FiCheckCircle, FiDownload, FiFileText } from 'react-icons/fi';

const FileInput = ({ label, name, onChange, accept = 'image/*,.pdf', required = true, file }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:border-primary-400 transition-colors ${file ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}>
      <input type="file" name={name} onChange={onChange} accept={accept} className="hidden" id={name} />
      <label htmlFor={name} className="cursor-pointer flex items-center justify-center gap-2">
        {file ? (
          <>
            <FiCheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 truncate max-w-[200px]">{file.name}</span>
          </>
        ) : (
          <>
            <FiUpload className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Click to upload</span>
          </>
        )}
      </label>
    </div>
    <p className="text-xs text-gray-400 mt-1">JPG, PNG, or PDF — max 5MB</p>
  </div>
);

const ApplicationPage = () => {
  const { student } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [files, setFiles] = useState({});
  const [form, setForm] = useState({
    reason: '', bankName: '', accountNumber: '', accountHolderName: '', declarationAccepted: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMyApplication();
        setApplication(data.data);
      } catch (err) {
        if (err.response?.status !== 404) toast.error('Failed to load application');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason || form.reason.length < 50) {
      toast.error('Reason must be at least 50 characters'); return;
    }
    if (!form.declarationAccepted) {
      toast.error('You must accept the declaration'); return;
    }
    const required = ['studentIdDocument', 'nationalIdDocument', 'bankProof', 'paymentReceipt', 'declarationForm', 'photo'];
    for (const f of required) {
      if (!files[f]) { toast.error(`Please upload: ${f.replace(/([A-Z])/g, ' $1').trim()}`); return; }
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      Object.entries(files).forEach(([k, v]) => fd.append(k, v));

      const { data } = await submitApplication(fd);
      setApplication(data.data);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadLetter = async () => {
    setDownloading(true);
    try {
      const { data } = await downloadApprovalLetter(application._id);
      downloadBlob(data, `approval_letter_${student?.studentId}.pdf`);
      toast.success('Approval letter downloaded');
    } catch (err) {
      toast.error('Failed to download approval letter');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  // Show existing application
  if (application) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Application</h1>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white">Application Status</h2>
            <StatusBadge status={application.status} />
          </div>

          <div className="space-y-3">
            {[
              ['Submitted', formatDate(application.submittedAt)],
              ['Student ID', student?.studentId],
              ['Department', student?.department],
              ['Year', `Year ${student?.year}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>

          {/* Status info */}
          {application.status === 'pending' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                ⏳ Your application is pending review. You will be notified once admin reviews it.
              </p>
            </div>
          )}
          {application.status === 'under_review' && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🔍 Your application is currently being reviewed by admin staff.
              </p>
            </div>
          )}
          {application.status === 'approved' && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Congratulations! Your application is approved.
                </p>
              </div>
              <p className="text-xs text-green-600 mb-3">You will receive 3,000 ETB monthly compensation.</p>
              {application.approvalLetterPath && (
                <button
                  onClick={handleDownloadLetter}
                  disabled={downloading}
                  className="btn-primary text-sm gap-2"
                >
                  {downloading ? <LoadingSpinner size="sm" /> : <FiDownload />}
                  Download Approval Letter
                </button>
              )}
            </div>
          )}
          {application.status === 'rejected' && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Application Not Approved</p>
              {application.rejectionReason && (
                <p className="text-xs text-red-600 dark:text-red-400">Reason: {application.rejectionReason}</p>
              )}
            </div>
          )}

          {/* Additional document request */}
          {application.additionalDocumentRequest && (
            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">Additional Documents Requested</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">{application.additionalDocumentRequest}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Application form
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Non-Cafeteria Application</h1>
        <p className="text-sm text-gray-500 mt-1">Complete all fields and upload required documents to apply for the 3,000 ETB monthly compensation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal info (read-only) */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['Student ID', student?.studentId],
              ['Department', student?.department],
              ['Year of Study', `Year ${student?.year}`],
              ['Phone', student?.phone],
            ].map(([label, value]) => (
              <div key={label}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input value={value || ''} disabled className="input-field" />
              </div>
            ))}
          </div>
        </div>

        {/* Bank info */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Bank Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name <span className="text-red-500">*</span></label>
              <select value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="input-field" required>
                <option value="">Select bank</option>
                {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                value={form.accountNumber}
                onChange={(e) => {
                  // digits only
                  const val = e.target.value.replace(/\D/g, '');
                  setForm({ ...form, accountNumber: val });
                }}
                className="input-field"
                required
                placeholder="e.g. 1000123456789"
                maxLength={20}
                minLength={5}
                pattern="\d{5,20}"
                title="Account number must contain digits only (5–20 digits)"
              />
              <p className="text-xs text-gray-400 mt-1">Digits only — {form.accountNumber.length}/20</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Holder Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.accountHolderName} onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })} className="input-field" required placeholder="Name on bank account" />
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Reason for Non-Cafeteria Service</h2>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={5}
            className="input-field resize-none"
            placeholder="Please explain your reason for choosing non-cafeteria service (min 50 characters)..."
            required
          />
          <p className="text-xs text-gray-400 mt-1">{form.reason.length} characters (minimum 50)</p>
        </div>

        {/* Document uploads */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Required Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileInput label="Student ID Card" name="studentIdDocument" onChange={handleFileChange} file={files.studentIdDocument} />
            <FileInput label="National ID Card" name="nationalIdDocument" onChange={handleFileChange} file={files.nationalIdDocument} />
            <FileInput label="Bank Account Proof" name="bankProof" onChange={handleFileChange} file={files.bankProof} />
            <FileInput label="Payment Receipt" name="paymentReceipt" onChange={handleFileChange} file={files.paymentReceipt} />
            <FileInput label="Signed Declaration Form" name="declarationForm" onChange={handleFileChange} file={files.declarationForm} />
            <FileInput label="Recent Passport Size Photo" name="photo" onChange={handleFileChange} accept="image/*" file={files.photo} />
          </div>
        </div>

        {/* Declaration */}
        <div className="card border-2 border-primary-200 dark:border-primary-800">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="declaration"
              checked={form.declarationAccepted}
              onChange={(e) => setForm({ ...form, declarationAccepted: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="declaration" className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer">
              <strong>Student Declaration:</strong> I confirm that I voluntarily choose not to use university cafeteria services and understand that my cafeteria meal card must be surrendered before final approval. I acknowledge that providing false information will result in immediate disqualification.
            </label>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base gap-2">
          {submitting ? <LoadingSpinner size="sm" /> : <><FiFileText /> Submit Application</>}
        </button>
      </form>
    </div>
  );
};

export default ApplicationPage;
