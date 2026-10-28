import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try { await login(f.email, f.password); nav('/dashboard'); }
    catch (x) { setErr(errMsg(x)); }
  };

  return (
    <div className="auth">
      <h1>Log in</h1>
      <p className="sub">Pick up where you left off: applications, saved jobs and your job posts.</p>
      <form className="sheet form" onSubmit={submit}>
        {err && <p className="error" role="alert">{err}</p>}
        <label className="field">Email
          <input type="email" placeholder="you@example.com" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </label>
        <label className="field">Password
          <input type="password" placeholder="Your password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </label>
        <button className="btn block">Log in</button>
      </form>
      <p className="alt">New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'jobseeker', company_name: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { await register(f); nav('/dashboard'); }
    catch (x) { setErr(errMsg(x)); }
  };

  return (
    <div className="auth">
      <h1>Create your account</h1>
      <p className="sub">
        {f.role === 'employer'
          ? 'Post jobs, review applicants and move them through your hiring stages.'
          : 'Apply with a cover letter and resume, save jobs, and track every application.'}
      </p>
      <form className="sheet form" onSubmit={submit}>
        {err && <p className="error" role="alert">{err}</p>}

        <fieldset className="role-pick">
          <legend>I am</legend>
          <button type="button" className={f.role === 'jobseeker' ? 'on' : ''} aria-pressed={f.role === 'jobseeker'} onClick={() => setF({ ...f, role: 'jobseeker' })}>
            <b>Looking for a job</b>
            <span>Search, apply and track</span>
          </button>
          <button type="button" className={f.role === 'employer' ? 'on' : ''} aria-pressed={f.role === 'employer'} onClick={() => setF({ ...f, role: 'employer' })}>
            <b>Hiring</b>
            <span>Post jobs and review applicants</span>
          </button>
        </fieldset>

        <label className="field">Full name
          <input placeholder="Full name" required autoComplete="name" value={f.name} onChange={set('name')} />
        </label>
        {f.role === 'employer' && (
          <label className="field">Company name
            <input placeholder="Company name" autoComplete="organization" value={f.company_name} onChange={set('company_name')} />
          </label>
        )}
        <label className="field">Email
          <input type="email" placeholder="you@example.com" required autoComplete="email" value={f.email} onChange={set('email')} />
        </label>
        <label className="field">Password <span className="hint">At least 6 characters</span>
          <input type="password" placeholder="Choose a password" required minLength={6} autoComplete="new-password" value={f.password} onChange={set('password')} />
        </label>
        <button className="btn block">Create account</button>
      </form>
      <p className="alt">Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
