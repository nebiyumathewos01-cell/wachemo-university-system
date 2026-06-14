import { FiCode, FiGlobe, FiHeart, FiAward, FiBook, FiCpu } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Hero card */}
      <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)' }}>
        <div className="p-8 text-center text-white">
          {/* Avatar initials */}
          <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/50 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white">
            NM
          </div>
          <h1 className="text-2xl font-bold mb-1">Nebiyu Mathewos</h1>
          <p className="text-blue-200 text-sm font-medium mb-3">Computer Science Student</p>
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm">
            <FiAward className="h-4 w-4 text-yellow-300" />
            <span>Wachemo University · Department of Computer Science</span>
          </div>
        </div>
        <div style={{ background: 'white', clipPath: 'ellipse(55% 40% at 50% 100%)' }} className="h-10 dark:bg-gray-800" />
      </div>

      {/* About the developer */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FiCode className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About the Developer</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
          This system was designed and developed by{' '}
          <strong className="text-gray-900 dark:text-white">Nebiyu Mathewos</strong>, a Computer Science
          student at <strong className="text-gray-900 dark:text-white">Wachemo University</strong>. The
          project was built to digitize and streamline the non-cafeteria student registration process,
          replacing manual paperwork with a modern, secure web application.
        </p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm mt-3">
          The system enables students to apply online for non-cafeteria status, upload required documents,
          track their application status, and receive monthly compensation payments of{' '}
          <strong>3,000 ETB</strong> — all managed through a secure admin dashboard.
        </p>
      </div>

      {/* About the system */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <FiGlobe className="h-5 w-5 text-green-700 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About the System</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'System Name', value: 'Non-Cafeteria Registration System' },
            { label: 'University', value: 'Wachemo University' },
            { label: 'Developer', value: 'Nebiyu Mathewos' },
            { label: 'Version', value: '1.0.0' },
            { label: 'Year', value: new Date().getFullYear().toString() },
            { label: 'Monthly Compensation', value: '3,000 ETB' },
            { label: 'Department', value: 'Computer Science' },
            { label: 'Target Users', value: 'Students & Admin Staff' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <FiCpu className="h-5 w-5 text-purple-700 dark:text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Technologies Used</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'React.js', role: 'Frontend UI', color: 'bg-blue-100 text-blue-700' },
            { name: 'Node.js', role: 'Backend Runtime', color: 'bg-green-100 text-green-700' },
            { name: 'Express.js', role: 'Web Framework', color: 'bg-gray-100 text-gray-700' },
            { name: 'MongoDB', role: 'Database', color: 'bg-green-100 text-green-800' },
            { name: 'JWT Auth', role: 'Security', color: 'bg-yellow-100 text-yellow-700' },
            { name: 'Tailwind CSS', role: 'Styling', color: 'bg-cyan-100 text-cyan-700' },
            { name: 'Multer', role: 'File Uploads', color: 'bg-orange-100 text-orange-700' },
            { name: 'PDFKit', role: 'PDF Generation', color: 'bg-red-100 text-red-700' },
            { name: 'Nodemailer', role: 'Email Service', color: 'bg-indigo-100 text-indigo-700' },
          ].map(({ name, role, color }) => (
            <div key={name} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-1 ${color}`}>{name}</span>
              <p className="text-xs text-gray-400">{role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key features */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <FiBook className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Features</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            '✅ Online application submission',
            '✅ Document upload & verification',
            '✅ Real-time application tracking',
            '✅ JWT-secured authentication',
            '✅ Role-based access control',
            '✅ Monthly payment management',
            '✅ PDF approval letter generation',
            '✅ Excel & PDF export reports',
            '✅ Email notifications',
            '✅ Admin audit logging',
            '✅ Dark mode support',
            '✅ Responsive mobile design',
          ].map((f) => (
            <p key={f} className="text-sm text-gray-600 dark:text-gray-300">{f}</p>
          ))}
        </div>
      </div>

      {/* Footer credit */}
      <div className="card text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
        <FiHeart className="h-6 w-6 text-red-500 mx-auto mb-3" />
        <p className="text-gray-700 dark:text-gray-200 font-medium text-lg">
          Developed with ❤️ by <strong>Nebiyu Mathewos</strong>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Computer Science Student · Wachemo University
        </p>
        <p className="text-xs text-gray-400 mt-3">
          © {new Date().getFullYear()} Wachemo University Non-Cafeteria Registration System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
