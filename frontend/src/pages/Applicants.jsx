import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { FILE_URL, errMsg } from '../api';
import { Avatar, Icon, STATUSES, Spinner, StatusChip } from '../ui';

export default function Applicants() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get(`/applications/job/${id}`).then((r) => setData(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const setStatus = async (appId, status) => {
    setError('');
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      await load();
    } catch (x) { setError(errMsg(x)); }
  };

  if (!data) return <Spinner />;

  const list = data.applicants;
  const current = list.find((a) => a.id === selected) || list[0];

  return (
    <>
      <Link to="/dashboard" className="back"><Icon name="back" size={16} /> Dashboard</Link>
      <div className="page-head">
        <div>
          <h1>Applicants</h1>
          <p className="sub">{data.job.title}: {list.length} applicant{list.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <h3>No applications yet</h3>
          <p>Applicants will appear here as soon as someone applies.</p>
        </div>
      ) : (
        <div className="mdetail">
          <ul className="picker" aria-label="Applicants">
            {list.map((a) => (
              <li key={a.id}>
                <button
                  className={a.id === current.id ? 'on' : ''}
                  aria-current={a.id === current.id}
                  onClick={() => setSelected(a.id)}
                >
                  <Avatar name={a.name} size={38} round />
                  <span className="pk-text">
                    <b>{a.name}</b>
                    <small>{a.headline || a.email}</small>
                  </span>
                  <StatusChip status={a.status} />
                </button>
              </li>
            ))}
          </ul>

          <section className="sheet profile-pane" aria-live="polite">
            <header className="pp-head">
              <Avatar name={current.name} size={64} round />
              <div>
                <h2>{current.name}</h2>
                <p className="sub">{current.headline || 'No headline added'}{current.location ? `, ${current.location}` : ''}</p>
              </div>
            </header>

            <div className="contact">
              <a href={`mailto:${current.email}`}><Icon name="mail" size={16} /> {current.email}</a>
              {current.phone && <a href={`tel:${current.phone}`}><Icon name="phone" size={16} /> {current.phone}</a>}
              {current.resume_path && (
                <a className="btn small ghost" href={FILE_URL + current.resume_path} target="_blank" rel="noreferrer">
                  <Icon name="file" size={16} /> View resume
                </a>
              )}
            </div>

            <h3>Cover letter</h3>
            {current.cover_letter
              ? <p className="pre letter">{current.cover_letter}</p>
              : <p className="muted">No cover letter was included.</p>}

            <h3>Application status</h3>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="segs" role="group" aria-label="Application status">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={`st-${s} ${current.status === s ? 'on' : ''}`}
                  aria-pressed={current.status === s}
                  onClick={() => current.status !== s && setStatus(current.id, s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
