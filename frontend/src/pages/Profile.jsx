import { useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Avatar } from '../ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [f, setF] = useState({
    name: user.name,
    phone: user.phone || '',
    location: user.location || '',
    headline: user.headline || '',
    bio: user.bio || '',
    company_name: user.company_name || '',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ for: '', type: '', text: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      setUser((await api.put('/auth/me', f)).data);
      setMsg({ for: 'profile', type: 'ok', text: 'Profile saved' });
    } catch (x) { setMsg({ for: 'profile', type: 'error', text: errMsg(x) }); }
  };

  const changePw = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/password', pw);
      setMsg({ for: 'password', type: 'ok', text: 'Password updated' });
      setPw({ currentPassword: '', newPassword: '' });
    } catch (x) { setMsg({ for: 'password', type: 'error', text: errMsg(x) }); }
  };

  const note = (area) =>
    msg.for === area && <p className={msg.type} role={msg.type === 'error' ? 'alert' : 'status'}>{msg.text}</p>;

  return (
    <div className="settings">
      <div className="page-head">
        <div className="who-head">
          <Avatar name={user.name} size={64} round />
          <div>
            <h1>{user.name}</h1>
            <p className="sub">{user.email} &middot; {user.role === 'employer' ? 'Employer account' : 'Job seeker account'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={save}>
        <section className="section">
          <div>
            <h3>About you</h3>
            <p className="help">
              {user.role === 'employer'
                ? 'Shown to candidates alongside your job posts.'
                : 'Employers see this when you apply to their jobs.'}
            </p>
          </div>
          <div className="form">
            {note('profile')}
            <div className="row">
              <label className="field">Name<input value={f.name} onChange={set('name')} /></label>
              <label className="field">Phone<input placeholder="Phone number" value={f.phone} onChange={set('phone')} /></label>
            </div>
            <div className="row">
              <label className="field">Location<input placeholder="City" value={f.location} onChange={set('location')} /></label>
              {user.role === 'employer'
                ? <label className="field">Company name<input placeholder="Company name" value={f.company_name} onChange={set('company_name')} /></label>
                : <label className="field">Headline<input placeholder="e.g. React Developer" value={f.headline} onChange={set('headline')} /></label>}
            </div>
            <label className="field">Bio<textarea rows={4} placeholder="A few lines about you" value={f.bio} onChange={set('bio')} /></label>
            <div><button className="btn">Save profile</button></div>
          </div>
        </section>
      </form>

      <form onSubmit={changePw}>
        <section className="section">
          <div>
            <h3>Password</h3>
            <p className="help">Use at least 6 characters.</p>
          </div>
          <div className="form">
            {note('password')}
            <div className="row">
              <label className="field">Current password
                <input type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
              </label>
              <label className="field">New password
                <input type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
              </label>
            </div>
            <div><button className="btn">Update password</button></div>
          </div>
        </section>
      </form>
    </div>
  );
}
