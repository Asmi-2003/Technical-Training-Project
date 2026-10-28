import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Avatar, Icon, Spinner, salary, timeAgo } from '../ui';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    setJob(null);
    api.get(`/jobs/${id}`).then((r) => setJob(r.data)).catch(() => setJob(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === 'jobseeker')
      api.get('/applications/mine').then((r) => setApplied(r.data.some((a) => a.job_id === Number(id))));
  }, [user, id]);

  // Close the drawer with Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const apply = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('cover_letter', cover);
    if (file) fd.append('resume', file);
    setSending(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post(`/applications/${id}`, fd);
      setApplied(true);
      setOpen(false);
      setMsg({ type: 'ok', text: 'Application submitted. You can follow its status on your dashboard.' });
    } catch (x) {
      setMsg({ type: 'error', text: errMsg(x) });
    } finally {
      setSending(false);
    }
  };

  if (job === null) return <Spinner />;
  if (job === false)
    return (
      <div className="empty">
        <h3>Job not found</h3>
        <p>It may have been removed. <Link to="/">Back to all jobs</Link></p>
      </div>
    );

  let action;
  if (!user) action = <Link className="btn sun" to="/login">Log in to apply</Link>;
  else if (user.role === 'employer') action = <span className="note">Employer accounts can’t apply</span>;
  else if (!job.is_active) action = <span className="note bad">Applications are closed</span>;
  else if (applied) action = <span className="applied"><Icon name="check" /> Applied</span>;
  else action = <button className="btn sun" onClick={() => { setMsg({ type: '', text: '' }); setOpen(true); }}>Apply for this role</button>;

  return (
    <>
      <Link to="/" className="back"><Icon name="back" size={16} /> All jobs</Link>

      {msg.type === 'ok' && <p className="banner ok" role="status">{msg.text}</p>}

      <header className="jd-head">
        <Avatar name={job.company} size={72} />
        <div>
          <h1>{job.title}</h1>
          <p className="sub jd-meta"><span>{job.company}</span><span><Icon name="pin" size={15} />{job.location}</span></p>
        </div>
        <div className="jd-action">{action}</div>
      </header>

      <dl className="facts">
        <div><dt>Salary</dt><dd>{salary(job)}</dd></div>
        <div><dt>Job type</dt><dd>{job.job_type}</dd></div>
        {job.category && <div><dt>Category</dt><dd>{job.category}</dd></div>}
        {job.created_at && <div><dt>Posted</dt><dd>{timeAgo(job.created_at)}</dd></div>}
      </dl>

      <article className="jd-body">
        <section>
          <h2>About the role</h2>
          <p className="pre">{job.description}</p>
        </section>
        {job.requirements && (
          <section>
            <h2>What we’re looking for</h2>
            <p className="pre">{job.requirements}</p>
          </section>
        )}
      </article>

      {open && (
        <>
          <div className="scrim" onClick={() => setOpen(false)} />
          <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="apply-title">
            <div className="drawer-head">
              <div>
                <h2 id="apply-title">Apply to {job.company}</h2>
                <p className="sub">{job.title}</p>
              </div>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><Icon name="close" /></button>
            </div>
            <form className="form" onSubmit={apply}>
              {msg.type === 'error' && <p className="error" role="alert">{msg.text}</p>}
              <label className="field">Cover letter <span className="hint">Optional</span>
                <textarea rows={7} placeholder="Tell them why you’re a good fit" value={cover} onChange={(e) => setCover(e.target.value)} autoFocus />
              </label>
              <label className="field">Resume <span className="hint">PDF, DOC or DOCX, up to 5 MB</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
              </label>
              <button className="btn sun block" disabled={sending}>{sending ? 'Sending…' : 'Submit application'}</button>
            </form>
          </aside>
        </>
      )}
    </>
  );
}
