import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiHome, FiUsers, FiFileText, FiCreditCard, FiBell, FiLogOut,
  FiMenu, FiMoon, FiSun, FiShield, FiBarChart2, FiInfo,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/admin/applications', label: 'Applications', icon: FiFileText },
  { to: '/admin/payments', label: 'Payments', icon: FiCreditCard },
  { to: '/admin/students', label: 'Students', icon: FiUsers },
  { to: '/admin/users', label: 'Users', icon: FiShield },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: FiBarChart2 },
  { to: '/admin/notifications', label: 'Notify Students', icon: FiBell },
  { to: '/admin/about', label: 'About', icon: FiInfo },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary-900 shadow-xl transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-800">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-primary-900 font-bold text-sm">WU</div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Wachemo University</p>
            <p className="text-xs text-primary-300">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-primary-800 transition-colors"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <FiMenu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">Admin Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              {dark ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30">
              <div className="w-7 h-7 rounded-full bg-primary-700 text-white text-xs font-bold flex items-center justify-center">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300 hidden sm:block">
                {user?.fullName}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
