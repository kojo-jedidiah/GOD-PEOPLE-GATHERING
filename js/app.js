/* GOD PEOPLE GATHERING - Main Application Logic */

const AUTH_KEY = 'gpg_users';
const SESSION_KEY = 'gpg_session';
const BOOK_KEY = 'gpg_inspired_book';
const VERSE_DATE_KEY = 'gpg_verse_date';
const VERSE_KEY = 'gpg_daily_verse';
const AFFIRM_DATE_KEY = 'gpg_affirm_date';
const AFFIRM_KEY = 'gpg_daily_affirm';
const NOTES_KEY = 'gpg_revival_notes';
const QUIZ_INDEX_KEY = 'gpg_quiz_index';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || '[]'); } catch { return []; }
}
function saveUsers(users) { localStorage.setItem(AUTH_KEY, JSON.stringify(users)); }
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function setSession(user) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, name: user.name }));
  else localStorage.removeItem(SESSION_KEY);
  updateNavAuth();
}
function signup(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return { ok: false, message: 'An account with this email already exists.' };
  if (password.length < 6) return { ok: false, message: 'Password must be at least 6 characters.' };
  users.push({ name, email, password });
  saveUsers(users);
  setSession({ name, email });
  return { ok: true, message: 'Welcome to GOD PEOPLE GATHERING!' };
}
function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { ok: false, message: 'Invalid email or password.' };
  setSession(user);
  return { ok: true, message: 'Welcome back!' };
}
function logout() {
  setSession(null);
  window.location.href = 'index.html';
}
function updateNavAuth() {
  const session = getSession();
  document.querySelectorAll('[data-auth]').forEach(el => el.classList.toggle('hidden', !session));
  document.querySelectorAll('[data-guest]').forEach(el => el.classList.toggle('hidden', !!session));
  // Name only on dashboard, not in nav toggles
  document.querySelectorAll('[data-member-name]').forEach(el => {
    if (session) el.textContent = session.name;
  });
}

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
  "John 14:6", "Psalm 91:1", "Isaiah 41:10", "Matthew 6:33",
  "Acts 1:8", "Romans 10:9", "Galatians 5:22-23", "1 John 4:7-8"
];

function getTodayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
}
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return h;
}
function getDailyAffirmation() {
  const today = getTodayKey();
  if (localStorage.getItem(AFFIRM_DATE_KEY) === today)
    return localStorage.getItem(AFFIRM_KEY) || AFFIRMATIONS[0];
  const idx = Math.abs(hashCode(today)) % AFFIRMATIONS.length;
  const text = AFFIRMATIONS[idx];
  localStorage.setItem(AFFIRM_DATE_KEY, today);
  localStorage.setItem(AFFIRM_KEY, text);
  return text;
}
async function getDailyVerse() {
  const today = getTodayKey();
  if (localStorage.getItem(VERSE_DATE_KEY) === today) {
    try { return JSON.parse(localStorage.getItem(VERSE_KEY)); } catch {}
  }
  const idx = Math.abs(hashCode(today + 'verse')) % VERSE_REFS.length;
  const ref = VERSE_REFS[idx];
  try {
    const res = await fetch('https://bible-api.com/' + encodeURIComponent(ref) + '?translation=web');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const verse = { reference: data.reference, text: data.text.trim().replace(/\n+/g, ' ') };
    localStorage.setItem(VERSE_DATE_KEY, today);
    localStorage.setItem(VERSE_KEY, JSON.stringify(verse));
    return verse;
  } catch {
    return { reference: 'John 3:16', text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.' };
  }
}
async function loadRandomVerse() {
  const ref = VERSE_REFS[Math.floor(Math.random() * VERSE_REFS.length)];
  try {
    const res = await fetch('https://bible-api.com/' + encodeURIComponent(ref) + '?translation=web');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return { reference: data.reference, text: data.text.trim().replace(/\n+/g, ' ') };
  } catch {
    return { reference: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want.' };
  }
}

const BOOKS = [
  { id: 'Genesis', chapters: 50 }, { id: 'Exodus', chapters: 40 }, { id: 'Leviticus', chapters: 27 },
  { id: 'Numbers', chapters: 36 }, { id: 'Deuteronomy', chapters: 34 }, { id: 'Joshua', chapters: 24 },
  { id: 'Judges', chapters: 21 }, { id: 'Ruth', chapters: 4 }, { id: '1 Samuel', chapters: 31 },
  { id: '2 Samuel', chapters: 24 }, { id: '1 Kings', chapters: 22 }, { id: '2 Kings', chapters: 25 },
  { id: '1 Chronicles', chapters: 29 }, { id: '2 Chronicles', chapters: 36 }, { id: 'Ezra', chapters: 10 },
  { id: 'Nehemiah', chapters: 13 }, { id: 'Esther', chapters: 10 }, { id: 'Job', chapters: 42 },
  { id: 'Psalms', chapters: 150 }, { id: 'Proverbs', chapters: 31 }, { id: 'Ecclesiastes', chapters: 12 },
  { id: 'Song of Solomon', chapters: 8 }, { id: 'Isaiah', chapters: 66 }, { id: 'Jeremiah', chapters: 52 },
  { id: 'Lamentations', chapters: 5 }, { id: 'Ezekiel', chapters: 48 }, { id: 'Daniel', chapters: 12 },
  { id: 'Hosea', chapters: 14 }, { id: 'Joel', chapters: 3 }, { id: 'Amos', chapters: 9 },
  { id: 'Obadiah', chapters: 1 }, { id: 'Jonah', chapters: 4 }, { id: 'Micah', chapters: 7 },
  { id: 'Nahum', chapters: 3 }, { id: 'Habakkuk', chapters: 3 }, { id: 'Zephaniah', chapters: 3 },
  { id: 'Haggai', chapters: 2 }, { id: 'Zechariah', chapters: 14 }, { id: 'Malachi', chapters: 4 },
  { id: 'Matthew', chapters: 28 }, { id: 'Mark', chapters: 16 }, { id: 'Luke', chapters: 24 },
  { id: 'John', chapters: 21 }, { id: 'Acts', chapters: 28 }, { id: 'Romans', chapters: 16 },
  { id: '1 Corinthians', chapters: 16 }, { id: '2 Corinthians', chapters: 13 }, { id: 'Galatians', chapters: 6 },
  { id: 'Ephesians', chapters: 6 }, { id: 'Philippians', chapters: 4 }, { id: 'Colossians', chapters: 4 },
  { id: '1 Thessalonians', chapters: 5 }, { id: '2 Thessalonians', chapters: 3 }, { id: '1 Timothy', chapters: 6 },
  { id: '2 Timothy', chapters: 4 }, { id: 'Titus', chapters: 3 }, { id: 'Philemon', chapters: 1 },
  { id: 'Hebrews', chapters: 13 }, { id: 'James', chapters: 5 }, { id: '1 Peter', chapters: 5 },
  { id: '2 Peter', chapters: 3 }, { id: '1 John', chapters: 5 }, { id: '2 John', chapters: 1 },
  { id: '3 John', chapters: 1 }, { id: 'Jude', chapters: 1 }, { id: 'Revelation', chapters: 22 }
];

function populateBookSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = BOOKS.map(b => '<option value="' + b.id + '">' + b.id + '</option>').join('');
}
function populateChapterSelect(bookSelect, chapterSelect) {
  if (!bookSelect || !chapterSelect) return;
  const book = BOOKS.find(b => b.id === bookSelect.value);
  const count = book ? book.chapters : 1;
  chapterSelect.innerHTML = Array.from({ length: count }, function(_, i) {
    return '<option value="' + (i + 1) + '">' + (i + 1) + '</option>';
  }).join('');
}
async function loadChapter(book, chapter) {
  const container = document.getElementById('bible-text');
  if (!container) return;
  container.innerHTML = '<p style="text-align:center;color:#94a3b8;">Loading Scripture...</p>';
  try {
    const res = await fetch('https://bible-api.com/' + encodeURIComponent(book) + '+' + chapter + '?translation=web');
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    if (data.verses && data.verses.length) {
      container.innerHTML = data.verses.map(function(v) {
        return '<div class="verse"><span class="verse-num">' + v.verse + '</span>' + v.text.trim() + '</div>';
      }).join('');
    } else {
      container.innerHTML = '<p>' + (data.text || 'No text available.') + '</p>';
    }
  } catch {
    container.innerHTML = '<p style="color:#f87171;">Unable to load this chapter. Please try another.</p>';
  }
}

/* ========== ROTATIONAL BIBLE STUDY (4-week cycle by day of week) ========== */
const WEEKLY_STUDIES = {
  0: [ // Week A (Sun)
    { title: 'Creation & Purpose', text: 'God created the heavens and the earth and made mankind in His image. Reflect on Genesis 1–2 and your purpose in Him.', ref: 'Genesis 1–2' },
    { title: 'The Fall & Promise', text: 'Sin entered the world, yet God promised a Redeemer. See the first gospel in Genesis 3:15.', ref: 'Genesis 3' },
    { title: 'Noah & the Rainbow', text: 'God judged the earth but saved Noah and established the covenant of the rainbow.', ref: 'Genesis 6–9' },
    { title: 'Abraham’s Call', text: 'Leave your country. God promises land, seed, and blessing to all nations through Abraham.', ref: 'Genesis 12, 15, 17' },
    { title: 'Joseph & Providence', text: 'What others meant for evil, God meant for good. Trust His sovereignty in every season.', ref: 'Genesis 37–50' },
    { title: 'Moses & the Exodus', text: 'God delivers His people with a mighty hand and gives the Law at Sinai.', ref: 'Exodus 1–20' },
    { title: 'Rest & the Sabbath', text: 'God invites His people into rest. Jesus is our true Sabbath rest.', ref: 'Exodus 20:8–11; Hebrews 4' }
  ],
  1: [ // Week B
    { title: 'David the Shepherd King', text: 'A man after God’s heart. From pasture to throne — and the everlasting covenant.', ref: '1 Samuel 16; 2 Samuel 7' },
    { title: 'Solomon’s Wisdom', text: 'Ask for wisdom. God grants it — and warns that faithfulness sustains the kingdom.', ref: '1 Kings 3, 9' },
    { title: 'Elijah on Carmel', text: 'If the LORD is God, follow Him. Fire falls; the people return to the covenant.', ref: '1 Kings 18' },
    { title: 'Isaiah’s Vision', text: 'Holy, holy, holy. A vision of God leads to confession, cleansing, and commission.', ref: 'Isaiah 6' },
    { title: 'Jeremiah’s New Covenant', text: 'The law written on hearts. Full forgiveness is coming.', ref: 'Jeremiah 31:31–34' },
    { title: 'Daniel’s Faithfulness', text: 'In exile, Daniel remains faithful. God is still on the throne of the nations.', ref: 'Daniel 1–6' },
    { title: 'The Suffering Servant', text: 'He was pierced for our transgressions. The gospel in the Old Testament.', ref: 'Isaiah 53' }
  ],
  2: [ // Week C
    { title: 'The Birth of Jesus', text: 'The Word became flesh. Emmanuel — God with us.', ref: 'Luke 1–2; John 1' },
    { title: 'Jesus’ Baptism & Temptation', text: 'The Spirit descends. The Son is tested and overcomes by the Word.', ref: 'Matthew 3–4' },
    { title: 'The Sermon on the Mount', text: 'Kingdom values: blessed are the poor in spirit; love your enemies.', ref: 'Matthew 5–7' },
    { title: 'Parables of the Kingdom', text: 'Seeds, soils, treasure, and the great banquet — hear and respond.', ref: 'Matthew 13; Luke 15' },
    { title: 'The Cross', text: 'It is finished. The New Covenant is sealed in His blood.', ref: 'John 19; Luke 22–23' },
    { title: 'The Resurrection', text: 'He is risen! Death is defeated. Our living hope is secured.', ref: 'Matthew 28; 1 Corinthians 15' },
    { title: 'The Great Commission', text: 'Go and make disciples of all nations. He is with you always.', ref: 'Matthew 28:18–20' }
  ],
  3: [ // Week D
    { title: 'Pentecost & the Spirit', text: 'The Spirit is poured out. Power to witness to the ends of the earth.', ref: 'Acts 1–2' },
    { title: 'Salvation by Grace', text: 'By grace you have been saved through faith — not of works.', ref: 'Ephesians 2:8–9; Romans 3–5' },
    { title: 'The Fruit of the Spirit', text: 'Love, joy, peace… Walk by the Spirit and put to death the deeds of the flesh.', ref: 'Galatians 5' },
    { title: 'The Body of Christ', text: 'One body, many members. Use your gifts to build up the church.', ref: '1 Corinthians 12–13' },
    { title: 'Faith That Works', text: 'Faith without works is dead. Show your faith by your deeds.', ref: 'James 2' },
    { title: 'Hope of Glory', text: 'Christ in you, the hope of glory. Set your mind on things above.', ref: 'Colossians 1:27; 3:1–4' },
    { title: 'The New Heaven & Earth', text: 'Behold, I am making all things new. Come, Lord Jesus.', ref: 'Revelation 21–22' }
  ]
};

function getWeekIndex() {
  // Rolling 4-week cycle based on week of year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
  return week % 4;
}

function getDayIndex() {
  return new Date().getDay(); // 0 Sun - 6 Sat
}

function renderWeeklyStudy() {
  const container = document.getElementById('study-grid');
  if (!container) return;
  const week = getWeekIndex();
  const day = getDayIndex();
  const stories = WEEKLY_STUDIES[week];
  // Show today's primary + all 7 of the current week for browsing
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--blue-soft);margin-bottom:0.5rem;">Week cycle ' + (week + 1) + ' of 4 · Today is <strong style="color:var(--yellow)">' + dayNames[day] + '</strong></p>' +
    stories.map(function(s, i) {
      const isToday = i === day;
      return '<div class="study-card"' + (isToday ? ' style="border-color:var(--yellow);box-shadow:0 0 20px rgba(250,204,21,0.2)"' : '') + '>' +
        '<h4>' + (isToday ? '⭐ Today · ' : '') + dayNames[i] + ': ' + s.title + '</h4>' +
        '<p>' + s.text + '</p>' +
        '<p><strong style="color:var(--blue-soft)">Key Passage:</strong> ' + s.ref + '</p></div>';
    }).join('');
}

/* ========== ENDLESS ROTATIONAL QUIZ ========== */
const QUIZ_BANK = [
  { q: 'Who built the ark according to God\'s command?', options: ['Abraham', 'Noah', 'Moses', 'David'], answer: 1 },
  { q: 'What covenant sign did God give Noah?', options: ['Circumcision', 'The rainbow', 'The Sabbath', 'The Passover'], answer: 1 },
  { q: 'To whom did God promise descendants as numerous as the stars?', options: ['Moses', 'Elijah', 'Abraham', 'Solomon'], answer: 2 },
  { q: 'Who led the Israelites out of Egypt?', options: ['Joshua', 'Aaron', 'Moses', 'Caleb'], answer: 2 },
  { q: 'Which prophet was taken up to heaven in a whirlwind?', options: ['Elisha', 'Elijah', 'Isaiah', 'Jeremiah'], answer: 1 },
  { q: 'Who was known as a man after God\'s own heart?', options: ['Saul', 'Solomon', 'David', 'Samuel'], answer: 2 },
  { q: 'Who asked God for wisdom and received great riches as well?', options: ['David', 'Solomon', 'Hezekiah', 'Josiah'], answer: 1 },
  { q: 'What is the New Covenant centered on?', options: ['The Law of Moses', 'The sacrifice of Jesus Christ', 'Temple worship', 'Animal sacrifices'], answer: 1 },
  { q: 'Jesus said, "I am the way, the truth, and the ___."', options: ['light', 'life', 'door', 'shepherd'], answer: 1 },
  { q: 'According to John 3:16, whoever believes in Him should not perish but have ___ life.', options: ['happy', 'long', 'eternal', 'peaceful'], answer: 2 },
  { q: 'Where was Jesus born?', options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Capernaum'], answer: 2 },
  { q: 'How many days was Jesus in the tomb before rising?', options: ['One', 'Two', 'Three', 'Seven'], answer: 2 },
  { q: 'Who denied Jesus three times before the rooster crowed?', options: ['Judas', 'Thomas', 'Peter', 'John'], answer: 2 },
  { q: 'What did Jesus turn water into at the wedding in Cana?', options: ['Oil', 'Wine', 'Milk', 'Honey'], answer: 1 },
  { q: 'Who was thrown into the lions\' den?', options: ['Joseph', 'Daniel', 'Jonah', 'Paul'], answer: 1 },
  { q: 'Who was swallowed by a great fish?', options: ['Noah', 'Jonah', 'Peter', 'Job'], answer: 1 },
  { q: 'What is the first book of the Bible?', options: ['Exodus', 'Genesis', 'Matthew', 'Psalms'], answer: 1 },
  { q: 'What is the last book of the Bible?', options: ['Jude', 'Malachi', 'Revelation', 'Acts'], answer: 2 },
  { q: 'Who baptized Jesus?', options: ['Peter', 'John the Baptist', 'Paul', 'Andrew'], answer: 1 },
  { q: 'How many disciples did Jesus choose as apostles?', options: ['7', '10', '12', '70'], answer: 2 },
  { q: 'What fruit of the Spirit is listed first in Galatians 5?', options: ['Joy', 'Peace', 'Love', 'Patience'], answer: 2 },
  { q: 'Who wrote most of the New Testament letters?', options: ['Peter', 'John', 'Paul', 'James'], answer: 2 },
  { q: 'On which mountain did Elijah confront the prophets of Baal?', options: ['Sinai', 'Carmel', 'Zion', 'Olivet'], answer: 1 },
  { q: 'What did God give Moses on Mount Sinai?', options: ['The Ark', 'The Ten Commandments', 'Manna', 'A staff'], answer: 1 },
  { q: 'Who was the mother of Jesus?', options: ['Martha', 'Mary', 'Elizabeth', 'Ruth'], answer: 1 },
  { q: 'What does "Emmanuel" mean?', options: ['God saves', 'God with us', 'Prince of Peace', 'Holy One'], answer: 1 },
  { q: 'Who cut off the ear of the high priest\'s servant?', options: ['John', 'James', 'Peter', 'Thomas'], answer: 2 },
  { q: 'How many days did God take to create the world (before resting)?', options: ['5', '6', '7', '40'], answer: 1 },
  { q: 'What river was Jesus baptized in?', options: ['Nile', 'Euphrates', 'Jordan', 'Tigris'], answer: 2 },
  { q: 'Who was the first martyr of the early church?', options: ['James', 'Stephen', 'Peter', 'Paul'], answer: 1 },
  { q: 'What did the Holy Spirit appear as on the day of Pentecost?', options: ['A dove only', 'Tongues of fire', 'A cloud', 'Lightning'], answer: 1 },
  { q: 'Faith without works is ___ according to James.', options: ['incomplete', 'dead', 'weak', 'hidden'], answer: 1 },
  { q: 'Who was Abraham\'s wife?', options: ['Rachel', 'Rebekah', 'Sarah', 'Leah'], answer: 2 },
  { q: 'What did God use to speak to Moses in the wilderness?', options: ['A cloud', 'A burning bush', 'A star', 'An angel only'], answer: 1 },
  { q: 'In which city were the disciples first called Christians?', options: ['Jerusalem', 'Rome', 'Antioch', 'Ephesus'], answer: 2 },
  { q: 'Who interpreted Pharaoh\'s dreams in Egypt?', options: ['Daniel', 'Joseph', 'Moses', 'Aaron'], answer: 1 },
  { q: 'What is the greatest commandment according to Jesus?', options: ['Keep the Sabbath', 'Love God with all your heart', 'Honor your parents', 'Do not steal'], answer: 1 },
  { q: 'Who walked on water toward Jesus?', options: ['John', 'Andrew', 'Peter', 'James'], answer: 2 },
  { q: 'How many plagues did God send on Egypt?', options: ['7', '10', '12', '3'], answer: 1 },
  { q: 'What does "Gospel" mean?', options: ['Holy book', 'Good news', 'Law', 'Prophecy'], answer: 1 }
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function getNextQuizBatch(count) {
  count = count || 5;
  let idx = parseInt(localStorage.getItem(QUIZ_INDEX_KEY) || '0', 10);
  const batch = [];
  for (let i = 0; i < count; i++) {
    batch.push(QUIZ_BANK[(idx + i) % QUIZ_BANK.length]);
  }
  idx = (idx + count) % QUIZ_BANK.length;
  localStorage.setItem(QUIZ_INDEX_KEY, String(idx));
  // Shuffle options display order? Keep answer index stable by not shuffling options here
  return batch;
}

let currentQuizBatch = [];

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container) return;
  currentQuizBatch = getNextQuizBatch(5);
  container.innerHTML = currentQuizBatch.map(function(item, i) {
    return '<div class="quiz-question" data-index="' + i + '">' +
      '<p><strong>Q' + (i + 1) + '.</strong> ' + item.q + '</p>' +
      '<ul class="quiz-options">' +
      item.options.map(function(opt, j) {
        return '<li><label><input type="radio" name="q' + i + '" value="' + j + '"> ' + opt + '</label></li>';
      }).join('') +
      '</ul></div>';
  }).join('') +
  '<div class="text-center mt-2">' +
  '<button class="btn btn-primary" onclick="submitQuiz()">Check Answers</button> ' +
  '<button class="btn btn-outline" onclick="renderQuiz()" style="margin-left:0.5rem">Next 5 Questions →</button>' +
  '</div><div id="quiz-result" class="quiz-result"></div>';
}

function submitQuiz() {
  let score = 0;
  currentQuizBatch.forEach(function(item, i) {
    const selected = document.querySelector('input[name="q' + i + '"]:checked');
    if (selected && parseInt(selected.value, 10) === item.answer) score++;
  });
  const result = document.getElementById('quiz-result');
  result.style.display = 'block';
  const pct = Math.round((score / currentQuizBatch.length) * 100);
  if (pct >= 70) {
    result.className = 'quiz-result correct';
    result.innerHTML = 'Well done! You scored ' + score + '/' + currentQuizBatch.length + ' (' + pct + '%). Keep going — click Next 5 Questions for more!';
  } else {
    result.className = 'quiz-result incorrect';
    result.innerHTML = 'You scored ' + score + '/' + currentQuizBatch.length + ' (' + pct + '%). Review the Newsletter & Study, then try the next batch!';
  }
}

/* Book */
function getBookData() {
  try { return JSON.parse(localStorage.getItem(BOOK_KEY) || 'null'); } catch { return null; }
}
function saveBookData(data) { localStorage.setItem(BOOK_KEY, JSON.stringify(data)); }
function handleBookUpload(file) {
  if (!file || file.type !== 'application/pdf') { alert('Please upload a PDF file only.'); return; }
  if (file.size > 4 * 1024 * 1024) { alert('File too large (max ~4MB for this demo).'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    saveBookData({ name: file.name, dataUrl: e.target.result, uploadedAt: new Date().toISOString() });
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

/* Revival notes */
function loadRevivalNotes() {
  try {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    ['thu', 'fri', 'sat'].forEach(function(day) {
      const el = document.getElementById('notes-' + day);
      if (el && notes[day]) el.value = notes[day];
    });
  } catch {}
}
function saveRevivalNote(day, value) {
  try {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    notes[day] = value;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {}
}

function initNav() {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function() { links.classList.toggle('open'); });
  }
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.addEventListener('click', function() { if (links) links.classList.remove('open'); });
  });
  updateNavAuth();
}

document.addEventListener('DOMContentLoaded', function() {
  initNav();

  const affirmEl = document.getElementById('daily-affirmation');
  if (affirmEl) affirmEl.textContent = getDailyAffirmation();

  const verseEl = document.getElementById('daily-verse');
  const verseRefEl = document.getElementById('daily-verse-ref');
  if (verseEl) {
    getDailyVerse().then(function(v) {
      verseEl.textContent = '"' + v.text + '"';
      if (verseRefEl) verseRefEl.textContent = '— ' + v.reference;
    });
  }

  const randomBtn = document.getElementById('random-verse-btn');
  if (randomBtn) {
    randomBtn.addEventListener('click', async function() {
      randomBtn.disabled = true;
      randomBtn.textContent = 'Loading...';
      const v = await loadRandomVerse();
      if (verseEl) verseEl.textContent = '"' + v.text + '"';
      if (verseRefEl) verseRefEl.textContent = '— ' + v.reference;
      randomBtn.disabled = false;
      randomBtn.textContent = 'Generate Another Verse';
    });
  }

  // Dashboard name welcome
  const welcome = document.getElementById('member-welcome');
  const session = getSession();
  if (welcome) {
    if (session) {
      welcome.classList.remove('hidden');
      welcome.innerHTML = 'Welcome to your <strong>Dashboard</strong>, ' + session.name + '!';
    } else {
      welcome.classList.add('hidden');
    }
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const result = signup(
        document.getElementById('signup-name').value.trim(),
        document.getElementById('signup-email').value.trim(),
        document.getElementById('signup-password').value
      );
      const msg = document.getElementById('signup-message');
      msg.style.display = 'block';
      msg.style.color = result.ok ? 'var(--success)' : 'var(--error)';
      msg.textContent = result.message;
      if (result.ok) setTimeout(function() { window.location.href = 'index.html'; }, 1200);
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const result = login(
        document.getElementById('login-email').value.trim(),
        document.getElementById('login-password').value
      );
      const msg = document.getElementById('login-message');
      msg.style.display = 'block';
      msg.style.color = result.ok ? 'var(--success)' : 'var(--error)';
      msg.textContent = result.message;
      if (result.ok) setTimeout(function() { window.location.href = 'index.html'; }, 1000);
    });
  }

  const bookSelect = document.getElementById('book-select');
  const chapterSelect = document.getElementById('chapter-select');
  if (bookSelect && chapterSelect) {
    populateBookSelect(bookSelect);
    populateChapterSelect(bookSelect, chapterSelect);
    bookSelect.addEventListener('change', function() { populateChapterSelect(bookSelect, chapterSelect); });
    document.getElementById('load-chapter-btn') && document.getElementById('load-chapter-btn').addEventListener('click', function() {
      loadChapter(bookSelect.value, chapterSelect.value);
    });
    loadChapter('Genesis', 1);
  }

  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
      btn.classList.add('active');
      const el = document.getElementById(tab);
      if (el) el.classList.add('active');
      if (tab === 'quiz-tab') renderQuiz();
      if (tab === 'study-tab') renderWeeklyStudy();
    });
  });

  if (document.getElementById('study-grid')) renderWeeklyStudy();
  if (document.getElementById('quiz-container')) renderQuiz();

  renderBookSection();
  const fileInput = document.getElementById('book-file');
  const uploadZone = document.getElementById('upload-zone');
  if (fileInput && uploadZone) {
    uploadZone.addEventListener('click', function() { fileInput.click(); });
    fileInput.addEventListener('change', function() {
      if (fileInput.files[0]) handleBookUpload(fileInput.files[0]);
    });
    uploadZone.addEventListener('dragover', function(e) { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', function() { uploadZone.classList.remove('dragover'); });
    uploadZone.addEventListener('drop', function(e) {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleBookUpload(e.dataTransfer.files[0]);
    });
  }

  loadRevivalNotes();
  ['thu', 'fri', 'sat'].forEach(function(day) {
    const el = document.getElementById('notes-' + day);
    if (el) {
      el.addEventListener('input', function() { saveRevivalNote(day, el.value); });
    }
  });
});
