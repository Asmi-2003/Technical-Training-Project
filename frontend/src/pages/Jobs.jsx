import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Avatar, Icon, JOB_TYPES, Spinner, salary, timeAgo } from '../ui';

const BLANK = { search: '', location: '', type: '', category: '' };

export default function Jobs() {
  const { user } = useAuth();
  // `draft` is what the person is typing; `applied` is what the list is actually filtered by.
  const [draft, setDraft] = useState(BLANK);
  const [applied, setApplied] = useState(BLANK);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ jobs: [], total: 0, pages: 1 });
  const [cats, setCats] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stale = false;
    setLoading(true);
    setFailed(false);
    const params = Object.fromEntries(Object.entries({ ...applied, page }).filter(([, v]) => v));
    api.get('/jobs', { params })
      .then((r) => { if (!stale) setData(r.data); })
      .catch(() => { if (!stale) setFailed(true); })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [applied, page]);

  useEffect(() => {
    api.get('/jobs/categories').then((r) => setCats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.role === 'jobseeker')
      api.get('/saved').then((r) => setSaved(r.data.map((j) => j.id))).catch(() => {});
    else setSaved([]);
  }, [user]);

  const submitSearch = (e) => {
    e.preventDefault();
    setApplied({ ...applied, search: draft.search, location: draft.location });
    setPage(1);
  };
  const pick = (key, value) => {
    const next = { ...applied, [key]: applied[key] === value ? '' : value };
    setApplied(next);
    setDraft({ ...draft, [key]: next[key] });
    setPage(1);
  };
  const clearAll = () => { setDraft(BLANK); setApplied(BLANK); setPage(1); };
  const hasFilters = Object.values(applied).some(Boolean);

  const toggleSave = async (id) => {
    const r = await api.post(`/saved/${id}`);
    setSaved((s) => (r.data.saved ? [...s, id] : s.filter((x) => x !== id)));
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Open roles</h1>
          <p className="sub">
            {loading ? 'Searching…' : `${data.total} job${data.total === 1 ? '' : 's'} ${hasFilters ? 'match your filters' : 'accepting applications'}`}
          </p>
        </div>
      </div>

      <form className="finder" onSubmit={submitSearch} role="search">
        <label className="finder-cell">
          <Icon name="search" />
          <input
            aria-label="Search jobs"
            placeholder="Title, company or keyword"
            value={draft.search}
            onChange={(e) => setDraft({ ...draft, search: e.target.value })}
          />
        </label>
        <label className="finder-cell">
          <Icon name="pin" />
          <input
            aria-label="Location"
            placeholder="City or region"
            value={draft.location}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          />
        </label>
        <button className="btn">Find jobs</button>
      </form>

      <div className="split">
        <aside className="filters" aria-label="Filters">
          <div className="fgroup">
            <h3>Job type</h3>
            <div className="opts">
              {JOB_TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`opt ${applied.type === t ? 'on' : ''}`}
                  aria-pressed={applied.type === t}
                  onClick={() => pick('type', t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {cats.length > 0 && (
            <div className="fgroup">
              <h3>Category</h3>
              <div className="opts">
                {cats.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`opt ${applied.category === c ? 'on' : ''}`}
                    aria-pressed={applied.category === c}
                    onClick={() => pick('category', c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasFilters && (
            <button type="button" className="link" onClick={clearAll}>Clear all filters</button>
          )}
        </aside>

        <section aria-live="polite">
          {loading ? (
            <Spinner label="Finding jobs" />
          ) : failed ? (
            <div className="empty">
              <h3>Couldn’t load jobs</h3>
              <p>Check that the API is running, then reload the page.</p>
            </div>
          ) : data.jobs.length === 0 ? (
            <div className="empty">
              <h3>No jobs match</h3>
              <p>Try a broader keyword, or clear a filter.</p>
            </div>
          ) : (
            <div className="listing">
              {data.jobs.map((j) => {
                const isSaved = saved.includes(j.id);
                return (
                  <article className="jrow" key={j.id}>
                    <Avatar name={j.company} size={48} />
                    <div className="jrow-main">
                      <Link to={`/jobs/${j.id}`}><h3>{j.title}</h3></Link>
                      <div className="meta">
                        <span>{j.company}</span>
                        <span><Icon name="pin" size={14} />{j.location}</span>
                        {j.created_at && <span>{timeAgo(j.created_at)}</span>}
                      </div>
                      <p className="snippet">{j.snippet}…</p>
                      <div className="tags">
                        <span className="tag">{j.job_type}</span>
                        {j.category && <span className="tag neutral">{j.category}</span>}
                      </div>
                    </div>
                    <div className="jrow-side">
                      <span className="salary">{salary(j)}</span>
                      {user?.role === 'jobseeker' && (
                        <button
                          className={`icon-btn save ${isSaved ? 'on' : ''}`}
                          onClick={() => toggleSave(j.id)}
                          aria-pressed={isSaved}
                          aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
                          title={isSaved ? 'Saved' : 'Save for later'}
                        >
                          <Icon name="bookmark" fill={isSaved} />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {data.pages > 1 && (
            <div className="pager">
              <button className="btn small ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {data.pages}</span>
              <button className="btn small" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
