import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import { Login, Register } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PostJob from './pages/PostJob';
import Applicants from './pages/Applicants';
import { Avatar, Icon, Spinner } from './ui';

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function Rail() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <aside className="rail">
      <Link to="/" className="brand">
        <span className="brand-mark"><Icon name="briefcase" size={17} /></span>
        <span>JobPortal</span>
      </Link>

      <nav aria-label="Main">
        <NavLink to="/" end><Icon name="search" />Browse jobs</NavLink>
        {user ? (
          <>
            <NavLink to="/dashboard"><Icon name="grid" />Dashboard</NavLink>
            {user.role === 'employer' && <NavLink to="/post-job"><Icon name="plus" />Post a job</NavLink>}
            <NavLink to="/profile"><Icon name="user" />Profile</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login"><Icon name="login" />Log in</NavLink>
            <NavLink to="/register" className="rail-cta"><Icon name="plus" />Create account</NavLink>
          </>
        )}
      </nav>

      {user && (
        <div className="who">
          <Avatar name={user.name} size={36} round />
          <div className="who-text">
            <b>{user.name}</b>
            <span>{user.role === 'employer' ? 'Employer' : 'Job seeker'}</span>
          </div>
          <button
            className="icon-btn"
            onClick={() => { logout(); nav('/'); }}
            aria-label="Log out"
            title="Log out"
          >
            <Icon name="logout" />
          </button>
        </div>
      )}
    </aside>
  );
}

export default function App() {
  return (
    <div className="shell">
      <Rail />
      <div className="stage">
        <main className="content">
          <Routes>
            <Route path="/" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/post-job" element={<Protected role="employer"><PostJob /></Protected>} />
            <Route path="/edit-job/:id" element={<Protected role="employer"><PostJob /></Protected>} />
            <Route path="/jobs/:id/applicants" element={<Protected role="employer"><Applicants /></Protected>} />
            <Route
              path="*"
              element={
                <div className="empty">
                  <h3>Page not found</h3>
                  <p>That address doesn’t exist. <Link to="/">Go back to the job list</Link>.</p>
                </div>
              }
            />
          </Routes>
        </main>
        <footer className="footer">© {new Date().getFullYear()} JobPortal</footer>
      </div>
    </div>
  );
}
