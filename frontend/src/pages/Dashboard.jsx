import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Avatar, Icon, STATUSES, Spinner } from '../ui';

function SeekerView() {
  const [apps, setApps] = useState(null);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    api.get('/applications/mine').then((r) => setApps(r.data)).catch(() => setApps([]));
    api.get('/saved').then((r) => setSaved(r.data)).catch(() => {});
  }, []);
  const unsave = async (id) => {
    await api.post(`/saved/${id}`);
    setSaved((s) => s.filter((j) => j.id !== id));
  };

  if (apps === null) return <Spinner />;
  const progressed = apps.filter((a) => ['Shortlisted', 'Hired'].includes(a.status)).length;

  return (
    <>
      <p className="tally">
        You’ve applied to <b>{apps.length}</b> job{apps.length === 1 ? '' : 's'}.{' '}
        <b>{progressed}</b> {progressed === 1 ? 'is' : 'are'} shortlisted or hired, and <b>{saved.length}</b> {saved.length === 1 ? 'is' : 'are'} saved for later.
      </p>

      <h2 className="block-title">Application progress</h2>
      {apps.length === 0 ? (
        <div className="empty">
          <h3>No applications yet</h3>
          <p>Find a role you like and apply. <Link to="/">Browse jobs</Link></p>
        </div>
      ) : (
        <div className="board">
          {STATUSES.map((s) => {
            const items = apps.filter((a) => a.status === s);
            return (
              <section className={`lane st-${s}`} key={s} aria-label={`${s} applications`}>
                <header><h3>{s}</h3><span>{items.length}</span></header>
                {items.length === 0 && <p className="lane-empty">Nothing here</p>}
                {items.map((a) => (
                  <article className="tile" key={a.id}>
                    <Link to={`/jobs/${a.job_id}`}>{a.title}</Link>
                    <p>{a.company}</p>
                    <small>Applied {new Date(a.created_at).toLocaleDateString()}</small>
                  </article>
                ))}
              </section>
            );
          })}
        </div>
      )}

      <h2 className="block-title">Saved for later</h2>
      {saved.length === 0 ? (
        <p className="muted">Jobs you save with the bookmark icon will show up here.</p>
      ) : (
        <div className="listing">
          {saved.map((j) => (
            <div className="lrow" key={j.id}>
              <Avatar name={j.company} size={40} />
              <div className="lrow-main">
                <Link to={`/jobs/${j.id}`}><b>{j.title}</b></Link>
                <span className="muted">{j.company}, {j.location}</span>
              </div>
              <button className="link danger" onClick={() => unsave(j.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function EmployerView() {
  const [jobs, setJobs] = useState(null);
  const load = () => api.get('/jobs/employer/mine').then((r) => setJobs(r.data)).catch(() => setJobs([]));
  useEffect(() => { load(); }, []);
  const del = async (id) => {
    if (confirm('Delete this job and all its applications?')) { await api.delete(`/jobs/${id}`); load(); }
  };

  if (jobs === null) return <Spinner />;
  const open = jobs.filter((j) => j.is_active).length;
  const totalApplicants = jobs.reduce((n, j) => n + Number(j.applicants || 0), 0);

  return (
    <>
      <p className="tally">
        You have <b>{jobs.length}</b> job post{jobs.length === 1 ? '' : 's'}, <b>{open}</b> open for applications,
        with <b>{totalApplicants}</b> applicant{totalApplicants === 1 ? '' : 's'} in total.
      </p>

      <div className="between">
        <h2 className="block-title">Your job posts</h2>
        <Link className="btn small sun" to="/post-job"><Icon name="plus" size={16} /> Post a job</Link>
      </div>

      {jobs.length === 0 ? (
        <div className="empty">
          <h3>No jobs posted yet</h3>
          <p>Post your first job to start receiving applications.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Role</th><th>Applicants</th><th>Status</th><th><span className="sr">Actions</span></th></tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <Link to={`/jobs/${j.id}`}><b>{j.title}</b></Link>
                    <div className="muted">{j.company}, {j.location}</div>
                  </td>
                  <td>
                    <Link className="count" to={`/jobs/${j.id}/applicants`}><Icon name="users" size={16} /> {j.applicants}</Link>
                  </td>
                  <td><span className={`chip ${j.is_active ? 'st-Hired-soft' : 'st-Closed'}`}>{j.is_active ? 'Open' : 'Closed'}</span></td>
                  <td>
                    <div className="actions">
                      <Link to={`/jobs/${j.id}/applicants`}>Applicants</Link>
                      <Link to={`/edit-job/${j.id}`}>Edit</Link>
                      <button className="link danger" onClick={() => del(j.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hello, {user.name.split(' ')[0]}</h1>
          <p className="sub">{user.role === 'employer' ? 'Your hiring at a glance.' : 'Where your applications stand.'}</p>
        </div>
        <Link className="btn small ghost" to="/profile"><Icon name="user" size={16} /> Edit profile</Link>
      </div>
      {user.role === 'employer' ? <EmployerView /> : <SeekerView />}
    </>
  );
}
