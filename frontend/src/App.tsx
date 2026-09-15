import { useEffect, useState } from 'react';
import './App.css';

type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

type Job = {
  id: string;
  title: string;
  type: string;
  status: JobStatus;
  createdAt: string;
};

const API_URL = `${import.meta.env.VITE_API_URL}/jobs`;

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [filter, setFilter] = useState<'all' | JobStatus>('all');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data: Job[] = await response.json();
      setJobs(data);
    } catch {
      setError('Unable to load jobs. Please check the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const createJob = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !type.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          type: type.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create job');
      }

      const newJob: Job = await response.json();

      setJobs((currentJobs) => [newJob, ...currentJobs]);
      setTitle('');
      setType('');
    } catch {
      setError('Unable to create job.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: JobStatus) => {
    try {
      setError('');

      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const updatedJob: Job = await response.json();

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === updatedJob.id ? updatedJob : job,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to update job status.',
      );
    }
  };

  const deleteJob = async (id: string) => {
    const confirmed = window.confirm('Delete this job?');

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      setJobs((currentJobs) =>
        currentJobs.filter((job) => job.id !== id),
      );
    } catch {
      setError('Unable to delete job.');
    }
  };

  const getNextStatus = (status: JobStatus): JobStatus | null => {
    if (status === 'pending') {
      return 'running';
    }

    if (status === 'running') {
      return 'completed';
    }

    return null;
  };

  const filteredJobs =
    filter === 'all'
      ? jobs
      : jobs.filter((job) => job.status === filter);

  const countByStatus = (status: JobStatus) =>
    jobs.filter((job) => job.status === status).length;

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Airth Internship Assignment</p>
          <h1>Job Queue Dashboard</h1>
          <p className="subtitle">
            Create, monitor and manage your background jobs.
          </p>
        </div>

        <button className="refresh-button" onClick={fetchJobs}>
          Refresh
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Jobs</span>
          <strong>{jobs.length}</strong>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>{countByStatus('pending')}</strong>
        </div>

        <div className="stat-card">
          <span>Running</span>
          <strong>{countByStatus('running')}</strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>{countByStatus('completed')}</strong>
        </div>

        <div className="stat-card">
          <span>Failed</span>
          <strong>{countByStatus('failed')}</strong>
        </div>
      </section>

      <section className="panel">
        <h2>Create New Job</h2>

        <form className="job-form" onSubmit={createJob}>
          <input
            type="text"
            placeholder="Job title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <input
            type="text"
            placeholder="Job type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Job'}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Jobs</h2>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as 'all' | JobStatus)
            }
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}

        {loading && <p>Loading jobs...</p>}

        {!loading && filteredJobs.length === 0 && (
          <p className="empty-message">No jobs found.</p>
        )}

        <div className="jobs-list">
          {filteredJobs.map((job) => {
            const nextStatus = getNextStatus(job.status);

            return (
              <article className="job-card" key={job.id}>
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <p>Type: {job.type}</p>
                  <small>
                    Created: {new Date(job.createdAt).toLocaleString()}
                  </small>
                </div>

                <div className="job-actions">
                  <span className={`status ${job.status}`}>
                    {job.status}
                  </span>

                  {nextStatus && (
                    <button
                      className="secondary-button"
                      onClick={() => updateStatus(job.id, nextStatus)}
                    >
                      Mark {nextStatus}
                    </button>
                  )}

                  {job.status === 'running' && (
                    <button
                      className="secondary-button"
                      onClick={() => updateStatus(job.id, 'failed')}
                    >
                      Mark failed
                    </button>
                  )}

                  <button
                    className="delete-button"
                    onClick={() => deleteJob(job.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default App;