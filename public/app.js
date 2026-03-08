// State management
const state = {
  userId: null,
  userName: null,
  currentLanguageId: null,
  currentLanguageName: null,
  levels: [],
  previousScreen: null
};

const API_URL = window.location.origin;

// Screens
const screens = {
  login: document.getElementById('loginScreen'),
  language: document.getElementById('languageScreen'),
  map: document.getElementById('mapScreen'),
  leaderboard: document.getElementById('leaderboardScreen')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkSession();
});

// Event Listeners
function setupEventListeners() {
  // Login form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Navigation
  document.getElementById('backToLanguagesBtn').addEventListener('click', () => showScreen('language'));
  document.getElementById('viewLeaderboardBtn').addEventListener('click', () => {
    state.previousScreen = 'language';
    showLeaderboard();
  });
  document.getElementById('viewLeaderboardBtn2').addEventListener('click', () => {
    state.previousScreen = 'map';
    showLeaderboard();
  });
  document.getElementById('backFromLeaderboardBtn').addEventListener('click', () => {
    showScreen(state.previousScreen || 'language');
  });

  // Question modal
  document.getElementById('submitAnswerBtn').addEventListener('click', submitAnswer);
  document.getElementById('cancelQuestionBtn').addEventListener('click', closeModal);

  // Enter key in answer input
  document.getElementById('answerInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitAnswer();
    }
  });
}

// Check if user is already logged in
function checkSession() {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  if (userId && userName) {
    state.userId = userId;
    state.userName = userName;
    showLanguageSelection();
  } else {
    showScreen('login');
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();

  const name = document.getElementById('nameInput').value.trim();
  const passcode = document.getElementById('passcodeInput').value;

  if (!name || !passcode) {
    alert('Please enter both name and passcode');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, passcode })
    });

    const data = await response.json();

    if (response.ok) {
      state.userId = data.userId;
      state.userName = data.name;
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userName', data.name);
      showLanguageSelection();
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (error) {
    alert('Error connecting to server');
    console.error(error);
  }
}

// Logout
function logout() {
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  state.userId = null;
  state.userName = null;
  state.currentLanguageId = null;
  state.currentLanguageName = null;
  showScreen('login');
  document.getElementById('loginForm').reset();
}

// Show language selection
async function showLanguageSelection() {
  document.getElementById('userName').textContent = state.userName;

  try {
    const response = await fetch(`${API_URL}/api/languages`);
    const languages = await response.json();

    // Get user progress for each language
    const progressResponse = await fetch(`${API_URL}/api/user/${state.userId}/progress`);
    const progressData = await progressResponse.json();

    const progressMap = {};
    progressData.forEach(p => {
      progressMap[p.language] = p;
    });

    const grid = document.getElementById('languageGrid');
    grid.innerHTML = '';

    languages.forEach(lang => {
      const progress = progressMap[lang.name] || { completed: 0, total: 0 };
      const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

      const card = document.createElement('div');
      card.className = 'language-card';
      card.innerHTML = `
        <h2>${lang.name}</h2>
        <div class="progress-info">${progress.completed} / ${progress.total} levels</div>
        <div class="progress-info">${percentage}% complete</div>
      `;
      card.addEventListener('click', () => selectLanguage(lang.id, lang.name));
      grid.appendChild(card);
    });

    showScreen('language');
  } catch (error) {
    alert('Error loading languages');
    console.error(error);
  }
}

// Select language and show map
async function selectLanguage(langId, langName) {
  state.currentLanguageId = langId;
  state.currentLanguageName = langName;
  document.getElementById('currentLanguage').textContent = langName;

  try {
    const response = await fetch(`${API_URL}/api/languages/${langId}/levels?userId=${state.userId}`);
    state.levels = await response.json();

    renderMap();
    updateProgressBar();
    showScreen('map');
  } catch (error) {
    alert('Error loading levels');
    console.error(error);
  }
}

// Render the map
function renderMap() {
  const container = document.getElementById('mapContainer');
  container.innerHTML = '<div class="level-path"></div>';
  const path = container.querySelector('.level-path');

  state.levels.forEach((level, index) => {
    const isLocked = index > 0 && !state.levels[index - 1].completed;
    
    const node = document.createElement('div');
    node.className = `level-node ${level.completed ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
    
    node.innerHTML = `
      <div class="level-icon">${level.level_number}</div>
      <div class="level-info">
        <h3>${level.title}</h3>
        <p>${level.description}</p>
      </div>
      <div class="level-status">${level.completed ? '✓' : (isLocked ? '🔒' : '○')}</div>
    `;

    if (!isLocked && !level.completed) {
      node.addEventListener('click', () => startLevel(level));
    }

    path.appendChild(node);
  });
}

// Update progress bar
function updateProgressBar() {
  const completed = state.levels.filter(l => l.completed).length;
  const total = state.levels.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById('progressFill').style.width = `${percentage}%`;
  document.getElementById('progressText').textContent = `${percentage}% (${completed}/${total})`;
}

// Start level (show question)
async function startLevel(level) {
  try {
    const response = await fetch(`${API_URL}/api/levels/${level.id}/question`);
    const question = await response.json();

    if (question && question.question) {
      showQuestionModal(level, question);
    } else {
      alert('No questions available for this level');
    }
  } catch (error) {
    alert('Error loading question');
    console.error(error);
  }
}

// Show question modal
function showQuestionModal(level, question) {
  const modal = document.getElementById('questionModal');
  document.getElementById('questionText').textContent = question.question;
  document.getElementById('answerInput').value = '';
  document.getElementById('feedbackText').textContent = '';
  document.getElementById('feedbackText').className = 'feedback';

  modal.classList.add('active');
  document.getElementById('answerInput').focus();

  // Store current question data
  modal.dataset.levelId = level.id;
  modal.dataset.questionId = question.id;
}

// Close modal
function closeModal() {
  const modal = document.getElementById('questionModal');
  modal.classList.remove('active');
}

// Submit answer
async function submitAnswer() {
  const modal = document.getElementById('questionModal');
  const levelId = modal.dataset.levelId;
  const questionId = modal.dataset.questionId;
  const answer = document.getElementById('answerInput').value.trim();

  if (!answer) {
    alert('Please enter an answer');
    return;
  }

  const feedback = document.getElementById('feedbackText');

  try {
    const response = await fetch(`${API_URL}/api/submit-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.userId,
        levelId,
        questionId,
        answer
      })
    });

    const result = await response.json();

    if (result.correct) {
      feedback.textContent = '✓ ' + result.message;
      feedback.className = 'feedback correct';

      // Update level in state
      const level = state.levels.find(l => l.id == levelId);
      if (level) {
        level.completed = 1;
      }

      // Close modal and refresh map after a delay
      setTimeout(() => {
        closeModal();
        renderMap();
        updateProgressBar();
      }, 1500);
    } else {
      feedback.textContent = '✗ ' + result.message;
      feedback.className = 'feedback incorrect';
    }
  } catch (error) {
    alert('Error submitting answer');
    console.error(error);
  }
}

// Show leaderboard
async function showLeaderboard() {
  try {
    const response = await fetch(`${API_URL}/api/leaderboard`);
    const leaderboard = await response.json();

    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    if (leaderboard.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No data available</td></tr>';
    } else {
      // Group by user and language
      const grouped = {};
      leaderboard.forEach(entry => {
        if (!entry.language) return;
        const key = `${entry.name}-${entry.language}`;
        if (!grouped[key]) {
          grouped[key] = entry;
        }
      });

      // Convert to array and sort
      const sorted = Object.values(grouped).sort((a, b) => {
        const aPercentage = a.total_levels > 0 ? a.completed_levels / a.total_levels : 0;
        const bPercentage = b.total_levels > 0 ? b.completed_levels / b.total_levels : 0;
        return bPercentage - aPercentage;
      });

      sorted.forEach((entry, index) => {
        const rank = index + 1;
        const percentage = entry.total_levels > 0 
          ? Math.round((entry.completed_levels / entry.total_levels) * 100) 
          : 0;

        let rankClass = '';
        if (rank === 1) rankClass = 'gold';
        else if (rank === 2) rankClass = 'silver';
        else if (rank === 3) rankClass = 'bronze';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="rank ${rankClass}">${rank}</td>
          <td>${entry.name}</td>
          <td>${entry.language}</td>
          <td>${entry.completed_levels} / ${entry.total_levels}</td>
          <td>${percentage}%</td>
        `;
        tbody.appendChild(row);
      });
    }

    showScreen('leaderboard');
  } catch (error) {
    alert('Error loading leaderboard');
    console.error(error);
  }
}

// Show screen helper
function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
}
