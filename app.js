const STORAGE_KEY = 'classroom-clone-v1';

const demoState = {
  users: [
    {
      id: 'teacher-1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      role: 'teacher'
    },
    {
      id: 'student-1',
      name: 'Sam Lee',
      email: 'sam@example.com',
      role: 'student'
    },
    {
      id: 'student-2',
      name: 'Maria Gomez',
      email: 'maria@example.com',
      role: 'student'
    }
  ],
  currentUserId: 'teacher-1',
  classes: [
    {
      id: 'class-1',
      name: 'Algebra 1',
      section: 'Period 3',
      subject: 'Mathematics',
      room: 'Room 102',
      description: 'Foundations of algebra, equations, functions, and problem solving.',
      teacherId: 'teacher-1',
      teacherName: 'Alex Johnson',
      students: ['student-1', 'student-2'],
      announcements: [
        {
          id: 'ann-1',
          title: 'Welcome to Algebra 1',
          body: 'We will focus on equations, expressions, and graphing this week.',
          date: '2026-10-01'
        }
      ],
      assignments: [
        {
          id: 'asg-1',
          title: 'Linear Equations Practice',
          dueDate: '2026-10-12',
          points: 100,
          instructions: 'Solve all 10 problems from Chapter 2. Show your work.',
          submissions: {
            'student-1': { status: 'submitted', score: 92, submittedAt: '2026-10-11' },
            'student-2': { status: 'submitted', score: 86, submittedAt: '2026-10-10' }
          }
        },
        {
          id: 'asg-2',
          title: 'Graphing Challenge',
          dueDate: '2026-10-18',
          points: 50,
          instructions: 'Graph 5 linear equations and identify slope and intercept.',
          submissions: {
            'student-1': { status: 'pending', score: null, submittedAt: null },
            'student-2': { status: 'graded', score: 48, submittedAt: '2026-10-16' }
          }
        }
      ]
    },
    {
      id: 'class-2',
      name: 'World History',
      section: 'Period 5',
      subject: 'Social Studies',
      room: 'Room 205',
      description: 'Examine the social, political, and cultural forces of the modern world.',
      teacherId: 'teacher-1',
      teacherName: 'Alex Johnson',
      students: ['student-1'],
      announcements: [
        {
          id: 'ann-2',
          title: 'Reading Assignment',
          body: 'Read the introduction to the Industrial Revolution section before Friday.',
          date: '2026-10-03'
        }
      ],
      assignments: [
        {
          id: 'asg-3',
          title: 'Industrial Revolution Notes',
          dueDate: '2026-10-17',
          points: 80,
          instructions: 'Write a 1-page summary of major impacts.',
          submissions: {
            'student-1': { status: 'pending', score: null, submittedAt: null }
          }
        }
      ]
    }
  ]
};

const state = loadState();

const els = {
  loginPage: document.getElementById('loginPage'),
  appShell: document.getElementById('appShell'),
  loginForm: document.getElementById('loginForm'),
  logoutBtn: document.getElementById('logoutBtn'),
  headerUserName: document.getElementById('headerUserName'),
  headerAvatar: document.getElementById('headerAvatar'),
  classList: document.getElementById('classList'),
  overviewList: document.getElementById('overviewList'),
  createClassBtn: document.getElementById('createClassBtn'),
  joinClassBtn: document.getElementById('joinClassBtn'),
  addClassQuickBtn: document.getElementById('addClassQuickBtn'),
  classModal: document.getElementById('classModal'),
  classForm: document.getElementById('classForm'),
  classModalTitle: document.getElementById('classModalTitle'),
  assignmentModal: document.getElementById('assignmentModal'),
  assignmentForm: document.getElementById('assignmentForm'),
  classView: document.getElementById('classView'),
  dashboardView: document.getElementById('dashboardView'),
  classHeader: document.getElementById('classHeader'),
  currentClassName: document.getElementById('currentClassName'),
  currentClassMeta: document.getElementById('currentClassMeta'),
  announcementList: document.getElementById('announcementList'),
  upcomingAssignments: document.getElementById('upcomingAssignments'),
  assignmentList: document.getElementById('assignmentList'),
  submissionList: document.getElementById('submissionList'),
  peopleList: document.getElementById('peopleList'),
  classSummary: document.getElementById('classSummary'),
  streamSection: document.getElementById('streamSection'),
  assignmentsSection: document.getElementById('assignmentsSection'),
  peopleSection: document.getElementById('peopleSection'),
  tabs: [...document.querySelectorAll('.tab')],
  navItems: [...document.querySelectorAll('.nav-item')],
  loginName: document.getElementById('loginName'),
  loginEmail: document.getElementById('loginEmail'),
  roleButtons: [...document.querySelectorAll('[data-role]')]
};

let selectedClassId = null;
let activeTab = 'stream';

init();

function init() {
  bindEvents();
  renderLogin();
  renderDashboard();
  renderClassDetail();
}

function bindEvents() {
  els.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = els.loginName.value.trim();
    const email = els.loginEmail.value.trim();
    const role = getSelectedRole();

    if (!name || !email) return;

    const foundUser = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      state.currentUserId = foundUser.id;
    } else {
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role
      };
      state.users.push(newUser);
      state.currentUserId = newUser.id;
    }

    saveState();
    renderLogin();
    renderDashboard();
    renderClassDetail();
  });

  els.logoutBtn.addEventListener('click', () => {
    state.currentUserId = null;
    saveState();
    renderLogin();
  });

  els.createClassBtn.addEventListener('click', openClassModal);
  els.joinClassBtn.addEventListener('click', () => {
    const user = getCurrentUser();
    const classId = prompt('Enter class ID to join (demo: class-1 or class-2):');
    if (!classId) return;

    const cls = state.classes.find(c => c.id === classId);
    if (!cls) {
      alert('Class not found.');
      return;
    }

    if (cls.students.includes(user.id)) {
      alert('You already joined this class.');
      return;
    }

    cls.students.push(user.id);
    saveState();
    renderDashboard();
    renderClassDetail();
  });

  els.addClassQuickBtn.addEventListener('click', openClassModal);

  els.classForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('className').value.trim();
    const section = document.getElementById('classSection').value.trim();
    const subject = document.getElementById('classSubject').value.trim();
    const room = document.getElementById('classRoom').value.trim();
    const description = document.getElementById('classDescription').value.trim();

    if (!name) return;

    const newClass = {
      id: `class-${Date.now()}`,
      name,
      section,
      subject,
      room,
      description,
      teacherId: getCurrentUser().id,
      teacherName: getCurrentUser().name,
      students: getCurrentUser().role === 'student' ? [getCurrentUser().id] : [],
      announcements: [
        {
          id: `ann-${Date.now()}`,
          title: 'New class created',
          body: 'This classroom is ready for announcements and assignments.',
          date: new Date().toISOString().slice(0, 10)
        }
      ],
      assignments: []
    };

    state.classes.push(newClass);
    selectedClassId = newClass.id;
    saveState();
    closeModal('classModal');
    els.classForm.reset();
    renderDashboard();
    renderClassDetail();
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  els.assignmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const classObj = getSelectedClass();

    if (!classObj) return;

    const newAssignment = {
      id: `asg-${Date.now()}`,
      title: document.getElementById('assignmentTitle').value.trim(),
      dueDate: document.getElementById('assignmentDue').value,
      points: Number(document.getElementById('assignmentPoints').value),
      instructions: document.getElementById('assignmentInstructions').value.trim(),
      submissions: {}
    };

    classObj.assignments.unshift(newAssignment);
    saveState();
    closeModal('assignmentModal');
    els.assignmentForm.reset();
    renderDashboard();
    renderClassDetail();
  });

  els.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      renderTabs();
    });
  });

  els.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      if (view === 'dashboard') {
        selectedClassId = null;
      }
      renderDashboardState();
    });
  });

  els.roleButtons.forEach(button => {
    button.addEventListener('click', () => {
      els.roleButtons.forEach(b => b.classList.toggle('active', b === button));
    });
  });
}

function getSelectedRole() {
  const active = document.querySelector('[data-role].active');
  return active ? active.dataset.role : 'teacher';
}

function getCurrentUser() {
  return state.users.find(u => u.id === state.currentUserId) || null;
}

function getSelectedClass() {
  return state.classes.find(c => c.id === selectedClassId) || null;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(demoState);
  try {
    return JSON.parse(raw);
  } catch {
    return structuredClone(demoState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderLogin() {
  const user = getCurrentUser();

  if (!user) {
    els.loginPage.classList.remove('hidden');
    els.appShell.classList.add('hidden');
    return;
  }

  els.loginPage.classList.add('hidden');
  els.appShell.classList.remove('hidden');

  els.headerUserName.textContent = user.name;
  els.headerAvatar.textContent = user.name.charAt(0).toUpperCase();
}

function renderDashboard() {
  const user = getCurrentUser();

  if (!user) return;

  const classes = state.classes.filter(c => {
    if (user.role === 'teacher') return c.teacherId === user.id;
    return c.students.includes(user.id);
  });

  els.classList.innerHTML = '';

  if (!classes.length) {
    els.classList.innerHTML = '<div class="meta">No classes found yet. Create or join one.</div>';
  } else {
    classes.forEach(cls => {
      const card = document.createElement('div');
      card.className = 'class-card';
      card.innerHTML = `
        <div class="class-banner" style="background: linear-gradient(135deg, ${pickColor(cls.name)}, #1a73e8);"></div>
        <h3>${cls.name}</h3>
        <div class="meta">${cls.teacherName}</div>
        <div class="small">${cls.section || 'General'} • ${cls.subject || 'Subject'}</div>
        <div class="small" style="margin-top: 6px;">${cls.students.length} students</div>
      `;
      card.addEventListener('click', () => {
        selectedClassId = cls.id;
        renderDashboardState();
      });
      els.classList.appendChild(card);
    });
  }

  const overview = [
    { label: 'Classes', value: String(classes.length) },
    { label: 'Assignments', value: String(classes.reduce((sum, c) => sum + c.assignments.length, 0)) },
    { label: 'Students', value: String(classes.reduce((sum, c) => sum + c.students.length, 0)) }
  ];

  els.overviewList.innerHTML = overview.map(item => `
    <div class="list-item">
      <strong>${item.label}</strong>
      <span>${item.value}</span>
    </div>
  `).join('');

  renderDashboardState();
}

function renderDashboardState() {
  const user = getCurrentUser();

  if (!user) return;

  const isClassSelected = !!selectedClassId && !!getSelectedClass();
  if (isClassSelected) {
    els.dashboardView.style.display = 'none';
    els.classView.classList.add('visible');
    renderClassDetail();
  } else {
    els.classView.classList.remove('visible');
    els.dashboardView.style.display = 'block';
  }

  els.navItems.forEach(item => {
    const active = item.dataset.view === 'dashboard' && !isClassSelected;
    item.classList.toggle('active', active);
  });
}

function renderClassDetail() {
  const classObj = getSelectedClass();
  if (!classObj) {
    els.classView.classList.remove('visible');
    return;
  }

  els.currentClassName.textContent = classObj.name;
  els.currentClassMeta.textContent = `${classObj.teacherName} • ${classObj.section || 'Section'} • ${classObj.room || 'Room TBD'}`;

  const announcements = classObj.announcements || [];
  els.announcementList.innerHTML = announcements.length
    ? announcements.map(a => `
        <div class="list-item">
          <strong>${a.title}</strong>
          <div class="meta">${a.date}</div>
          <div>${a.body}</div>
        </div>
      `).join('')
    : '<div class="meta">No announcements yet.</div>';

  const upcoming = classObj.assignments.slice(0, 3);
  els.upcomingAssignments.innerHTML = upcoming.length
    ? upcoming.map(a => `
        <div class="assignment">
          <div class="assignment-header">
            <h4>${a.title}</h4>
            <span class="badge">${a.points} pts</span>
          </div>
          <div class="assignment-meta">Due ${a.dueDate}</div>
          <div>${a.instructions}</div>
        </div>
      `).join('')
    : '<div class="meta">No assignments yet.</div>';

  els.assignmentList.innerHTML = classObj.assignments.length
    ? classObj.assignments.map(a => {
        const submissionItems = Object.values(a.submissions || {});
        const studentCount = classObj.students.length || 1;
        const completed = submissionItems.filter(s => s.status === 'submitted' || s.status === 'graded').length;
        return `
          <div class="assignment">
            <div class="assignment-header">
              <h4>${a.title}</h4>
              <span class="badge">${a.points} pts</span>
            </div>
            <div class="assignment-meta">Due ${a.dueDate} • ${completed}/${studentCount} submitted</div>
            <div>${a.instructions}</div>
            <div style="margin-top: 10px;">
              <span class="status ${getAssignmentStatus(a)}">${getAssignmentStatus(a).toUpperCase()}</span>
            </div>
          </div>
        `;
      }).join('')
    : '<div class="meta">No assignments yet.</div>';

  const submissionMarkup = classObj.students.map(studentId => {
    const user = state.users.find(u => u.id === studentId);
    const latestAssignment = classObj.assignments[0];
    const submission = latestAssignment?.submissions?.[studentId] || null;
    const scoreLabel = submission && submission.score !== null && submission.score !== undefined
      ? `${submission.score}/${latestAssignment.points}`
      : 'Not graded';

    return `
      <div class="student-row">
        <div class="student-name">
          <div class="avatar" style="width:24px;height:24px;font-size:0.7rem;">${user.name.charAt(0)}</div>
          <span>${user.name}</span>
        </div>
        <div class="student-score">${scoreLabel}</div>
      </div>
    `;
  }).join('');

  els.submissionList.innerHTML = submissionMarkup || '<div class="meta">No student data yet.</div>';

  const people = classObj.students.map(studentId => {
    const user = state.users.find(u => u.id === studentId);
    return user ? user.name : 'Unknown user';
  });

  els.peopleList.innerHTML = people.map(name => `
    <div class="student-row">
      <div class="student-name">
        <div class="avatar" style="width:24px;height:24px;font-size:0.7rem;">${name.charAt(0)}</div>
        <span>${name}</span>
      </div>
      <span class="badge">Student</span>
    </div>
  `).join('');

  const summary = `
    <div class="list-item">
      <strong>Teacher</strong>
      <div>${classObj.teacherName}</div>
    </div>
    <div class="list-item">
      <strong>Students</strong>
      <div>${classObj.students.length} enrolled</div>
    </div>
    <div class="list-item">
      <strong>Assignments</strong>
      <div>${classObj.assignments.length} total</div>
    </div>
    <div class="list-item">
      <strong>Course</strong>
      <div>${classObj.subject || 'Subject not set'}</div>
    </div>
  `;

  els.classSummary.innerHTML = summary;

  renderTabs();
  renderAssignmentControls();
}

function renderTabs() {
  els.tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === activeTab));
  const tabsToShow = {
    stream: 'streamSection',
    assignments: 'assignmentsSection',
    people: 'peopleSection'
  };

  ['streamSection', 'assignmentsSection', 'peopleSection'].forEach(sectionId => {
    const section = document.getElementById(sectionId);
    section.classList.toggle('active', sectionId === tabsToShow[activeTab]);
  });
}

function renderAssignmentControls() {
  const user = getCurrentUser();
  const classObj = getSelectedClass();
  if (!classObj) return;

  const isTeacher = user && user.role === 'teacher';
  const assignmentBtn = document.getElementById('newAssignmentBtn');
  if (assignmentBtn) {
    assignmentBtn.style.display = isTeacher ? 'inline-flex' : 'none';
  }
}

function openClassModal() {
  els.classModal.classList.add('visible');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('visible');
}

function getAssignmentStatus(assignment) {
  const submissionValues = Object.values(assignment.submissions || {});
  if (!submissionValues.length) return 'due';
  const someSubmitted = submissionValues.some(s => s.status === 'submitted' || s.status === 'graded');
  const allGraded = submissionValues.every(s => s.status === 'graded');
  if (allGraded) return 'graded';
  if (someSubmitted) return 'submitted';
  return 'due';
}

function pickColor(name) {
  const colors = ['#4f46e5', '#0f9d58', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
  const index = name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
