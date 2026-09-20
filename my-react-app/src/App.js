import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { api } from './services/api';

const defaultProjects = [
  { id: 'proj_1', name: 'Atlas design system', meta: '12 tasks · 4 collaborators', progress: 72, color: 'coral', initials: 'AD' },
  { id: 'proj_2', name: 'Revenue intelligence', meta: '8 tasks · 3 collaborators', progress: 48, color: 'blue', initials: 'RI' },
  { id: 'proj_3', name: 'Growth experiments', meta: '16 tasks · 6 collaborators', progress: 89, color: 'green', initials: 'GE' },
];

const defaultTasks = [
  { id: 'tsk_1', title: 'Audit authentication flow', project: 'Atlas design system', due: 'Today', priority: 'High', tag: 'Engineering', status: 'todo', done: false },
  { id: 'tsk_2', title: 'Review component API proposal', project: 'Atlas design system', due: 'Today', priority: 'Medium', tag: 'Review', status: 'todo', done: false },
  { id: 'tsk_3', title: 'Ship billing dashboard v2', project: 'Revenue intelligence', due: 'Tomorrow', priority: 'High', tag: 'Engineering', status: 'in-progress', done: false },
  { id: 'tsk_4', title: 'Update onboarding copy', project: 'Growth experiments', due: 'Sep 02', priority: 'Low', tag: 'Content', status: 'done', done: true },
];

function ProgressBar({ value = 0, color = 'coral' }) {
  return (
    <div className="progress-track" aria-label={`${value}% complete`}>
      <span className={`progress-fill ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function ProjectCard({ project, onDelete }) {
  return (
    <article className="project-card">
      <div className="project-card-top">
        <span className={`project-mark ${project.color || 'blue'}`}>{project.initials || 'PR'}</span>
        {onDelete && (
          <button 
            className="delete-card-btn" 
            title="Delete project"
            onClick={(e) => { e.stopPropagation(); onDelete(project.id || project._id); }}
          >
            ✕
          </button>
        )}
      </div>
      <h3>{project.name}</h3>
      <p>{project.meta || `${project.description || 'Active project'}`}</p>
      <div className="project-progress">
        <span>Progress</span>
        <strong>{project.progress || 0}%</strong>
      </div>
      <ProgressBar value={project.progress || 0} color={project.color || 'blue'} />
    </article>
  );
}

function App() {
  // State
  const [tasks, setTasks] = useState(defaultTasks);
  const [projects, setProjects] = useState(defaultProjects);
  const [stats, setStats] = useState({ total: 4, completed: 1, inProgress: 1, todo: 2, projectsOnTrack: 3, focusTime: '4h 32m' });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All tasks');
  const [activeProjectFilter, setActiveProjectFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState({ name: 'Anubhav Yadav', email: 'anubhav@innovationhacks.in', avatar: 'AY', role: 'Lead' });

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Form states
  const [newTask, setNewTask] = useState({
    title: '',
    project: 'Atlas design system',
    priority: 'Medium',
    tag: 'Engineering',
    due: 'Today',
    description: ''
  });

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: 'coral',
    collaborators: 2
  });

  const [authForm, setAuthForm] = useState({
    isRegister: false,
    name: '',
    email: '',
    password: ''
  });

  // AI Assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTargetProject, setAiTargetProject] = useState('Atlas design system');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiMode, setAiMode] = useState('tasks'); // 'tasks' | 'summary' | 'scope'

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch initial data from backend API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedTasks, fetchedProjects, fetchedStats] = await Promise.all([
        api.tasks.getAll().catch(() => null),
        api.projects.getAll().catch(() => null),
        api.tasks.getStats().catch(() => null)
      ]);

      if (fetchedTasks && fetchedTasks.length > 0) setTasks(fetchedTasks);
      if (fetchedProjects && fetchedProjects.length > 0) setProjects(fetchedProjects);
      if (fetchedStats) setStats(fetchedStats);
    } catch (err) {
      console.warn('Using local fallback dataset:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const storedUser = api.auth.getCurrentUser();
    if (storedUser) setCurrentUser(storedUser);
  }, [fetchData]);

  // Task Handlers
  const handleToggleTask = async (task) => {
    const taskId = task.id || task._id;
    const newDone = !task.done;
    const newStatus = newDone ? 'done' : 'todo';

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId || t._id === taskId ? { ...t, done: newDone, status: newStatus } : t))
    );

    try {
      await api.tasks.update(taskId, { done: newDone, status: newStatus });
      fetchData();
    } catch (err) {
      console.warn('Backend sync error:', err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const created = await api.tasks.create(newTask);
      setTasks((prev) => [created, ...prev]);
      setIsTaskModalOpen(false);
      setNewTask({ title: '', project: projects[0]?.name || 'Atlas design system', priority: 'Medium', tag: 'Engineering', due: 'Today', description: '' });
      showToast('Task created successfully! 🎉');
      fetchData();
    } catch (err) {
      // Local fallback
      const localTask = {
        id: `tsk_${Date.now()}`,
        ...newTask,
        status: 'todo',
        done: false,
        assignee: currentUser.name,
        assigneeAvatar: currentUser.avatar
      };
      setTasks((prev) => [localTask, ...prev]);
      setIsTaskModalOpen(false);
      showToast('Task created (Local cache) 🎉');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.tasks.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId && t._id !== taskId));
      showToast('Task removed');
      fetchData();
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId && t._id !== taskId));
      showToast('Task removed (Local)');
    }
  };

  // Project Handlers
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    try {
      const created = await api.projects.create(newProject);
      setProjects((prev) => [...prev, created]);
      setIsProjectModalOpen(false);
      setNewProject({ name: '', description: '', color: 'coral', collaborators: 2 });
      showToast('Project created successfully! 🚀');
      fetchData();
    } catch (err) {
      const initials = newProject.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'PR';
      const localProj = {
        id: `proj_${Date.now()}`,
        ...newProject,
        progress: 0,
        meta: `0 tasks · ${newProject.collaborators} collaborators`,
        initials
      };
      setProjects((prev) => [...prev, localProj]);
      setIsProjectModalOpen(false);
      showToast('Project created (Local cache) 🚀');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project and its tasks?')) return;
    try {
      await api.projects.delete(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId && p._id !== projectId));
      showToast('Project deleted');
      fetchData();
    } catch (err) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId && p._id !== projectId));
      showToast('Project deleted (Local)');
    }
  };

  // AI Generation Handlers
  const handleAIGenerateTasks = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResults(null);
    try {
      const res = await api.ai.generateTasks(aiPrompt, aiTargetProject, false);
      setAiResults(res.data || []);
      showToast(`Generated ${res.data?.length || 4} AI tasks!`);
    } catch (err) {
      showToast('Error generating AI tasks', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAITasks = async () => {
    if (!aiResults || aiResults.length === 0) return;
    try {
      for (const t of aiResults) {
        await api.tasks.create({
          title: t.title,
          description: t.description || '',
          project: aiTargetProject,
          priority: t.priority || 'Medium',
          tag: t.tag || 'Engineering',
          due: t.due || 'Tomorrow',
          aiGenerated: true
        });
      }
      setIsAIModalOpen(false);
      setAiResults(null);
      setAiPrompt('');
      showToast(`Added ${aiResults.length} tasks to ${aiTargetProject}! ✨`);
      fetchData();
    } catch (err) {
      // Fallback
      const newItems = aiResults.map((t, idx) => ({
        id: `ai_${Date.now()}_${idx}`,
        ...t,
        project: aiTargetProject,
        status: 'todo',
        done: false,
        assignee: currentUser.name,
        assigneeAvatar: currentUser.avatar
      }));
      setTasks((prev) => [...newItems, ...prev]);
      setIsAIModalOpen(false);
      setAiResults(null);
      showToast(`Added ${aiResults.length} AI tasks (Local)! ✨`);
    }
  };

  const handleAISummarize = async () => {
    setAiLoading(true);
    setAiSummary(null);
    try {
      const res = await api.ai.summarize();
      setAiSummary(res);
    } catch (err) {
      showToast('Error summarizing workload', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Auth Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authForm.isRegister) {
        const res = await api.auth.register(authForm.name, authForm.email, authForm.password);
        setCurrentUser(res.user);
        showToast(`Welcome aboard, ${res.user.name}!`);
      } else {
        const res = await api.auth.login(authForm.email, authForm.password);
        setCurrentUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`);
      }
      setIsAuthModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser({ name: 'Guest User', email: 'guest@innovationhacks.in', avatar: 'GU', role: 'Guest' });
    showToast('Logged out successfully');
  };

  // Computed Values
  const completedCount = tasks.filter((t) => t.done || t.status === 'done').length;
  const filteredTasks = tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.project} ${task.tag} ${task.priority}`.toLowerCase().includes(query.toLowerCase());
    const matchesTab =
      filter === 'All tasks' ||
      (filter === 'My tasks' && !task.done) ||
      (filter === 'In Progress' && task.status === 'in-progress' && !task.done) ||
      (filter === 'Completed' && (task.done || task.status === 'done'));
    const matchesProj = activeProjectFilter === 'All' || task.project === activeProjectFilter;
    return matchesQuery && matchesTab && matchesProj;
  });

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-banner ${toast.type}`}>
          <span>{toast.type === 'error' ? '⚠️' : '✓'}</span>
          {toast.message}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">IH</span>
          <span>innovation hacks</span>
        </div>

        <div className="workspace-switcher">
          <span className="workspace-dot">✦</span>
          <span>
            <small>Full Stack Platform</small>
            <strong>Productivity OS</strong>
          </span>
          <span className="chevron">⌄</span>
        </div>

        <nav aria-label="Main navigation">
          <button 
            className={`nav-item ${activeProjectFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveProjectFilter('All')}
          >
            <span className="nav-icon">◈</span>Overview
          </button>
          <button 
            className={`nav-item ${filter === 'My tasks' ? 'active' : ''}`}
            onClick={() => setFilter('My tasks')}
          >
            <span className="nav-icon">✓</span>My tasks 
            <span className="nav-count">{tasks.filter((t) => !t.done).length}</span>
          </button>
          <button 
            className="nav-item ai-nav-highlight"
            onClick={() => { setIsAIModalOpen(true); setAiMode('tasks'); }}
          >
            <span className="nav-icon">✦</span>AI Assistant
            <span className="ai-tag">PRO</span>
          </button>
        </nav>

        <div className="sidebar-label">Projects Filter</div>
        <nav aria-label="Project navigation" className="project-nav-list">
          {projects.map((p) => (
            <button
              key={p.id || p._id || p.name}
              className={`nav-item ${activeProjectFilter === p.name ? 'active' : ''}`}
              onClick={() => setActiveProjectFilter(p.name)}
            >
              <span className={`project-dot ${p.color || 'blue'}`} />
              <span className="project-nav-name">{p.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="pro-badge">✦</div>
          <div>
            <strong>Innovation FullStack</strong>
            <small>Tasks 1 · 2 · 3 · 4 Live</small>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" id="overview">
        {/* Top Header */}
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation">☰</button>
          <div className="breadcrumb">
            Innovation Hacks <span>/</span> Full Stack Dashboard <span>/</span> {activeProjectFilter}
          </div>

          <div className="topbar-actions">
            <button 
              className="ai-action-btn"
              onClick={() => { setIsAIModalOpen(true); setAiMode('tasks'); }}
              title="Launch AI Sprint Assistant"
            >
              <span className="sparkle">✦</span> AI Assistant
            </button>

            <button 
              className="ai-action-btn summary-btn"
              onClick={() => { setIsAIModalOpen(true); setAiMode('summary'); handleAISummarize(); }}
              title="AI Daily Briefing"
            >
              <span>📊</span> AI Briefing
            </button>

            <div className="user-profile-widget" onClick={() => setIsAuthModalOpen(true)}>
              <div className="avatar">{currentUser.avatar || 'AY'}</div>
              <span className="profile-name">{currentUser.name}</span>
              <span className="chevron">⌄</span>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="content-wrap">
          {/* Hero Welcome Banner */}
          <section className="welcome-row">
            <div>
              <p className="eyebrow">Innovation Hacks • Full Stack Platform</p>
              <h1>Good morning, {currentUser.name.split(' ')[0]} <span>✦</span></h1>
              <p className="subheading">
                {activeProjectFilter === 'All' 
                  ? 'Real-time overview of tasks, sprint velocity, and AI-accelerated workflows.' 
                  : `Filtering active workload for project: ${activeProjectFilter}`}
              </p>
            </div>
            <div className="hero-buttons">
              <button className="secondary-button" onClick={() => setIsProjectModalOpen(true)}>
                <span>+</span> New Project
              </button>
              <button className="primary-button" onClick={() => setIsTaskModalOpen(true)}>
                <span>+</span> New Task
              </button>
            </div>
          </section>

          {/* KPI Stats Overview */}
          <section className="stats-grid" aria-label="Workspace summary">
            <div className="stat-card">
              <div className="stat-icon coral-bg">✓</div>
              <div>
                <span>Tasks completed</span>
                <strong>{completedCount} <small>/ {tasks.length}</small></strong>
                <em className="positive">
                  {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}% completion
                </em>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue-bg">◷</div>
              <div>
                <span>Focus time</span>
                <strong>{stats.focusTime || '4h 32m'}</strong>
                <em className="positive">+12% vs last sprint</em>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green-bg">↗</div>
              <div>
                <span>Projects on track</span>
                <strong>{projects.filter((p) => (p.progress || 0) >= 50).length} <small>/ {projects.length}</small></strong>
                <em className="neutral">
                  {projects.length > 0 ? Math.round((projects.filter((p) => (p.progress || 0) >= 50).length / projects.length) * 100) : 100}% on schedule
                </em>
              </div>
            </div>

            <div className="stat-card ai-stat-card" onClick={() => { setIsAIModalOpen(true); setAiMode('tasks'); }}>
              <div className="stat-icon purple-bg">✦</div>
              <div>
                <span>AI Productivity</span>
                <strong>Active Engine</strong>
                <em className="positive">Auto Task Generator</em>
              </div>
            </div>
          </section>

          {/* Active Projects Grid */}
          <section className="section-block" id="projects">
            <div className="section-heading">
              <div>
                <h2>Active Projects</h2>
                <p>Track delivery progress and team bandwidth.</p>
              </div>
              <div className="section-heading-actions">
                {activeProjectFilter !== 'All' && (
                  <button className="clear-filter-btn" onClick={() => setActiveProjectFilter('All')}>
                    Reset Filter (Showing: {activeProjectFilter}) ✕
                  </button>
                )}
                <button className="text-button" onClick={() => setIsProjectModalOpen(true)}>
                  + Add Project
                </button>
              </div>
            </div>

            <div className="project-grid">
              {projects.map((project) => (
                <div 
                  key={project.id || project._id || project.name}
                  onClick={() => setActiveProjectFilter(project.name)}
                  className={`project-card-wrapper ${activeProjectFilter === project.name ? 'is-selected' : ''}`}
                >
                  <ProjectCard 
                    project={project} 
                    onDelete={handleDeleteProject}
                  />
                </div>
              ))}
              <button className="add-project" onClick={() => setIsProjectModalOpen(true)}>
                <span>+</span>
                <strong>Start a new project</strong>
                <small>Create & persist in database</small>
              </button>
            </div>
          </section>

          {/* Tasks Management Section */}
          <section className="section-block task-section" id="my-tasks">
            <div className="section-heading">
              <div>
                <h2>Task Management</h2>
                <p>Interactive CRUD operations synchronized with REST backend.</p>
              </div>
              <div className="heading-btn-group">
                <button 
                  className="secondary-button-sm"
                  onClick={() => { setIsAIModalOpen(true); setAiMode('tasks'); }}
                >
                  <span>✦</span> Generate with AI
                </button>
                <button 
                  className="primary-button-sm"
                  onClick={() => setIsTaskModalOpen(true)}
                >
                  + Add Task
                </button>
              </div>
            </div>

            {/* Task Filters & Search Bar */}
            <div className="task-toolbar">
              <div className="filter-tabs">
                {['All tasks', 'My tasks', 'In Progress', 'Completed'].map((tab) => (
                  <button
                    key={tab}
                    className={filter === tab ? 'selected' : ''}
                    onClick={() => setFilter(tab)}
                  >
                    {tab}
                    {tab === 'All tasks' && <small>{tasks.length}</small>}
                    {tab === 'In Progress' && (
                      <small>{tasks.filter((t) => t.status === 'in-progress' && !t.done).length}</small>
                    )}
                    {tab === 'Completed' && (
                      <small>{tasks.filter((t) => t.done || t.status === 'done').length}</small>
                    )}
                  </button>
                ))}
              </div>

              <label className="search-box">
                <span>⌕</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tasks, tags, projects..."
                  aria-label="Search tasks"
                />
              </label>
            </div>

            {/* Task List */}
            <div className="task-list">
              {loading && <div className="loading-indicator">Syncing tasks with database...</div>}

              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const isDone = task.done || task.status === 'done';
                  const taskId = task.id || task._id;

                  return (
                    <div className={`task-row ${isDone ? 'is-done' : ''}`} key={taskId}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleToggleTask(task)}
                        aria-label={`Mark ${task.title} complete`}
                      />

                      <div className="task-copy">
                        <div className="task-title-line">
                          <strong>{task.title}</strong>
                          {task.aiGenerated && <span className="ai-badge" title="Generated by AI Assistant">✦ AI</span>}
                        </div>
                        <span className="task-project-label">{task.project}</span>
                        {task.description && <small className="task-desc-preview">{task.description}</small>}
                      </div>

                      <span className={`task-tag ${(task.tag || 'engineering').toLowerCase()}`}>
                        {task.tag || 'Engineering'}
                      </span>

                      <span className={`priority ${(task.priority || 'medium').toLowerCase()}`}>
                        <i />
                        {task.priority || 'Medium'}
                      </span>

                      <span className="due-date">{task.due || 'Today'}</span>
                      <span className="task-avatar">{task.assigneeAvatar || 'AY'}</span>

                      <button
                        className="row-delete"
                        title="Delete task"
                        onClick={() => handleDeleteTask(taskId)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <span>⌕</span>
                  <strong>No tasks found</strong>
                  <p>Try a different filter or generate tasks using the AI assistant.</p>
                  <button 
                    className="primary-button-sm"
                    onClick={() => { setIsAIModalOpen(true); setAiMode('tasks'); }}
                  >
                    ✦ Auto-Generate Tasks with AI
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* MODAL: Create Task */}
      {isTaskModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTaskModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="close-btn" onClick={() => setIsTaskModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  required
                  placeholder="e.g. Implement user authentication middleware"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Project</label>
                  <select
                    value={newTask.project}
                    onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  >
                    {projects.map((p) => (
                      <option key={p.id || p._id || p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tag</label>
                  <input
                    placeholder="e.g. Engineering, Security, UI"
                    value={newTask.tag}
                    onChange={(e) => setNewTask({ ...newTask, tag: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    placeholder="e.g. Today, Tomorrow, Sep 25"
                    value={newTask.due}
                    onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Additional context, acceptance criteria, or links..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setIsTaskModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Project */}
      {isProjectModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsProjectModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button className="close-btn" onClick={() => setIsProjectModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  required
                  placeholder="e.g. Mobile App Redesign"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Project Scope / Description</label>
                <textarea
                  rows="2"
                  placeholder="Summary of objectives and deliverables..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Color Theme</label>
                  <select
                    value={newProject.color}
                    onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                  >
                    <option value="coral">Coral Orange</option>
                    <option value="blue">Electric Blue</option>
                    <option value="green">Emerald Green</option>
                    <option value="purple">Royal Purple</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Collaborators</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newProject.collaborators}
                    onChange={(e) => setNewProject({ ...newProject, collaborators: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setIsProjectModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AI Sprint & Task Assistant */}
      {isAIModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAIModalOpen(false)}>
          <div className="modal-card ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="ai-title-header">
                <span className="ai-icon">✦</span>
                <div>
                  <h3>AI Sprint & Task Assistant</h3>
                  <p>Decompose goals, generate subtasks, and analyze productivity bottlenecks.</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsAIModalOpen(false)}>✕</button>
            </div>

            {/* AI Mode Tabs */}
            <div className="ai-tab-switch">
              <button 
                className={aiMode === 'tasks' ? 'active' : ''}
                onClick={() => setAiMode('tasks')}
              >
                ✦ Task Generator
              </button>
              <button 
                className={aiMode === 'summary' ? 'active' : ''}
                onClick={() => { setAiMode('summary'); handleAISummarize(); }}
              >
                📊 Workload Briefing
              </button>
            </div>

            {aiMode === 'tasks' ? (
              <div className="ai-body">
                <div className="form-group">
                  <label>What feature or objective do you want to build?</label>
                  <div className="ai-input-wrap">
                    <input
                      placeholder="e.g., Integrate Stripe webhook payments with email receipts"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAIGenerateTasks()}
                    />
                    <button 
                      className="ai-gen-btn"
                      disabled={aiLoading || !aiPrompt.trim()}
                      onClick={handleAIGenerateTasks}
                    >
                      {aiLoading ? 'Generating...' : '✦ Generate'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assign generated tasks to Project:</label>
                  <select
                    value={aiTargetProject}
                    onChange={(e) => setAiTargetProject(e.target.value)}
                  >
                    {projects.map((p) => (
                      <option key={p.id || p._id || p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AI Results Preview */}
                {aiResults && (
                  <div className="ai-results-block">
                    <div className="ai-results-header">
                      <strong>Generated Plan ({aiResults.length} tasks)</strong>
                      <button className="primary-button-sm" onClick={handleApplyAITasks}>
                        ✓ Add All to {aiTargetProject}
                      </button>
                    </div>

                    <div className="ai-task-cards">
                      {aiResults.map((item, idx) => (
                        <div className="ai-task-card" key={idx}>
                          <div className="ai-task-card-top">
                            <strong>{item.title}</strong>
                            <span className={`priority ${(item.priority || 'medium').toLowerCase()}`}>
                              {item.priority}
                            </span>
                          </div>
                          {item.description && <p>{item.description}</p>}
                          <div className="ai-task-meta">
                            <span className="task-tag engineering">{item.tag || 'Engineering'}</span>
                            <span className="due-date">Due: {item.due || 'Tomorrow'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="ai-body">
                {aiLoading ? (
                  <div className="loading-indicator">Analyzing sprint workload and tasks...</div>
                ) : aiSummary ? (
                  <div className="ai-summary-card">
                    <div className="summary-health">
                      <span className="health-score">{aiSummary.healthScore || 92}%</span>
                      <div>
                        <strong>Sprint Health Score</strong>
                        <p>{aiSummary.headline}</p>
                      </div>
                    </div>

                    {aiSummary.recommendations && (
                      <div className="summary-section">
                        <h4>AI Actionable Recommendations:</h4>
                        <ul>
                          {aiSummary.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="velocity-badge">
                      <span>🚀</span> {aiSummary.velocityTrend || '+14% productivity velocity'}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Auth & Profile */}
      {isAuthModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="modal-card auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{authForm.isRegister ? 'Create Account' : 'User Account & Profile'}</h3>
              <button className="close-btn" onClick={() => setIsAuthModalOpen(false)}>✕</button>
            </div>

            {currentUser && currentUser.email !== 'guest@innovationhacks.in' ? (
              <div className="profile-details-view">
                <div className="profile-card-top">
                  <div className="profile-large-avatar">{currentUser.avatar || 'AY'}</div>
                  <div>
                    <h3>{currentUser.name}</h3>
                    <p>{currentUser.email}</p>
                    <span className="role-pill">{currentUser.role || 'Full Stack Intern'}</span>
                  </div>
                </div>

                <div className="profile-stats-summary">
                  <div>
                    <span>Total Tasks Assigned</span>
                    <strong>{tasks.length}</strong>
                  </div>
                  <div>
                    <span>Completed</span>
                    <strong>{completedCount}</strong>
                  </div>
                </div>

                <button className="danger-button" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit}>
                {authForm.isRegister && (
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      required
                      placeholder="e.g. Anubhav Yadav"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="anubhav@innovationhacks.in"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="text-button"
                    onClick={() => setAuthForm({ ...authForm, isRegister: !authForm.isRegister })}
                  >
                    {authForm.isRegister ? 'Already have an account? Log In' : "Don't have an account? Register"}
                  </button>
                  <button type="submit" className="primary-button">
                    {authForm.isRegister ? 'Register' : 'Log In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
