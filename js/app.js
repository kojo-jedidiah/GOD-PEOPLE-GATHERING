/* GOD PEOPLE GATHERING - Main Application Logic */

// ========== AUTH ==========
const AUTH_KEY = 'gpg_users';
const SESSION_KEY = 'gpg_session';
const BOOK_KEY = 'gpg_inspired_book';
const VERSE_DATE_KEY = 'gpg_verse_date';
const VERSE_KEY = 'gpg_daily_verse';
const AFFIRM_DATE_KEY = 'gpg_affirm_date';
const AFFIRM_KEY = 'gpg_daily_affirm';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function setSession(user) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, name: user.name }));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  updateNavAuth();
}

function signup(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, message: 'An account with this email already exists.' };
  }
  if (password.length < 6) {
    return { ok: false, message: 'Password must be at least 6 characters.' };
  }
  users.push({ name, email, password }); // simple demo - not production secure
  saveUsers(users);
  setSession({ name, email });
  return { ok: true, message: 'Welcome to GOD PEOPLE GATHERING!' };
}

function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return { ok: false, message: 'Invalid email or password.' };
  }
  setSession(user);
  return { ok: true, message: 'Welcome back!' };
}

function logout() {
  setSession(null);
  window.location.href = 'index.html';
}

function updateNavAuth() {
  const session = getSession();
  const authLinks = document.querySelectorAll('[data-auth]');
  const guestLinks = document.querySelectorAll('[data-guest]');
  const memberName = document.querySelectorAll('[data-member-name]');

  if (session) {
    authLinks.forEach(el => el.classList.remove('hidden'));
    guestLinks.forEach(el => el.classList.add('hidden'));
    memberName.forEach(el => { el.textContent = session.name; });
  } else {
    authLinks.forEach(el => el.classList.add('hidden'));
    guestLinks.forEach(el => el.classList.remove('hidden'));
  }
}

// ========== DAILY AFFIRMATIONS & VERSES ==========
const AFFIRMATIONS = [
  "God's love for you is everlasting and unchanging.",
  "You are fearfully and wonderfully made in His image.",
  "The Lord is your strength and your shield today.",
  "Walk by faith, not by sight — He goes before you.",
  "His mercies are new every morning. Great is His faithfulness.",
  "You are a child of the Most High God. Walk in that identity.",
  "Nothing can separate you from the love of God in Christ Jesus.",
  "Be still and know that He is God — He is in control.",
  "The joy of the Lord is your strength today.",
  "Cast all your cares upon Him, for He cares for you.",
  "You are more than a conqueror through Him who loves you.",
  "His plans for you are plans for good and a hope-filled future.",
  "Let the peace of Christ rule in your heart.",
  "God is working all things together for your good.",
  "You are called, chosen, and set apart for His purpose."
];

const VERSE_REFS = [
  "John 3:16", "Psalm 23:1", "Philippians 4:13", "Jeremiah 29:11",
  "Romans 8:28", "Isaiah 40:31", "Matthew 11:28", "Proverbs 3:5-6",
  "Joshua 1:9", "Psalm 46:10", "2 Corinthians 5:17", "Ephesians 2:8-9",
  "Psalm 119:105", "Romans 12:2", "Hebrews 11:1", "Genesis 1:1",
  "John 14:6", "Psalm 91:1", "Isaiah 41:10", "Matthew 6:33"
];

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getDailyAffirmation() {
  const today = getTodayKey();
  const storedDate = localStorage.getItem(AFFIRM_DATE_KEY);
  if (storedDate === today) {
    return localStorage.getItem(AFFIRM_KEY) || AFFIRMATIONS[0];
  }
  // deterministic based on date
  const idx = Math.abs(hashCode(today)) % AFFIRMATIONS.length;
  const text = AFFIRMATIONS[idx];
  localStorage.setItem(AFFIRM_DATE_KEY, today);
  localStorage.setItem(AFFIRM_KEY, text);
  return text;
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

async function getDailyVerse() {
  const today = getTodayKey();
  const storedDate = localStorage.getItem(VERSE_DATE_KEY);
  if (storedDate === today) {
    try {
      return JSON.parse(localStorage.getItem(VERSE_KEY));
    } catch {}
  }
  const idx = Math.abs(hashCode(today + 'verse')) % VERSE_REFS.length;
  const ref = VERSE_REFS[idx];
  try {
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=web`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const verse = {
      reference: data.reference,
      text: data.text.trim().replace(/\n+/g, ' ')
    };
    localStorage.setItem(VERSE_DATE_KEY, today);
    localStorage.setItem(VERSE_KEY, JSON.stringify(verse));
    return verse;
  } catch (e) {
    // fallback
    return {
      reference: "John 3:16",
      text: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life."
    };
  }
}

async function loadRandomVerse() {
  const ref = VERSE_REFS[Math.floor(Math.random() * VERSE_REFS.length)];
  try {
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=web`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return {
      reference: data.reference,
      text: data.text.trim().replace(/\n+/g, ' ')
    };
  } catch {
    return {
      reference: "Psalm 23:1",
      text: "The LORD is my shepherd; I shall not want."
    };
  }
}

// ========== BIBLE READER ==========
const BOOKS = [
  { id: "Genesis", chapters: 50 }, { id: "Exodus", chapters: 40 }, { id: "Leviticus", chapters: 27 },
  { id: "Numbers", chapters: 36 }, { id: "Deuteronomy", chapters: 34 }, { id: "Joshua", chapters: 24 },
  { id: "Judges", chapters: 21 }, { id: "Ruth", chapters: 4 }, { id: "1 Samuel", chapters: 31 },
  { id: "2 Samuel", chapters: 24 }, { id: "1 Kings", chapters: 22 }, { id: "2 Kings", chapters: 25 },
  { id: "1 Chronicles", chapters: 29 }, { id: "2 Chronicles", chapters: 36 }, { id: "Ezra", chapters: 10 },
  { id: "Nehemiah", chapters: 13 }, { id: "Esther", chapters: 10 }, { id: "Job", chapters: 42 },
  { id: "Psalms", chapters: 150 }, { id: "Proverbs", chapters: 31 }, { id: "Ecclesiastes", chapters: 12 },
  { id: "Song of Solomon", chapters: 8 }, { id: "Isaiah", chapters: 66 }, { id: "Jeremiah", chapters: 52 },
  { id: "Lamentations", chapters: 5 }, { id: "Ezekiel", chapters: 48 }, { id: "Daniel", chapters: 12 },
  { id: "Hosea", chapters: 14 }, { id: "Joel", chapters: 3 }, { id: "Amos", chapters: 9 },
  { id: "Obadiah", chapters: 1 }, { id: "Jonah", chapters: 4 }, { id: "Micah", chapters: 7 },
  { id: "Nahum", chapters: 3 }, { id: "Habakkuk", chapters: 3 }, { id: "Zephaniah", chapters: 3 },
  { id: "Haggai", chapters: 2 }, { id: "Zechariah", chapters: 14 }, { id: "Malachi", chapters: 4 },
  { id: "Matthew", chapters: 28 }, { id: "Mark", chapters: 16 }, { id: "Luke", chapters: 24 },
  { id: "John", chapters: 21 }, { id: "Acts", chapters: 28 }, { id: "Romans", chapters: 16 },
  { id: "1 Corinthians", chapters: 16 }, { id: "2 Corinthians", chapters: 13 }, { id: "Galatians", chapters: 6 },
  { id: "Ephesians", chapters: 6 }, { id: "Philippians", chapters: 4 }, { id: "Colossians", chapters: 4 },
  { id: "1 Thessalonians", chapters: 5 }, { id: "2 Thessalonians", chapters: 3 }, { id: "1 Timothy", chapters: 6 },
  { id: "2 Timothy", chapters: 4 }, { id: "Titus", chapters: 3 }, { id: "Philemon", chapters: 1 },
  { id: "Hebrews", chapters: 13 }, { id: "James", chapters: 5 }, { id: "1 Peter", chapters: 5 },
  { id: "2 Peter", chapters: 3 }, { id: "1 John", chapters: 5 }, { id: "2 John", chapters: 1 },
  { id: "3 John", chapters: 1 }, { id: "Jude", chapters: 1 }, { id: "Revelation", chapters: 22 }
];

function populateBookSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = BOOKS.map(b => `<option value="${b.id}">${b.id}</option>`).join('');
}

function populateChapterSelect(bookSelect, chapterSelect) {
  if (!bookSelect || !chapterSelect) return;
  const book = BOOKS.find(b => b.id === bookSelect.value);
  const count = book ? book.chapters : 1;
  chapterSelect.innerHTML = Array.from({ length: count }, (_, i) =>
    `<option value="${i + 1}">${i + 1}</option>`
  ).join('');
}

async function loadChapter(book, chapter) {
  const container = document.getElementById('bible-text');
  if (!container) return;
  container.innerHTML = '<p style="text-align:center;color:#888;">Loading Scripture...</p>';
  try {
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=web`);
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    if (data.verses && data.verses.length) {
      container.innerHTML = data.verses.map(v =>
        `<div class="verse"><span class="verse-num">${v.verse}</span>${v.text.trim()}</div>`
      ).join('');
    } else {
      container.innerHTML = `<p>${data.text || 'No text available.'}</p>`;
    }
  } catch (e) {
    container.innerHTML = '<p style="color:#c62828;">Unable to load this chapter. Please try another or check your connection.</p>';
  }
}

// ========== QUIZ ==========
const QUIZ_QUESTIONS = [
  {
    q: "Who built the ark according to God's command?",
    options: ["Abraham", "Noah", "Moses", "David"],
    answer: 1
  },
  {
    q: "What covenant sign did God give Noah?",
    options: ["Circumcision", "The rainbow", "The Sabbath", "The Passover"],
    answer: 1
  },
  {
    q: "To whom did God promise that his descendants would be as numerous as the stars?",
    options: ["Moses", "Elijah", "Abraham", "Solomon"],
    answer: 2
  },
  {
    q: "Who led the Israelites out of Egypt?",
    options: ["Joshua", "Aaron", "Moses", "Caleb"],
    answer: 2
  },
  {
    q: "Which prophet was taken up to heaven in a whirlwind?",
    options: ["Elisha", "Elijah", "Isaiah", "Jeremiah"],
    answer: 1
  },
  {
    q: "Who was known as a man after God's own heart?",
    options: ["Saul", "Solomon", "David", "Samuel"],
    answer: 2
  },
  {
    q: "Who asked God for wisdom and received great riches as well?",
    options: ["David", "Solomon", "Hezekiah", "Josiah"],
    answer: 1
  },
  {
    q: "What is the New Covenant centered on?",
    options: ["The Law of Moses", "The sacrifice of Jesus Christ", "Temple worship", "Animal sacrifices"],
    answer: 1
  },
  {
    q: "Jesus said, 'I am the way, the truth, and the ___.'",
    options: ["light", "life", "door", "shepherd"],
    answer: 1
  },
  {
    q: "According to John 3:16, God gave His only Son so that whoever believes in Him should not perish but have ___ life.",
    options: ["happy", "long", "eternal", "peaceful"],
    answer: 2
  }
];

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container) return;
  container.innerHTML = QUIZ_QUESTIONS.map((item, i) => `
    <div class="quiz-question" data-index="${i}">
      <p><strong>Q${i + 1}.</strong> ${item.q}</p>
      <ul class="quiz-options">
        ${item.options.map((opt, j) => `
          <li>
            <label>
              <input type="radio" name="q${i}" value="${j}">
              ${opt}
            </label>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('') + `
    <div class="text-center mt-2">
      <button class="btn btn-primary" onclick="submitQuiz()">Submit Quiz</button>
    </div>
    <div id="quiz-result" class="quiz-result"></div>
  `;
}

function submitQuiz() {
  let score = 0;
  QUIZ_QUESTIONS.forEach((item, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if (selected && parseInt(selected.value) === item.answer) score++;
  });
  const result = document.getElementById('quiz-result');
  result.style.display = 'block';
  const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
  if (pct >= 70) {
    result.className = 'quiz-result correct';
    result.innerHTML = `Well done! You scored ${score}/${QUIZ_QUESTIONS.length} (${pct}%). Keep studying God's Word!`;
  } else {
    result.className = 'quiz-result incorrect';
    result.innerHTML = `You scored ${score}/${QUIZ_QUESTIONS.length} (${pct}%). Review the Newsletter stories and try again!`;
  }
}

// ========== BOOK UPLOAD ==========
function getBookData() {
  try {
    return JSON.parse(localStorage.getItem(BOOK_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveBookData(data) {
  localStorage.setItem(BOOK_KEY, JSON.stringify(data));
}

function handleBookUpload(file) {
  if (!file || file.type !== 'application/pdf') {
    alert('Please upload a PDF file only.');
    return;
  }
  if (file.size > 4 * 1024 * 1024) { // ~4MB limit for localStorage safety
    alert('File is too large. Please use a PDF under 4MB for this demo.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = {
      name: file.name,
      dataUrl: e.target.result,
      uploadedAt: new Date().toISOString()
    };
    saveBookData(data);
    renderBookSection();
  };
  reader.readAsDataURL(file);
}

function renderBookSection() {
  const uploadArea = document.getElementById('upload-area');
  const downloadArea = document.getElementById('download-area');
  if (!uploadArea || !downloadArea) return;

  const book = getBookData();
  if (book) {
    uploadArea.classList.add('hidden');
    downloadArea.classList.remove('hidden');
    document.getElementById('book-filename').textContent = book.name;
    const dlBtn = document.getElementById('download-btn');
    dlBtn.href = book.dataUrl;
    dlBtn.download = book.name;
  } else {
    uploadArea.classList.remove('hidden');
    downloadArea.classList.add('hidden');
  }
}

// ========== NAV TOGGLE ==========
function initNav() {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
  // close on link click (mobile)
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
  updateNavAuth();
}

// ========== PAGE INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  initNav();

  // Home dashboard
  const affirmEl = document.getElementById('daily-affirmation');
  if (affirmEl) {
    affirmEl.textContent = getDailyAffirmation();
  }

  const verseEl = document.getElementById('daily-verse');
  const verseRefEl = document.getElementById('daily-verse-ref');
  if (verseEl) {
    getDailyVerse().then(v => {
      verseEl.textContent = `"${v.text}"`;
      if (verseRefEl) verseRefEl.textContent = `— ${v.reference}`;
    });
  }

  const randomBtn = document.getElementById('random-verse-btn');
  if (randomBtn) {
    randomBtn.addEventListener('click', async () => {
      randomBtn.disabled = true;
      randomBtn.textContent = 'Loading...';
      const v = await loadRandomVerse();
      if (verseEl) verseEl.textContent = `"${v.text}"`;
      if (verseRefEl) verseRefEl.textContent = `— ${v.reference}`;
      randomBtn.disabled = false;
      randomBtn.textContent = 'Generate Another Verse';
    });
  }

  // Auth forms
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const result = signup(name, email, password);
      const msg = document.getElementById('signup-message');
      msg.style.display = 'block';
      msg.style.color = result.ok ? 'var(--success)' : 'var(--error)';
      msg.textContent = result.message;
      if (result.ok) {
        setTimeout(() => window.location.href = 'index.html', 1200);
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const result = login(email, password);
      const msg = document.getElementById('login-message');
      msg.style.display = 'block';
      msg.style.color = result.ok ? 'var(--success)' : 'var(--error)';
      msg.textContent = result.message;
      if (result.ok) {
        setTimeout(() => window.location.href = 'index.html', 1000);
      }
    });
  }

  // Bible School
  const bookSelect = document.getElementById('book-select');
  const chapterSelect = document.getElementById('chapter-select');
  if (bookSelect && chapterSelect) {
    populateBookSelect(bookSelect);
    populateChapterSelect(bookSelect, chapterSelect);
    bookSelect.addEventListener('change', () => populateChapterSelect(bookSelect, chapterSelect));
    document.getElementById('load-chapter-btn')?.addEventListener('click', () => {
      loadChapter(bookSelect.value, chapterSelect.value);
    });
    // load Genesis 1 by default
    loadChapter('Genesis', 1);
  }

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tab)?.classList.add('active');
      if (tab === 'quiz-tab') renderQuiz();
    });
  });

  // Book page
  renderBookSection();
  const fileInput = document.getElementById('book-file');
  const uploadZone = document.getElementById('upload-zone');
  if (fileInput && uploadZone) {
    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) handleBookUpload(fileInput.files[0]);
    });
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleBookUpload(e.dataTransfer.files[0]);
    });
  }
});
