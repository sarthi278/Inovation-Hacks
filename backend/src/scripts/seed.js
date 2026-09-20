const bcrypt = require('bcryptjs');
const { writeJSON, usersFile, projectsFile, tasksFile } = require('../config/db');

async function seed() {
  console.log('🌱 Seeding database with initial users, projects, and tasks...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    {
      id: 'usr_1',
      name: 'Anubhav Yadav',
      email: 'anubhav@innovationhacks.in',
      password: passwordHash,
      role: 'lead',
      avatar: 'AY',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_2',
      name: 'Jane Doe',
      email: 'jane@innovationhacks.in',
      password: passwordHash,
      role: 'developer',
      avatar: 'JD',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_3',
      name: 'Mike Kowalski',
      email: 'mike@innovationhacks.in',
      password: passwordHash,
      role: 'developer',
      avatar: 'MK',
      createdAt: new Date().toISOString()
    }
  ];

  const projects = [
    {
      id: 'proj_1',
      name: 'Atlas design system',
      description: 'Unified component library and design tokens for web and mobile platforms.',
      meta: '12 tasks · 4 collaborators',
      progress: 72,
      color: 'coral',
      initials: 'AD',
      ownerId: 'usr_1',
      collaborators: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'proj_2',
      name: 'Revenue intelligence',
      description: 'Analytics engine and billing forecasting dashboard for recurring subscriptions.',
      meta: '8 tasks · 3 collaborators',
      progress: 48,
      color: 'blue',
      initials: 'RI',
      ownerId: 'usr_1',
      collaborators: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'proj_3',
      name: 'Growth experiments',
      description: 'A/B testing user onboarding flows and conversion funnel optimizations.',
      meta: '16 tasks · 6 collaborators',
      progress: 89,
      color: 'green',
      initials: 'GE',
      ownerId: 'usr_1',
      collaborators: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const tasks = [
    {
      id: 'tsk_1',
      title: 'Audit authentication flow',
      description: 'Verify JWT tokens, token refreshing, and protected route redirection.',
      project: 'Atlas design system',
      projectId: 'proj_1',
      due: 'Today',
      priority: 'High',
      tag: 'Engineering',
      status: 'todo',
      done: false,
      assignee: 'Anubhav Yadav',
      assigneeAvatar: 'AY',
      aiGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_2',
      title: 'Review component API proposal',
      description: 'Gather feedback on Button, Modal, and Dropdown polymorphic prop signatures.',
      project: 'Atlas design system',
      projectId: 'proj_1',
      due: 'Today',
      priority: 'Medium',
      tag: 'Review',
      status: 'todo',
      done: false,
      assignee: 'Jane Doe',
      assigneeAvatar: 'JD',
      aiGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_3',
      title: 'Ship billing dashboard v2',
      description: 'Deploy revenue forecasting charts and invoice download endpoints.',
      project: 'Revenue intelligence',
      projectId: 'proj_2',
      due: 'Tomorrow',
      priority: 'High',
      tag: 'Engineering',
      status: 'in-progress',
      done: false,
      assignee: 'Mike Kowalski',
      assigneeAvatar: 'MK',
      aiGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_4',
      title: 'Update onboarding copy',
      description: 'Polish microcopy for product tour and invitation banners.',
      project: 'Growth experiments',
      projectId: 'proj_3',
      due: 'Sep 02',
      priority: 'Low',
      tag: 'Content',
      status: 'done',
      done: true,
      assignee: 'Anubhav Yadav',
      assigneeAvatar: 'AY',
      aiGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  writeJSON(usersFile, users);
  writeJSON(projectsFile, projects);
  writeJSON(tasksFile, tasks);

  console.log('✅ Seeding completed:');
  console.log(` - ${users.length} users created`);
  console.log(` - ${projects.length} projects created`);
  console.log(` - ${tasks.length} tasks created`);
}

if (require.main === module) {
  seed();
}

module.exports = seed;
