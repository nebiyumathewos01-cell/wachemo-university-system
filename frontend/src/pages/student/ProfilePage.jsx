import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, uploadProfilePhoto, changePassword } from '../../services/api';
import { DEPARTMENTS, BANKS } from '../../utils/helpers';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiCamera, FiSave, FiLock } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, student, setStudent, fetchMe } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: student?.phone || '',
    bankName: student?.bankName || '',
    accountNumber: student?.accountNumber || '',
    accountHolderName: student?.accountHolderName || '',
  });

  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      await fetchMe();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('profilePhoto', file);
    setUploadingPhoto(true);
    try {
      await uploadProfilePhoto(fd);
      await fetchMe();
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setChangingPass(true);
    try {
      await changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed successfully');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary-600 text-white text-2xl font-bold flex items-center justify-center overflow-hidden">
            {student?.profilePhoto ? (
              <img src={student.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.charAt(0).toUpperCase()
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-6 h-6 bg-primary-700 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-800">
            {uploadingPhoto ? <LoadingSpinner size="sm" /> : <FiCamera className="h-3 w-3" />}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-primary-600 mt-1">{student?.department} • Year {student?.year}</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input value={user?.email} disabled className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="0912345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
              <input value={student?.studentId} disabled className="input-field" />
            </div>
          </div>

          <hr className="dark:border-gray-700" />
          <h3 className="font-medium text-gray-900 dark:text-white">Bank Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
              <select value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="input-field">
                <option value="">Select bank</option>
                {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
              <input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} className="input-field" placeholder="Account number" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Holder Name</label>
              <input value={form.accountHolderName} onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })} className="input-field" placeholder="Name as on bank account" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary gap-2">
            {saving ? <LoadingSpinner size="sm" /> : <FiSave />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiLock className="h-4 w-4" /> Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input type="password" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} className="input-field" placeholder="Enter current password" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input type="password" value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} className="input-field" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input type="password" value={passForm.confirmPassword} onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} className="input-field" placeholder="Repeat new password" />
            </div>
          </div>
          <button type="submit" disabled={changingPass} className="btn-primary gap-2">
            {changingPass ? <LoadingSpinner size="sm" /> : <FiLock />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
