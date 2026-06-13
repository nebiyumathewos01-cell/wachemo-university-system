export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getStatusBadge = (status) => {
  const map = {
    pending: 'badge-pending',
    under_review: 'badge-review',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    paid: 'badge-paid',
  };
  return map[status] || 'badge-pending';
};

export const getStatusLabel = (status) => {
  const map = {
    pending: 'Pending',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    paid: 'Paid',
  };
  return map[status] || status;
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Business Administration',
  'Accounting and Finance',
  'Economics',
  'Law',
  'Medicine',
  'Nursing',
  'Pharmacy',
  'Natural Sciences',
  'Social Sciences',
  'Agriculture',
  'Other',
];

export const BANKS = [
  'Commercial Bank of Ethiopia (CBE)',
  'Awash Bank',
  'Dashen Bank',
  'Abyssinia Bank',
  'United Bank',
  'Nib International Bank',
  'Cooperative Bank of Oromia',
  'Oromia International Bank',
  'Zemen Bank',
  'Berhan Bank',
  'Abay Bank',
  'Addis International Bank',
  'Other',
];
