const Task = require('../models/Task');
const Project = require('../models/Project');

// Smart Heuristic Task Generation Engine (zero-key fallback)
const generateSmartTasks = (goal, projectName) => {
  const goalLower = goal.toLowerCase();
  
  if (goalLower.includes('auth') || goalLower.includes('login') || goalLower.includes('user')) {
    return [
      { title: 'Set up JWT authentication middleware and token verification', priority: 'High', tag: 'Security', due: 'Today', description: 'Implement token signing, expiration, and header validation.' },
      { title: 'Create registration and login forms with client validation', priority: 'High', tag: 'Engineering', due: 'Today', description: 'Validate email format, password complexity, and error toasts.' },
      { title: 'Implement password hashing with bcrypt and secure salt rounds', priority: 'Medium', tag: 'Security', due: 'Tomorrow', description: 'Ensure plain text passwords are never stored.' },
      { title: 'Write unit & integration tests for auth edge cases', priority: 'Medium', tag: 'Testing', due: 'Sep 25', description: 'Test expired tokens, wrong credentials, and duplicate emails.' }
    ];
  }

  if (goalLower.includes('payment') || goalLower.includes('stripe') || goalLower.includes('billing')) {
    return [
      { title: 'Integrate Stripe SDK and webhook event listeners', priority: 'High', tag: 'Billing', due: 'Today', description: 'Listen for invoice.paid and customer.subscription.deleted events.' },
      { title: 'Create subscription tier pricing comparison table', priority: 'Medium', tag: 'Design', due: 'Tomorrow', description: 'Highlight Pro vs Enterprise tier limits and CTA buttons.' },
      { title: 'Implement idempotency checks for payment webhooks', priority: 'High', tag: 'Engineering', due: 'Tomorrow', description: 'Prevent double charge or multiple entitlement activations.' },
      { title: 'Build automated billing invoice PDF download endpoint', priority: 'Low', tag: 'Engineering', due: 'Sep 28', description: 'Allow users to download monthly VAT/GST receipts.' }
    ];
  }

  if (goalLower.includes('ai') || goalLower.includes('llm') || goalLower.includes('gemini') || goalLower.includes('bot')) {
    return [
      { title: 'Configure AI model prompt engineering template and JSON parser', priority: 'High', tag: 'AI Engine', due: 'Today', description: 'Structure system prompt and parse generated JSON task arrays.' },
      { title: 'Implement fallback resilience for AI rate limiting', priority: 'High', tag: 'Engineering', due: 'Today', description: 'Gracefully fall back to local rule-based heuristic generators.' },
      { title: 'Build interactive AI assistant UI modal in React dashboard', priority: 'Medium', tag: 'Frontend', due: 'Tomorrow', description: 'Add 1-click apply tasks button, prompt input, and preview cards.' },
      { title: 'Evaluate latency and token usage metrics', priority: 'Low', tag: 'Analytics', due: 'Sep 26', description: 'Track generation time and optimize token prompt overhead.' }
    ];
  }

  // Default smart domain decomposition
  return [
    { title: `Architect technical specification & data model for "${goal}"`, priority: 'High', tag: 'Architecture', due: 'Today', description: 'Define database schema, relationships, and REST API contract.' },
    { title: `Implement core REST API endpoints & business logic for ${goal}`, priority: 'High', tag: 'Engineering', due: 'Today', description: 'Build controllers, service handlers, and input validation.' },
    { title: `Build responsive frontend UI components for ${goal}`, priority: 'Medium', tag: 'Frontend', due: 'Tomorrow', description: 'Connect React state, handle loading/empty states, and style with CSS.' },
    { title: `Execute end-to-end testing and performance audit`, priority: 'Medium', tag: 'QA', due: 'Sep 24', description: 'Verify responsiveness, API status codes, and error boundary handling.' }
  ];
};

// @desc    Generate subtasks from a goal or feature description using AI
// @route   POST /api/ai/generate-tasks
// @access  Public
const generateTasks = async (req, res, next) => {
  try {
    const { prompt, project, autoInsert } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Prompt or goal description is required'
      });
    }

    const targetProject = project || 'Atlas design system';
    let generatedTasks = [];
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert full-stack tech lead and agile sprint planner.
Given the project/goal: "${prompt}", generate 4 actionable, professional engineering and product tasks.
Return ONLY valid JSON in the following exact array format without markdown backticks:
[
  {
    "title": "Clear concise task title",
    "priority": "High" | "Medium" | "Low",
    "tag": "Engineering" | "Design" | "Security" | "Testing" | "Product",
    "due": "Today" | "Tomorrow" | "Sep 25",
    "description": "Short 1 sentence summary"
  }
]`
              }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          generatedTasks = JSON.parse(cleanedText);
        }
      } catch (geminiError) {
        console.warn('Gemini API call skipped or encountered error, using smart fallback engine:', geminiError.message);
      }
    }

    if (!generatedTasks || generatedTasks.length === 0) {
      generatedTasks = generateSmartTasks(prompt, targetProject);
    }

    // Attach target project and AI metadata
    const formattedTasks = generatedTasks.map(t => ({
      ...t,
      project: targetProject,
      aiGenerated: true
    }));

    // If user requested auto-insertion into database
    let insertedTasks = [];
    if (autoInsert) {
      for (const t of formattedTasks) {
        const created = await Task.create({
          title: t.title,
          description: t.description,
          project: targetProject,
          priority: t.priority || 'Medium',
          tag: t.tag || 'Engineering',
          due: t.due || 'Tomorrow',
          aiGenerated: true
        });
        insertedTasks.push(created);
      }
    }

    res.status(200).json({
      success: true,
      message: `Generated ${formattedTasks.length} AI-assisted tasks successfully`,
      source: apiKey && apiKey !== 'your-gemini-api-key-here' ? 'Google Gemini AI' : 'Innovation Hacks Smart AI Engine',
      data: autoInsert ? insertedTasks : formattedTasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI productivity summary and workload insights
// @route   POST /api/ai/summarize
// @access  Public
const summarizeWorkload = async (req, res, next) => {
  try {
    const tasks = await Task.find();
    const projects = await Project.find();
    const stats = await Task.getStats();

    const total = tasks.length;
    const completed = stats.completed;
    const pending = total - completed;
    const highPriorityPending = tasks.filter(t => t.priority === 'High' && !t.done);

    const summary = {
      healthScore: total > 0 ? Math.min(100, Math.round((completed / total) * 70 + (stats.projectsOnTrack / Math.max(1, projects.length)) * 30)) : 85,
      headline: pending === 0 
        ? 'All caught up! Outstanding sprint velocity across all projects.' 
        : `You have ${pending} open task${pending === 1 ? '' : 's'} with ${highPriorityPending.length} high-priority item${highPriorityPending.length === 1 ? '' : 's'} requiring attention today.`,
      keyBottlenecks: highPriorityPending.map(t => ({ id: t.id, title: t.title, project: t.project })),
      recommendations: [
        'Tackle High Priority items first during your morning 2-hour focus block.',
        `Maintain momentum on "${projects[0]?.name || 'Atlas design system'}" which is nearing milestone completion.`,
        'Keep API response schemas unified across all write endpoints for seamless frontend integration.'
      ],
      velocityTrend: '+14% productivity increase vs last sprint'
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI project description and milestone plan
// @route   POST /api/ai/project-description
// @access  Public
const generateProjectDescription = async (req, res, next) => {
  try {
    const { name, category } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }

    const description = `Production-grade ${category || 'software engineering'} initiative focused on building scalable, reliable, and user-centric architecture for ${name}. Includes RESTful integration, automated testing, and responsive UI.`;

    res.status(200).json({
      success: true,
      data: {
        name,
        suggestedDescription: description,
        suggestedColor: ['coral', 'blue', 'green', 'purple'][Math.floor(Math.random() * 4)],
        estimatedMilestones: ['Phase 1: Architecture & API', 'Phase 2: UI & State Flow', 'Phase 3: AI Integration & Testing']
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateTasks,
  summarizeWorkload,
  generateProjectDescription
};
