import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { JOB_TYPES } from '../ui';

const empty = {
  title: '', company: '', location: '', job_type: 'Full-time', category: '',
  salary_min: '', salary_max: '', description: '', requirements: '', is_active: true,
};

export default function PostJob() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ ...empty, company: user?.company_name || '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (id) api.get(`/jobs/${id}`).then((r) => setF({ ...empty, ...r.data, is_active: !!r.data.is_active }));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (id) await api.put(`/jobs/${id}`, f); else await api.post('/jobs', f);
      nav('/dashboard');
    } catch (x) { setErr(errMsg(x)); }
  };

  return (
    <form onSubmit={submit} className="settings">
      <div className="page-head">
        <div>
          <h1>{id ? 'Edit job' : 'Post a job'}</h1>
          <p className="sub">Clear details bring in better applicants.</p>
        </div>
      </div>
      {err && <p className="error" role="alert">{err}</p>}

      <section className="section">
        <div>
          <h3>The role</h3>
          <p className="help">What the job is called and where it is.</p>
        </div>
        <div className="form">
          <label className="field">Job title<input placeholder="e.g. Frontend Developer" required value={f.title} onChange={set('title')} /></label>
          <div className="row">
            <label className="field">Company<input placeholder="Company" required value={f.company} onChange={set('company')} /></label>
            <label className="field">Location<input placeholder="City or “Remote”" required value={f.location} onChange={set('location')} /></label>
          </div>
          <div className="row">
            <label className="field">Job type
              <select value={f.job_type} onChange={set('job_type')}>
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="field">Category<input placeholder="e.g. IT, Marketing" value={f.category || ''} onChange={set('category')} /></label>
          </div>
        </div>
      </section>

      <section className="section">
        <div>
          <h3>Pay</h3>
          <p className="help">Monthly or yearly, as long as you’re consistent. Leave blank to hide it.</p>
        </div>
        <div className="row">
          <label className="field">Minimum (₹)<input type="number" min="0" placeholder="Minimum" value={f.salary_min || ''} onChange={set('salary_min')} /></label>
          <label className="field">Maximum (₹)<input type="number" min="0" placeholder="Maximum" value={f.salary_max || ''} onChange={set('salary_max')} /></label>
        </div>
      </section>

      <section className="section">
        <div>
          <h3>Details</h3>
          <p className="help">Describe the work, then list what you need from candidates.</p>
        </div>
        <div className="form">
          <label className="field">Description<textarea rows={7} placeholder="What will this person do?" required value={f.description} onChange={set('description')} /></label>
          <label className="field">Requirements<textarea rows={5} placeholder="Skills, experience, qualifications" value={f.requirements || ''} onChange={set('requirements')} /></label>
        </div>
      </section>

      <section className="section">
        <div>
          <h3>Visibility</h3>
          <p className="help">Closed jobs stay in your dashboard but leave the public list.</p>
        </div>
        <label className="check">
          <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />
          Accepting applications
        </label>
      </section>

      <div className="actionbar">
        <Link className="btn ghost" to="/dashboard">Cancel</Link>
        <button className="btn sun">{id ? 'Save changes' : 'Publish job'}</button>
      </div>
    </form>
  );
}
