const app = require('../server');
const http = require('http');

async function runTests() {
  console.log('🧪 Starting automated REST API test suite...\n');

  const server = http.createServer(app);
  const PORT = 5099;

  await new Promise((resolve) => server.listen(PORT, resolve));
  const BASE_URL = `http://localhost:${PORT}/api`;

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  try {
    // 1. Health check
    await test('GET /health returns 200 and healthy status', async () => {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error('Expected success: true');
    });

    // 2. Auth: Register
    let testToken = '';
    const testEmail = `test_${Date.now()}@innovationhacks.in`;

    await test('POST /auth/register creates user and returns JWT token', async () => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Intern Tester',
          email: testEmail,
          password: 'password123'
        })
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const json = await res.json();
      if (!json.data.token) throw new Error('No token returned');
      testToken = json.data.token;
    });

    // 3. Auth: Login
    await test('POST /auth/login authenticates user and returns token', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'password123'
        })
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (!json.data.user) throw new Error('No user data returned');
    });

    // 4. Projects: List
    await test('GET /projects returns projects array', async () => {
      const res = await fetch(`${BASE_URL}/projects`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.data)) throw new Error('Expected data to be an array');
    });

    // 5. Projects: Create
    let newProjectId = '';
    await test('POST /projects creates new project', async () => {
      const res = await fetch(`${BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`
        },
        body: JSON.stringify({
          name: 'AI Code Reviewer',
          description: 'Automated PR reviewer using Gemini API',
          color: 'purple',
          collaborators: 2
        })
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const json = await res.json();
      newProjectId = json.data.id || json.data._id;
    });

    // 6. Tasks: List and Stats
    await test('GET /tasks returns tasks array and filters correctly', async () => {
      const res = await fetch(`${BASE_URL}/tasks?status=todo`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.data)) throw new Error('Expected data to be array');
    });

    await test('GET /tasks/stats/summary returns aggregate metrics', async () => {
      const res = await fetch(`${BASE_URL}/tasks/stats/summary`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (typeof json.data.total !== 'number') throw new Error('Expected total count');
    });

    // 7. Tasks: Create, Update, Delete
    let newTaskId = '';
    await test('POST /tasks creates a new task', async () => {
      const res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`
        },
        body: JSON.stringify({
          title: 'Implement token bucket rate limiter',
          project: 'AI Code Reviewer',
          priority: 'High',
          tag: 'Backend',
          due: 'Tomorrow'
        })
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const json = await res.json();
      newTaskId = json.data.id || json.data._id;
    });

    await test('PATCH /tasks/:id toggles task status', async () => {
      const res = await fetch(`${BASE_URL}/tasks/${newTaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`
        },
        body: JSON.stringify({
          done: true,
          status: 'done'
        })
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (!json.data.done) throw new Error('Expected task done to be true');
    });

    // 8. AI Capabilities
    await test('POST /ai/generate-tasks returns structured subtasks', async () => {
      const res = await fetch(`${BASE_URL}/ai/generate-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Deploy high availability Redis cluster',
          project: 'AI Code Reviewer'
        })
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.data) || json.data.length === 0) throw new Error('Expected array of generated tasks');
    });

    await test('POST /ai/summarize returns productivity insights', async () => {
      const res = await fetch(`${BASE_URL}/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (!json.data.headline) throw new Error('Expected headline in summary');
    });

    // 9. Error handling
    await test('GET /non-existent-route returns centralized 404', async () => {
      const res = await fetch(`${BASE_URL}/non-existent-route`);
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
      const json = await res.json();
      if (json.success !== false) throw new Error('Expected success: false');
    });

  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
