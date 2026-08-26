import React from 'react';
import './App.css';

const initialTasks = [
  { id: 1, title: 'Audit authentication flow', project: 'Atlas design system', due: 'Today', priority: 'High', tag: 'Engineering', done: false },
  { id: 2, title: 'Review component API proposal', project: 'Atlas design system', due: 'Today', priority: 'Medium', tag: 'Review', done: false },
  { id: 3, title: 'Ship billing dashboard v2', project: 'Revenue intelligence', due: 'Tomorrow', priority: 'High', tag: 'Engineering', done: false },
  { id: 4, title: 'Update onboarding copy', project: 'Growth experiments', due: 'Sep 02', priority: 'Low', tag: 'Content', done: true },
];

const projects = [
  { name: 'Atlas design system', meta: '12 tasks · 4 collaborators', progress: 72, color: 'coral', initials: 'AD' },
  { name: 'Revenue intelligence', meta: '8 tasks · 3 collaborators', progress: 48, color: 'blue', initials: 'RI' },
  { name: 'Growth experiments', meta: '16 tasks · 6 collaborators', progress: 89, color: 'green', initials: 'GE' },
];

function ProgressBar({ value, color = 'coral' }) {
  return <div className="progress-track" aria-label={`${value}% complete`}><span className={`progress-fill ${color}`} style={{ width: `${value}%` }} /></div>;
}

function ProjectCard({ project }) {
  return <article className="project-card"><div className="project-card-top"><span className={`project-mark ${project.color}`}>{project.initials}</span><button className="more-button" aria-label={`More options for ${project.name}`}>...</button></div><h3>{project.name}</h3><p>{project.meta}</p><div className="project-progress"><span>Progress</span><strong>{project.progress}%</strong></div><ProgressBar value={project.progress} color={project.color} /></article>;
}

function App() {
  const [tasks, setTasks] = React.useState(initialTasks);
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('All tasks');
  const completedCount = tasks.filter((task) => task.done).length;
  const visibleTasks = tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.project} ${task.tag}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'All tasks' || (filter === 'My tasks' && !task.done) || (filter === 'Completed' && task.done);
    return matchesQuery && matchesFilter;
  });
  const toggleTask = (id) => setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">N</span><span>northstar</span></div><div className="workspace-switcher"><span className="workspace-dot">W</span><span><small>Workspace</small><strong>Acme Labs</strong></span><span className="chevron">⌄</span></div><nav aria-label="Main navigation"><a className="nav-item active" href="#overview"><span className="nav-icon">◈</span>Overview</a><a className="nav-item" href="#my-tasks"><span className="nav-icon">✓</span>My tasks <span className="nav-count">3</span></a><a className="nav-item" href="#projects"><span className="nav-icon">▦</span>Projects</a><a className="nav-item" href="#activity"><span className="nav-icon">◷</span>Activity</a></nav><div className="sidebar-label">Workspace</div><nav aria-label="Workspace navigation"><a className="nav-item" href="#team"><span className="nav-icon">◎</span>Team</a><a className="nav-item" href="#settings"><span className="nav-icon">⚙</span>Settings</a></nav><div className="sidebar-footer"><div className="pro-badge">✦</div><div><strong>Pro workspace</strong><small>14 days left in trial</small></div><button aria-label="Open workspace upgrade options">...</button></div></aside>
    <main className="main-content" id="overview"><header className="topbar"><button className="mobile-menu" aria-label="Open navigation">☰</button><div className="breadcrumb">Workspace <span>/</span> Overview</div><div className="topbar-actions"><button className="icon-button" aria-label="Search">⌕</button><button className="icon-button notification" aria-label="Notifications">♢<i /></button><div className="avatar">AY</div><span className="profile-name">Anubhav Yadav</span><span className="chevron">⌄</span></div></header><div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">Tuesday, August 26, 2026</p><h1>Good morning, Anubhavpush  <span>✦</span></h1><p className="subheading">Here is what is happening across your workspace today.</p></div><button className="primary-button"><span>+</span> New task</button></section><section className="stats-grid" aria-label="Workspace summary"><div className="stat-card"><div className="stat-icon coral-bg">✓</div><div><span>Tasks completed</span><strong>{completedCount}<small> / {tasks.length}</small></strong><em className="positive">+12% <small>vs last week</small></em></div></div><div className="stat-card"><div className="stat-icon blue-bg">◷</div><div><span>Focus time</span><strong>4h 32m</strong><em className="positive">+8% <small>vs last week</small></em></div></div><div className="stat-card"><div className="stat-icon green-bg">↗</div><div><span>Projects on track</span><strong>8 <small>/ 10</small></strong><em className="neutral">80% <small>of total</small></em></div></div></section><section className="section-block" id="projects"><div className="section-heading"><div><h2>Active projects</h2><p>Keep an eye on your team's momentum.</p></div><a href="#all-projects">View all <span>→</span></a></div><div className="project-grid">{projects.map((project) => <ProjectCard key={project.name} project={project} />)}<button className="add-project"><span>+</span><strong>Start a new project</strong><small>Bring your next idea to life</small></button></div></section><section className="section-block task-section" id="my-tasks"><div className="section-heading"><div><h2>Task overview</h2><p>Your next steps, all in one place.</p></div><button className="text-button">View all tasks <span>→</span></button></div><div className="task-toolbar"><div className="filter-tabs">{['All tasks', 'My tasks', 'Completed'].map((tab) => <button key={tab} className={filter === tab ? 'selected' : ''} onClick={() => setFilter(tab)}>{tab}{tab === 'All tasks' && <small>{tasks.length}</small>}</button>)}</div><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" aria-label="Search tasks" /></label></div><div className="task-list">{visibleTasks.length ? visibleTasks.map((task) => <div className={`task-row ${task.done ? 'is-done' : ''}`} key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} aria-label={`Mark ${task.title} complete`} /><div className="task-copy"><strong>{task.title}</strong><span>{task.project}</span></div><span className={`task-tag ${task.tag.toLowerCase()}`}>{task.tag}</span><span className={`priority ${task.priority.toLowerCase()}`}><i />{task.priority}</span><span className="due-date">{task.due}</span><span className="task-avatar">{task.id % 2 ? 'JD' : 'MK'}</span><button className="row-more" aria-label={`More options for ${task.title}`}>...</button></div>) : <div className="empty-state"><span>⌕</span><strong>No tasks found</strong><p>Try a different search or filter.</p></div>}</div></section></div></main>
  </div>;
}

export default App;
