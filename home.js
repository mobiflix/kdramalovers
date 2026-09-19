const API_KEY = 'e0a7266a5d0e95c36475f349d8bc0a5a';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
const IMG_W500 = 'https://image.tmdb.org/t/p/w500';
const IMG_PROFILE = 'https://image.tmdb.org/t/p/w185';

// ===== STORAGE KEYS =====
const HISTORY_KEY = 'mobiflix_watch_history';
const THEME_KEY = 'mobiflix_theme';
const NOTIF_KEY = 'mobiflix_notifications';
const NOTIF_ENABLED_KEY = 'mobiflix_notif_enabled';
const CONTINUE_KEY = 'mobiflix_continue_watching';
const EPISODE_PROGRESS_KEY = 'mobiflix_episode_progress';
const MAX_HISTORY = 30;
const MAX_CONTINUE = 10;

// ===== KOREAN ONLY CONFIG =====
const KOREAN_COUNTRY = 'KR';
const KOREAN_LANG = 'ko';

// EXCLUDE: Reality (10764), Talk (10767), News (10763), Soap (10766)
const EXCLUDED_GENRES = '10764,10767,10763,10766';

// ===== STREAMING PROVIDERS =====
const STREAMING_PROVIDERS = [
  { name: 'Netflix', id: 8, type: 'provider', color: '#e50914' },
  { name: 'Disney+', id: 337, type: 'provider', color: '#113ccf' },
  { name: 'Amazon Prime Video', id: 9, type: 'provider', color: '#00a8e1' },
  { name: 'Apple TV+', id: 350, type: 'provider', color: '#1c1c1e' },
  { name: 'Viki', id: 415, type: 'provider', color: '#0d6efd' },
  { name: 'Kocowa', id: 444, type: 'provider', color: '#ff6b00' },
  { name: 'Crunchyroll', id: 283, type: 'provider', color: '#f47521' }
];

const PROVIDER_LOGOS = {
  'Netflix': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  'Disney+': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
  'Amazon Prime Video': 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo_%282022%29.svg',
  'Apple TV+': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
  'Viki': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Viki_logo.svg',
  'Kocowa': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Kocowa_logo.svg',
  'Crunchyroll': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.svg'
};

// ===== PLAYER URLS =====
const PLAYER_MOVIE = 'https://vidstuck.xyz/embed/movie/';
const PLAYER_TV = 'https://vidstuck.xyz/embed/tv/';

// ===== KOREAN GENRE LIST =====
const GENRE_LIST = [
  { id: 18,    name: 'Drama',            icon: '🎭', media: 'tv' },
  { id: 10749, name: 'Romance',          icon: '💕', media: 'tv' },
  { id: 35,    name: 'Comedy',           icon: '😂', media: 'tv' },
  { id: 53,    name: 'Thriller',         icon: '😱', media: 'tv' },
  { id: 9648,  name: 'Mystery',          icon: '🔍', media: 'tv' },
  { id: 10765, name: 'Sci-Fi & Fantasy', icon: '✨', media: 'tv' },
  { id: 10759, name: 'Action & Adventure', icon: '💥', media: 'tv' },
  { id: 99,    name: 'Documentary',      icon: '📄', media: 'tv' },
  { id: 36,    name: 'History',          icon: '📜', media: 'tv' },
  { id: 10751, name: 'Family',           icon: '👨‍👩‍👧', media: 'tv' },
  { id: 27,    name: 'Horror',           icon: '👻', media: 'tv' },
  { id: 28,    name: 'Action',           icon: '💥', media: 'movie' },
  { id: 12,    name: 'Adventure',        icon: '🗺️', media: 'movie' },
  { id: 80,    name: 'Crime',            icon: '🕵️', media: 'movie' },
  { id: 14,    name: 'Fantasy',          icon: '🧙', media: 'movie' },
  { id: 878,   name: 'Sci-Fi',           icon: '🚀', media: 'movie' }
];

const COUNTRY_LIST = [
  { code: '',    name: 'All Countries' },
  { code: 'KR',  name: 'South Korea' }
];

let currentItem;
let bannerItem;
let currentTvId = null;
let currentTrailerKey = null;

// ============================================================
// HISTORY / LAYER MANAGEMENT
// ============================================================

let layerStack = [];

function pushLayer(type, data) {
  layerStack.push({ type: type, data: data || null });
  history.pushState({ mobiflixLayer: layerStack.length, type: type }, '');
}

function popLayer() {
  if (layerStack.length === 0) return null;
  const layer = layerStack.pop();
  closeLayerByType(layer.type, layer.data);
  return layer;
}

function closeLayerByType(type, data) {
  switch (type) {
    case 'modal': closeModalOnly(); break;
    case 'view-all': closeAllPagesOnly(); setActiveNav('home'); break;
    case 'genre': closeAllPagesOnly(); setActiveNav('more'); break;
    case 'ongoing': closeAllPagesOnly(); setActiveNav('home'); break;
    case 'completed': closeAllPagesOnly(); setActiveNav('home'); break;
    case 'provider': closeAllPagesOnly(); setActiveNav('home'); break;
    case 'my-list': closeAllPagesOnly(); setActiveNav('home'); break;
    case 'more': closeAllPagesOnly(); setActiveNav('home'); break;
    case 'person': closeAllPagesOnly(); setActiveNav('home'); break;
    case 'search': closeAllPagesOnly(); setActiveNav('home'); break;
    case 'profile': closeAllPagesOnly(); setActiveNav('home'); break;
    default: closeAllPagesOnly(); setActiveNav('home');
  }
}

history.replaceState({ mobiflixHome: true }, '', '#home');
history.pushState({ mobiflixTrap: false }, '', '#home');
history.pushState({ mobiflixHome: true }, '', '#home');

let exitConfirmActive = false;

window.addEventListener('popstate', function(e) {
  if (layerStack.length > 0) {
    const layer = layerStack.pop();
    closeLayerByType(layer.type, layer.data);
    return;
  }
  if (exitConfirmActive) return;
  exitConfirmActive = true;
  const wantExit = confirm('Do you want to exit?');
  if (wantExit) {
    exitConfirmActive = false;
    history.back();
  } else {
    history.pushState({ mobiflixHome: true }, '', '#home');
    exitConfirmActive = false;
  }
});

// ============================================================
// PAGE STATES
// ============================================================

let viewAllState = { key: null, page: 1, maxPages: 500, loading: false, hasMore: true, initialized: false, seenIds: new Set(), filters: {} };
let providerPageState = { providerId: null, providerName: '', providerType: 'provider', page: 1, batchCount: 0, maxPages: 500, loading: false, hasMore: true, initialized: false, seenIds: new Set(), filters: {} };
let genrePageState = {};
let ongoingPageState = {};
let completedPageState = {};
let personPageState = { page: 1, maxPages: 500, loading: false, hasMore: true, initialized: false, seenIds: new Set(), personId: null, personName: '' };

// ============================================================
// SNOW EFFECT
// ============================================================

function createSnow() {
  var existing = document.getElementById('snow-container');
  if (existing) existing.parentNode.removeChild(existing);

  var container = document.createElement('div');
  container.id = 'snow-container';
  document.body.appendChild(container);

  var snowChars = ['❄', '❅', '❆', '•', '*', '❄', '❅'];
  var maxSnowflakes = 60;

  function createSnowflake() {
    if (container.children.length >= maxSnowflakes) return;
    var snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = snowChars[Math.floor(Math.random() * snowChars.length)];
    snowflake.style.left = (Math.random() * 100) + '%';
    var size = Math.random() * 12 + 8;
    snowflake.style.fontSize = size + 'px';
    var duration = Math.random() * 10 + 8;
    snowflake.style.animationDuration = duration + 's';
    var delay = Math.random() * 8;
    snowflake.style.animationDelay = delay + 's';
    snowflake.style.opacity = (Math.random() * 0.5 + 0.5).toFixed(2);
    container.appendChild(snowflake);
    setTimeout(function() {
      if (snowflake.parentNode) snowflake.parentNode.removeChild(snowflake);
    }, (duration + delay) * 1000 + 500);
  }

  function startSnow() {
    createSnowflake();
    var nextDelay = Math.random() * 600 + 300;
    setTimeout(startSnow, nextDelay);
  }

  startSnow();
}

// ============================================================
// POPULATE COUNTRY DROPDOWNS
// ============================================================

function populateCountryDropdowns() {
  const prefixes = ['filter-', 'provider-filter-', 'genre-filter-'];
  prefixes.forEach(function(prefix) {
    const select = document.getElementById(prefix + 'country');
    if (!select) return;
    select.innerHTML = '';
    COUNTRY_LIST.forEach(function(country) {
      const option = document.createElement('option');
      option.value = country.code;
      option.textContent = country.name;
      select.appendChild(option);
    });
  });
}

// ============================================================
// RELEASE FILTER
// ============================================================

function filterReleased(results) {
  const today = new Date().toISOString().split('T')[0];
  return (results || []).filter(function(item) {
    const date = item.release_date || item.first_air_date;
    if (!date) return true;
    return date <= today;
  });
}

function sortByNewest(results) {
  return (results || []).slice().sort(function(a, b) {
    const dateA = a.release_date || a.first_air_date || '';
    const dateB = b.release_date || b.first_air_date || '';
    return dateB.localeCompare(dateA);
  });
}

function filterOutNonDrama(results) {
  return (results || []).filter(function(item) {
    const genres = item.genre_ids || [];
    const hasExcluded = genres.some(function(g) {
      return EXCLUDED_GENRES.split(',').map(Number).includes(g);
    });
    return !hasExcluded;
  });
}

// ============================================================
// KOREAN-ONLY FETCH FUNCTIONS
// ============================================================

async function fetchTop20KoreanSeriesToday(page) {
  const url = `${BASE_URL}/trending/tv/day?api_key=${API_KEY}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  let results = (data.results || []).filter(function(item) {
    return (item.origin_country || []).includes(KOREAN_COUNTRY) ||
           item.original_language === KOREAN_LANG;
  });
  results = filterReleased(results);
  results = filterOutNonDrama(results);
  results.forEach(function(item) { item.media_type = 'tv'; });
  return { results: results, total_pages: data.total_pages || 1 };
}

async function fetchMostWatchedKoreanSeries(page) {
  const today = new Date().toISOString().split('T')[0];
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}` +
    `&with_origin_country=${KOREAN_COUNTRY}` +
    `&with_original_language=${KOREAN_LANG}` +
    `&without_genres=${EXCLUDED_GENRES}` +
    `&sort_by=popularity.desc` +
    `&vote_count.gte=20` +
    `&first_air_date.lte=${today}` +
    `&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  let results = filterReleased(data.results);
  results = filterOutNonDrama(results);
  results.forEach(function(item) { item.media_type = 'tv'; });
  return { results: results, total_pages: data.total_pages || 1 };
}

async function fetchHighestRatedKoreanSeries(page) {
  const today = new Date().toISOString().split('T')[0];
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}` +
    `&with_origin_country=${KOREAN_COUNTRY}` +
    `&with_original_language=${KOREAN_LANG}` +
    `&without_genres=${EXCLUDED_GENRES}` +
    `&sort_by=vote_average.desc` +
    `&vote_count.gte=100` +
    `&first_air_date.lte=${today}` +
    `&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  let results = filterReleased(data.results);
  results = filterOutNonDrama(results);
  results.forEach(function(item) { item.media_type = 'tv'; });
  return { results: results, total_pages: data.total_pages || 1 };
}

async function fetchNewestKoreanSeries(page) {
  const today = new Date().toISOString().split('T')[0];
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}` +
    `&with_origin_country=${KOREAN_COUNTRY}` +
    `&with_original_language=${KOREAN_LANG}` +
    `&without_genres=${EXCLUDED_GENRES}` +
    `&sort_by=first_air_date.desc` +
    `&vote_count.gte=5` +
    `&first_air_date.lte=${today}` +
    `&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  let results = filterReleased(data.results);
  results = filterOutNonDrama(results);
  results = sortByNewest(results);
  results.forEach(function(item) { item.media_type = 'tv'; });
  return { results: results, total_pages: data.total_pages || 1 };
}

async function fetchNewestKoreanMovies(page) {
  const today = new Date().toISOString().split('T')[0];
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}` +
    `&with_origin_country=${KOREAN_COUNTRY}` +
    `&with_original_language=${KOREAN_LANG}` +
    `&sort_by=primary_release_date.desc` +
    `&vote_count.gte=5` +
    `&primary_release_date.lte=${today}` +
    `&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  let results = filterReleased(data.results);
  results = sortByNewest(results);
  results.forEach(function(item) { item.media_type = 'movie'; });
  return { results: results, total_pages: data.total_pages || 1 };
}

async function fetchOngoingKoreanSeries(page) {
  const today = new Date().toISOString().split('T')[0];
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}` +
    `&with_origin_country=${KOREAN_COUNTRY}` +
    `&with_original_language=${KOREAN_LANG}` +
    `&without_genres=${EXCLUDED_GENRES}` +
    `&sort_by=popularity.desc` +
    `&first_air_date.lte=${today}` +
    `&vote_count.gte=20` +
    `&with_status=0|1` +
    `&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  let results = filterReleased(data.results);
  results = filterOutNonDrama(results);
  results.forEach(function(item) { item.media_type = 'tv'; });
  return { results: results, total_pages: data.total_pages || 1 };
}

async function fetchCompletedKoreanSeries(page) {
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}` +
    `&with_origin_country=${KOREAN_COUNTRY}` +
    `&with_original_language=${KOREAN_LANG}` +
    `&without_genres=${EXCLUDED_GENRES}` +
    `&sort_by=popularity.desc` +
    `&with_status=3|4` +
    `&vote_count.gte=50` +
    `&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  let results = filterReleased(data.results);
  results = filterOutNonDrama(results);
  results.forEach(function(item) { item.media_type = 'tv'; });
  return { results: results, total_pages: data.total_pages || 1 };
}

async function fetchByGenreKorean(mediaType, genreId, page) {
  const url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}` +
    `&with_genres=${genreId}` +
    `&with_origin_country=${KOREAN_COUNTRY}` +
    `&with_original_language=${KOREAN_LANG}` +
    `&without_genres=${EXCLUDED_GENRES}` +
    `&sort_by=popularity.desc` +
    `&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  let results = filterReleased(data.results);
  results = filterOutNonDrama(results);
  return { results: results, total_pages: data.total_pages || 1 };
}

async function fetchByProviderKorean(providerId, mediaType, page) {
  const url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}` +
    `&with_watch_providers=${providerId}` +
    `&watch_region=KR` +
    `&with_origin_country=${KOREAN_COUNTRY}` +
    `&with_original_language=${KOREAN_LANG}` +
    `&without_genres=${EXCLUDED_GENRES}` +
    `&sort_by=popularity.desc` +
    `&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  let results = filterReleased(data.results);
  results = filterOutNonDrama(results);
  return { results: results, total_pages: data.total_pages || 1 };
}

// ============================================================
// CREDITS / SIMILAR / PERSON
// ============================================================

async function fetchCredits(mediaType, id) {
  try {
    const type = mediaType === 'tv' ? 'tv' : 'movie';
    const res = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`);
    const data = await res.json();
    return (data.cast || []).slice(0, 15);
  } catch (err) { return []; }
}

async function fetchSimilar(mediaType, id) {
  try {
    const type = mediaType === 'tv' ? 'tv' : 'movie';
    let res = await fetch(`${BASE_URL}/${type}/${id}/recommendations?api_key=${API_KEY}`);
    let data = await res.json();
    if (!data.results || data.results.length === 0) {
      res = await fetch(`${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}`);
      data = await res.json();
    }
    let results = (data.results || []).filter(function(item) {
      return (item.origin_country || []).includes(KOREAN_COUNTRY) ||
             item.original_language === KOREAN_LANG;
    });
    results = filterReleased(results);
    results = filterOutNonDrama(results);
    return results.filter(function(x) { return x.poster_path; }).slice(0, 15);
  } catch (err) { return []; }
}

async function fetchPersonCredits(personId, page) {
  try {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}` +
      `&with_cast=${personId}` +
      `&with_origin_country=${KOREAN_COUNTRY}` +
      `&sort_by=popularity.desc` +
      `&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();
    let results = filterReleased(data.results);
    results.forEach(function(item) { item.media_type = 'movie'; });
    return { results: results, total_pages: data.total_pages || 1 };
  } catch (err) { return { results: [], total_pages: 1 }; }
}

async function fetchPersonTvCredits(personId, page) {
  try {
    const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}` +
      `&with_cast=${personId}` +
      `&with_origin_country=${KOREAN_COUNTRY}` +
      `&without_genres=${EXCLUDED_GENRES}` +
      `&sort_by=popularity.desc` +
      `&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();
    let results = filterReleased(data.results);
    results = filterOutNonDrama(results);
    results.forEach(function(item) { item.media_type = 'tv'; });
    return { results: results, total_pages: data.total_pages || 1 };
  } catch (err) { return { results: [], total_pages: 1 }; }
}

// ============================================================
// TRAILER
// ============================================================

async function fetchTrailer(mediaType, id) {
  try {
    const type = mediaType === 'tv' ? 'tv' : 'movie';
    const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
    const data = await res.json();
    const videos = data.results || [];
    const trailer = videos.find(function(v) {
      return v.type === 'Trailer' && v.site === 'YouTube';
    }) || videos.find(function(v) { return v.site === 'YouTube'; });
    return trailer ? trailer.key : null;
  } catch (err) { return null; }
}

function playTrailer() {
  if (!currentTrailerKey) return;
  const url = `https://www.youtube.com/watch?v=${currentTrailerKey}`;
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(function() {});
  }
  window.open(url, '_blank');
}

// ============================================================
// EPISODE PROGRESS
// ============================================================

function getEpisodeProgress() {
  try { return JSON.parse(localStorage.getItem(EPISODE_PROGRESS_KEY)) || {}; }
  catch (e) { return {}; }
}

function saveEpisodeProgress(progress) {
  localStorage.setItem(EPISODE_PROGRESS_KEY, JSON.stringify(progress));
}

function markEpisodeWatched(tvId, seasonNumber, episodeNumber) {
  const progress = getEpisodeProgress();
  progress[`${tvId}_s${seasonNumber}e${episodeNumber}`] = Date.now();
  saveEpisodeProgress(progress);
}

function isEpisodeWatched(tvId, seasonNumber, episodeNumber) {
  const progress = getEpisodeProgress();
  return !!progress[`${tvId}_s${seasonNumber}e${episodeNumber}`];
}

// ============================================================
// WATCH HISTORY
// ============================================================

function getWatchHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch (e) { return []; }
}

function saveWatchHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

function addToHistory(item) {
  if (!item || !item.id) return;
  const list = getWatchHistory();
  const filtered = list.filter(function(x) { return x.id !== item.id; });
  filtered.unshift({
    id: item.id,
    title: item.title || item.name,
    poster_path: item.poster_path,
    media_type: item.media_type || (item.title ? 'movie' : 'tv'),
    vote_average: item.vote_average,
    release_date: item.release_date || item.first_air_date,
    watchedAt: Date.now()
  });
  if (filtered.length > MAX_HISTORY) filtered.length = MAX_HISTORY;
  saveWatchHistory(filtered);
}

function clearHistory() {
  if (confirm('Clear your watch history?')) {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }
}

function renderHistory() {
  const list = getWatchHistory();
  const grid = document.getElementById('history-grid');
  const empty = document.getElementById('history-empty');
  const clearBtn = document.getElementById('clear-history-btn');
  if (!grid) return;
  grid.innerHTML = '';
  if (list.length === 0) {
    empty.style.display = 'block';
    clearBtn.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  clearBtn.style.display = 'inline-flex';
  list.forEach(function(item) {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_W500}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.loading = 'lazy';
    img.onclick = function() {
      closeUserProfile();
      fetchFullDetails(item.id, item.media_type);
    };
    grid.appendChild(img);
  });
}

// ============================================================
// CONTINUE WATCHING
// ============================================================

function getContinueWatching() {
  try { return JSON.parse(localStorage.getItem(CONTINUE_KEY)) || []; }
  catch (e) { return []; }
}

function saveContinueWatching(list) {
  localStorage.setItem(CONTINUE_KEY, JSON.stringify(list));
}

function addToContinueWatching(item) {
  if (!item || !item.id) return;
  const list = getContinueWatching();
  const filtered = list.filter(function(x) { return x.id !== item.id; });
  filtered.unshift({
    id: item.id,
    title: item.title || item.name,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    media_type: item.media_type || (item.title ? 'movie' : 'tv'),
    vote_average: item.vote_average,
    release_date: item.release_date || item.first_air_date,
    progress: Math.floor(Math.random() * 70) + 15,
    watchedAt: Date.now()
  });
  if (filtered.length > MAX_CONTINUE) filtered.length = MAX_CONTINUE;
  saveContinueWatching(filtered);
}

function renderContinueWatching() {
  const list = getContinueWatching();
  const container = document.getElementById('continue-watching-list');
  const row = document.getElementById('continue-watching-row');
  if (!container || !row) return;
  if (list.length === 0) { row.style.display = 'none'; return; }
  row.style.display = 'block';
  container.innerHTML = '';
  list.forEach(function(item) {
    const card = document.createElement('div');
    card.className = 'continue-card';
    card.onclick = function() { fetchFullDetails(item.id, item.media_type); };
    const img = document.createElement('img');
    img.alt = item.title || item.name;
    img.loading = 'lazy';
    if (item.backdrop_path) img.src = `${IMG_W500}${item.backdrop_path}`;
    else if (item.poster_path) img.src = `${IMG_W500}${item.poster_path}`;
    else img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 124" fill="%23222"><rect width="220" height="124"/></svg>';
    const progress = document.createElement('div');
    progress.className = 'continue-progress';
    const progressBar = document.createElement('div');
    progressBar.className = 'continue-progress-bar';
    progressBar.style.width = item.progress + '%';
    progress.appendChild(progressBar);
    const title = document.createElement('div');
    title.className = 'continue-title';
    title.textContent = item.title || item.name;
    const subtitle = document.createElement('div');
    subtitle.className = 'continue-subtitle';
    subtitle.textContent = item.progress + '% watched';
    card.appendChild(img);
    card.appendChild(progress);
    card.appendChild(title);
    card.appendChild(subtitle);
    container.appendChild(card);
  });
}

// ============================================================
// THEMES
// ============================================================

function loadTheme() {
  const theme = localStorage.getItem(THEME_KEY) || 'default';
  applyTheme(theme);
}

function applyTheme(theme) {
  document.body.classList.remove('theme-blue', 'theme-purple', 'theme-green', 'theme-light');
  if (theme === 'light') document.body.classList.add('theme-light');
  else if (theme === 'dark-blue') document.body.classList.add('theme-blue');
  else if (theme === 'dark-purple') document.body.classList.add('theme-purple');
  else if (theme === 'dark-green') document.body.classList.add('theme-green');
  document.querySelectorAll('.theme-option').forEach(function(el) {
    el.classList.remove('active');
    if (el.dataset.theme === theme) el.classList.add('active');
  });
  updateThemeIcon();
}

function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'default';
  setTheme((current === 'light') ? 'default' : 'light');
}

function updateThemeIcon() {
  const theme = localStorage.getItem(THEME_KEY) || 'default';
  const icon = document.getElementById('theme-toggle-icon');
  if (!icon) return;
  icon.className = theme === 'light' ? 'fa fa-sun' : 'fa fa-moon';
}

// ============================================================
// NOTIFICATIONS
// ============================================================

function getNotifications() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY)) || []; }
  catch (e) { return []; }
}

function saveNotifications(list) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
  updateNotifBadge();
}

function isNotifEnabled() {
  return localStorage.getItem(NOTIF_ENABLED_KEY) !== 'false';
}

function toggleNotifications() {
  const toggle = document.getElementById('notif-toggle');
  localStorage.setItem(NOTIF_ENABLED_KEY, toggle.checked ? 'true' : 'false');
  updateNotifBadge();
}

function updateNotifBadge() {
  const list = getNotifications();
  const unread = list.filter(function(n) { return !n.read; });
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  if (unread.length > 0 && isNotifEnabled()) {
    badge.textContent = unread.length > 9 ? '9+' : unread.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

async function generateNotifications() {
  if (!isNotifEnabled()) return;
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [newTVRes, ongoingRes] = await Promise.all([
      fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=first_air_date.desc&first_air_date.gte=${weekAgo}&first_air_date.lte=${today}&vote_count.gte=5&without_genres=${EXCLUDED_GENRES}&with_origin_country=${KOREAN_COUNTRY}&with_original_language=${KOREAN_LANG}`),
      fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&first_air_date.lte=${today}&vote_count.gte=20&with_status=0|1&without_genres=${EXCLUDED_GENRES}&with_origin_country=${KOREAN_COUNTRY}&with_original_language=${KOREAN_LANG}&page=1`)
    ]);

    const newTV = await newTVRes.json();
    const ongoing = await ongoingRes.json();
    const notifications = [];

    filterOutNonDrama(newTV.results || []).slice(0, 8).forEach(function(item) {
      if (!item.poster_path) return;
      notifications.push({
        id: item.id, media_type: 'tv', title: item.name, poster_path: item.poster_path,
        type: 'new_release', message: 'New Korean Series released!', createdAt: Date.now(), read: false
      });
    });

    filterOutNonDrama(ongoing.results || []).slice(0, 8).forEach(function(item) {
      if (!item.poster_path) return;
      notifications.push({
        id: item.id, media_type: 'tv', title: item.name, poster_path: item.poster_path,
        type: 'new_episode', message: 'New episode available!', createdAt: Date.now(), read: false
      });
    });

    saveNotifications(notifications);
  } catch (err) { console.error('[Notifications]', err); }
}

function openNotifications() {
  const panel = document.getElementById('notif-panel');
  if (panel.classList.contains('open')) { closeNotifications(); return; }
  panel.classList.add('open');
  renderNotifications();
  const list = getNotifications();
  list.forEach(function(n) { n.read = true; });
  saveNotifications(list);
  updateNotifBadge();
}

function closeNotifications() {
  document.getElementById('notif-panel').classList.remove('open');
}

document.addEventListener('click', function(e) {
  const panel = document.getElementById('notif-panel');
  const notifBtn = e.target.closest('button[aria-label="Notifications"]');
  if (!panel) return;
  if (!panel.classList.contains('open')) return;
  if (panel.contains(e.target)) return;
  if (notifBtn) return;
  closeNotifications();
});

function renderNotifications() {
  const list = getNotifications();
  const container = document.getElementById('notif-list');
  const empty = document.getElementById('notif-empty');
  if (!container) return;
  container.innerHTML = '';
  if (list.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.forEach(function(notif) {
    const item = document.createElement('div');
    item.className = 'notif-item';
    item.onclick = function() { closeNotifications(); fetchFullDetails(notif.id, notif.media_type); };
    const img = document.createElement('img');
    img.className = 'notif-item-img';
    img.alt = notif.title;
    img.loading = 'lazy';
    if (notif.poster_path) img.src = `${IMG_W500}${notif.poster_path}`;
    else img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 75" fill="%23333"><rect width="50" height="75"/></svg>';
    const info = document.createElement('div');
    info.className = 'notif-item-info';
    const title = document.createElement('div');
    title.className = 'notif-item-title';
    title.textContent = notif.title;
    const meta = document.createElement('div');
    meta.className = 'notif-item-meta';
    const icon = notif.type === 'new_episode' ? 'fa-tv' : 'fa-fire';
    meta.innerHTML = '<i class="fa ' + icon + '"></i> ' + notif.message;
    info.appendChild(title);
    info.appendChild(meta);
    item.appendChild(img);
    item.appendChild(info);
    container.appendChild(item);
  });
}

// ============================================================
// USER PROFILE
// ============================================================

function openUserProfile() {
  closeModalOnly();
  closeAllPagesOnly();
  const page = document.getElementById('user-profile-page');
  page.classList.add('open');
  page.scrollTop = 0;
  let username = 'User';
  try {
    const session = JSON.parse(localStorage.getItem('mobiflix_auth_session') || '{}');
    if (session.username) username = session.username;
  } catch (e) {}
  document.getElementById('profile-username').textContent = username;
  const notifToggle = document.getElementById('notif-toggle');
  if (notifToggle) notifToggle.checked = isNotifEnabled();
  renderHistory();
  loadTheme();
  setActiveNav('profile');
  pushLayer('profile');
}

function closeUserProfile() {
  document.getElementById('user-profile-page').classList.remove('open');
  setActiveNav('home');
}

// ============================================================
// EPISODES
// ============================================================

async function fetchTvSeasons(tvId) {
  try {
    const res = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`);
    const data = await res.json();
    return data.seasons || [];
  } catch (err) { return []; }
}

async function fetchSeasonEpisodes(tvId, seasonNumber) {
  try {
    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
    const data = await res.json();
    return data.episodes || [];
  } catch (err) { return []; }
}

async function loadEpisodesSection(item) {
  const section = document.getElementById('episodes-section');
  const seasonSelector = document.getElementById('season-selector');
  const episodesList = document.getElementById('episodes-list');
  if (!section || !seasonSelector || !episodesList) return;
  const isTV = item.media_type === 'tv' || (!item.title && (item.name || item.first_air_date));
  if (!isTV) { section.style.display = 'none'; return; }
  item.media_type = 'tv';
  section.style.display = 'block';
  seasonSelector.innerHTML = '';
  episodesList.innerHTML = '<div class="episodes-loading"><i class="fa fa-spinner fa-spin"></i> Loading episodes...</div>';
  currentTvId = item.id;
  const seasons = await fetchTvSeasons(item.id);
  const validSeasons = seasons.filter(function(s) { return s.season_number > 0; });
  if (validSeasons.length === 0) {
    seasonSelector.innerHTML = '';
    episodesList.innerHTML = '<div class="episodes-loading">No episodes available.</div>';
    return;
  }
  validSeasons.forEach(function(season, index) {
    const btn = document.createElement('button');
    btn.className = 'season-btn' + (index === 0 ? ' active' : '');
    btn.textContent = 'Season ' + season.season_number;
    btn.onclick = function() {
      document.querySelectorAll('.season-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      loadSeasonEpisodes(item.id, season.season_number);
    };
    seasonSelector.appendChild(btn);
  });
  loadSeasonEpisodes(item.id, validSeasons[0].season_number);
}

async function loadSeasonEpisodes(tvId, seasonNumber) {
  const episodesList = document.getElementById('episodes-list');
  if (!episodesList) return;
  episodesList.innerHTML = '<div class="episodes-loading"><i class="fa fa-spinner fa-spin"></i> Loading episodes...</div>';
  let episodes = await fetchSeasonEpisodes(tvId, seasonNumber);
  const today = new Date().toISOString().split('T')[0];
  episodes = (episodes || []).filter(function(ep) {
    if (!ep.air_date) return false;
    return ep.air_date <= today;
  });
  if (!episodes || episodes.length === 0) {
    episodesList.innerHTML = '<div class="episodes-loading">No episodes aired yet.</div>';
    return;
  }
  episodesList.innerHTML = '';
  episodes.forEach(function(ep) {
    const episodeItem = document.createElement('div');
    episodeItem.className = 'episode-item';
    if (isEpisodeWatched(tvId, seasonNumber, ep.episode_number)) episodeItem.classList.add('watched');
    episodeItem.onclick = function() { playEpisode(tvId, seasonNumber, ep.episode_number); };
    const thumb = document.createElement('img');
    thumb.className = 'episode-thumb';
    thumb.loading = 'lazy';
    if (ep.still_path) thumb.src = `${IMG_W500}${ep.still_path}`;
    else {
      const epNum = ep.episode_number || '?';
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="g' + epNum + '" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23222;stop-opacity:1" /><stop offset="100%" style="stop-color:%230b0b0b;stop-opacity:1" /></linearGradient></defs><rect width="320" height="180" fill="url(#g' + epNum + ')"/><circle cx="160" cy="75" r="30" fill="none" stroke="%23e50914" stroke-width="2.5"/><polygon points="150,60 150,90 175,75" fill="%23e50914"/><text x="160" y="135" text-anchor="middle" fill="%23666" font-size="13" font-family="Arial" font-weight="bold">EPISODE ' + epNum + '</text></svg>';
      thumb.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }
    const info = document.createElement('div');
    info.className = 'episode-info';
    const num = document.createElement('div');
    num.className = 'episode-number';
    num.textContent = 'S' + seasonNumber + ' • E' + ep.episode_number;
    const name = document.createElement('div');
    name.className = 'episode-name';
    name.textContent = ep.name || ('Episode ' + ep.episode_number);
    const overview = document.createElement('div');
    overview.className = 'episode-overview';
    overview.textContent = ep.overview || 'No description available.';
    info.appendChild(num);
    info.appendChild(name);
    info.appendChild(overview);
    const playIcon = document.createElement('div');
    playIcon.className = 'episode-play-icon';
    playIcon.innerHTML = '<i class="fa fa-play"></i>';
    episodeItem.appendChild(thumb);
    episodeItem.appendChild(info);
    episodeItem.appendChild(playIcon);
    episodesList.appendChild(episodeItem);
  });
}

function playEpisode(tvId, seasonNumber, episodeNumber) {
  markEpisodeWatched(tvId, seasonNumber, episodeNumber);
  const allEpisodes = document.querySelectorAll('.episode-item');
  allEpisodes.forEach(function(el) {
    const numEl = el.querySelector('.episode-number');
    if (!numEl) return;
    const expected = 'S' + seasonNumber + ' • E' + episodeNumber;
    if ((numEl.textContent || '').indexOf(expected) !== -1) el.classList.add('watched');
  });
  const title = currentItem ? (currentItem.title || currentItem.name) : 'Korean Series';
  const url = `player.html?type=tv&id=${tvId}&season=${seasonNumber}&episode=${episodeNumber}&title=${encodeURIComponent(title)}`;
  if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function() {});
  window.location.href = url;
}

// ============================================================
// DISPLAY
// ============================================================

function displayBanner(item) {
  bannerItem = item;
  const banner = document.getElementById('banner');
  banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path || item.poster_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
  const rating = Math.round((item.vote_average || 0) / 2);
  const ratingEl = document.getElementById('banner-rating');
  if (ratingEl) ratingEl.innerHTML = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const yearEl = document.getElementById('banner-year');
  if (yearEl) {
    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
    yearEl.textContent = year || '';
  }
  const typeEl = document.getElementById('banner-type');
  if (typeEl) {
    const type = item.media_type === 'movie' ? 'Movie' : 'Korean Series';
    typeEl.textContent = type;
  }
  const descEl = document.getElementById('banner-description');
  if (descEl) descEl.textContent = item.overview || 'No description available.';
}

function playBanner() { if (bannerItem) showDetails(bannerItem); }
function showBannerDetails() { if (bannerItem) showDetails(bannerItem); }

function appendToList(items, containerId, mediaType) {
  const container = document.getElementById(containerId);
  if (!container) return;
  items.forEach(function(item) {
    if (!item.poster_path) return;
    const existing = container.querySelector(`img[data-id="${item.id}"]`);
    if (existing) return;
    if (mediaType) item.media_type = mediaType;
    const img = document.createElement('img');
    img.src = `${IMG_W500}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.loading = 'lazy';
    img.dataset.id = item.id;
    img.onclick = function() { showDetails(item); };
    container.appendChild(img);
  });
}

function renderTop20(items, containerId, mediaType) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const released = filterReleased(items);
  released.slice(0, 20).forEach(function(item, index) {
    if (!item.poster_path) return;
    if (mediaType) item.media_type = mediaType;
    else if (!item.media_type) item.media_type = item.title ? 'movie' : 'tv';
    const wrapper = document.createElement('div');
    wrapper.className = 'top10-item';
    wrapper.onclick = function() { showDetails(item); };
    const number = document.createElement('div');
    number.className = 'top10-number';
    number.textContent = index + 1;
    const img = document.createElement('img');
    img.src = `${IMG_W500}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.loading = 'lazy';
    wrapper.appendChild(number);
    wrapper.appendChild(img);
    container.appendChild(wrapper);
  });
}

function renderProviders() {
  const container = document.getElementById('providers-list');
  if (!container) return;
  container.innerHTML = '';
  STREAMING_PROVIDERS.forEach(function(provider) {
    const card = document.createElement('div');
    card.className = 'provider-card';
    card.title = provider.name;
    card.style.background = provider.color;
    card.style.borderColor = provider.color;
    card.style.color = provider.color;
    const img = document.createElement('img');
    img.alt = provider.name;
    img.src = PROVIDER_LOGOS[provider.name];
    img.onerror = function() {
      this.style.display = 'none';
      if (!card.querySelector('span')) {
        const span = document.createElement('span');
        span.textContent = provider.name;
        card.appendChild(span);
      }
    };
    card.appendChild(img);
    card.onclick = function() { openProviderPage(provider.id, provider.name, provider.type); };
    container.appendChild(card);
  });
}

function renderGenresInMore() {
  const container = document.getElementById('more-genres-list');
  if (!container) return;
  container.innerHTML = '';
  GENRE_LIST.forEach(function(genre) {
    const link = document.createElement('a');
    link.textContent = `${genre.icon} ${genre.name}`;
    link.onclick = function() { openGenrePage(genre); };
    container.appendChild(link);
  });
}

// ============================================================
// FILTERS
// ============================================================

const FILTER_PANEL_MAP = {
  'view-all': 'view-all-filter-panel',
  'provider': 'provider-filter-panel',
  'genre': 'genre-filter-panel'
};

const FILTER_PREFIX_MAP = {
  'view-all': 'filter-',
  'provider': 'provider-filter-',
  'genre': 'genre-filter-'
};

function toggleFilters(pageKey) {
  const panelId = FILTER_PANEL_MAP[pageKey];
  if (!panelId) return;
  const panel = document.getElementById(panelId);
  if (!panel) return;
  if (panel.style.display === 'none' || !panel.style.display) panel.style.display = 'block';
  else panel.style.display = 'none';
}

function getFilterValues(pageKey) {
  const prefix = FILTER_PREFIX_MAP[pageKey] || 'filter-';
  return {
    year: (document.getElementById(prefix + 'year') || {}).value || '',
    rating: (document.getElementById(prefix + 'rating') || {}).value || '',
    genre: (document.getElementById(prefix + 'genre') || {}).value || '',
    country: (document.getElementById(prefix + 'country') || {}).value || '',
    sort: (document.getElementById(prefix + 'sort') || {}).value || 'popularity.desc'
  };
}

function applyFilters(pageKey) {
  const filters = getFilterValues(pageKey);
  const hasFilter = filters.year || filters.rating || filters.genre;
  if (!hasFilter) { alert('Please select at least one filter.'); return; }
  if (pageKey === 'view-all') {
    viewAllState.filters = filters;
    viewAllState.page = 1;
    viewAllState.hasMore = true;
    viewAllState.seenIds = new Set();
    document.getElementById('view-all-grid').innerHTML = '';
    document.getElementById('view-all-end').style.display = 'none';
    loadViewAllBatch();
  } else if (pageKey === 'provider') {
    providerPageState.filters = filters;
    providerPageState.page = 1;
    providerPageState.batchCount = 0;
    providerPageState.hasMore = true;
    providerPageState.seenIds = new Set();
    document.getElementById('provider-page-grid').innerHTML = '';
    document.getElementById('provider-page-end').style.display = 'none';
    loadProviderBatch();
  } else if (pageKey === 'genre') {
    genrePageState.filters = filters;
    genrePageState.page = 1;
    genrePageState.hasMore = true;
    genrePageState.seenIds = new Set();
    document.getElementById('genre-page-grid').innerHTML = '';
    document.getElementById('genre-page-end').style.display = 'none';
    loadGenrePageBatch();
  }
  const panelId = FILTER_PANEL_MAP[pageKey];
  if (panelId) document.getElementById(panelId).style.display = 'none';
}

function clearFilters(pageKey) {
  const prefix = FILTER_PREFIX_MAP[pageKey] || 'filter-';
  ['year', 'rating', 'genre', 'country'].forEach(function(k) {
    const el = document.getElementById(prefix + k);
    if (el) el.value = '';
  });
  const sortEl = document.getElementById(prefix + 'sort');
  if (sortEl) sortEl.value = 'popularity.desc';
  if (pageKey === 'view-all') {
    viewAllState.filters = {}; viewAllState.page = 1; viewAllState.hasMore = true; viewAllState.seenIds = new Set();
    document.getElementById('view-all-grid').innerHTML = '';
    document.getElementById('view-all-end').style.display = 'none';
    loadViewAllBatch();
  } else if (pageKey === 'provider') {
    providerPageState.filters = {}; providerPageState.page = 1; providerPageState.batchCount = 0; providerPageState.hasMore = true; providerPageState.seenIds = new Set();
    document.getElementById('provider-page-grid').innerHTML = '';
    document.getElementById('provider-page-end').style.display = 'none';
    loadProviderBatch();
  } else if (pageKey === 'genre') {
    genrePageState.filters = {}; genrePageState.page = 1; genrePageState.hasMore = true; genrePageState.seenIds = new Set();
    document.getElementById('genre-page-grid').innerHTML = '';
    document.getElementById('genre-page-end').style.display = 'none';
    loadGenrePageBatch();
  }
  const panelId = FILTER_PANEL_MAP[pageKey];
  if (panelId) document.getElementById(panelId).style.display = 'none';
}

// ============================================================
// CLOSE FUNCTIONS
// ============================================================

function closeAllPagesOnly() {
  ['view-all-page', 'provider-page', 'my-list-page', 'more-page', 'search-modal', 'genre-page',
   'ongoing-page', 'completed-page', 'user-profile-page', 'person-page'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('open'); el.scrollTop = 0; }
  });
  const detailsBackBtn = document.getElementById('details-back-btn');
  if (detailsBackBtn) detailsBackBtn.style.display = 'none';
  document.body.style.overflow = '';
}

function closeModalOnly() {
  const modal = document.getElementById('modal');
  if (modal) modal.style.display = 'none';
  const detailsBackBtn = document.getElementById('details-back-btn');
  if (detailsBackBtn) detailsBackBtn.style.display = 'none';
  document.body.style.overflow = '';
}

function closeViewAll() { closeAllPagesOnly(); setActiveNav('home'); }
function closeGenrePage() { closeAllPagesOnly(); setActiveNav('more'); }
function closeOngoingPage() { closeAllPagesOnly(); setActiveNav('home'); }
function closeCompletedPage() { closeAllPagesOnly(); setActiveNav('home'); }
function closeProviderPage() { closeAllPagesOnly(); setActiveNav('home'); }
function closeMyListPage() { closeAllPagesOnly(); setActiveNav('home'); }
function closeMorePage() { closeAllPagesOnly(); setActiveNav('home'); }
function closePersonPage() { closeAllPagesOnly(); setActiveNav('home'); }
function openMoviesPage() { openViewAll('movies'); }
function openSeriesPage() { openViewAll('tv'); }
function closeMoviesPage() { closeViewAll(); }
function closeSeriesPage() { closeViewAll(); }
function closeSearchModal() { closeAllPagesOnly(); document.body.style.overflow = ''; setActiveNav('home'); }
function closeModal() { closeModalOnly(); }

// ============================================================
// GENRE PAGE
// ============================================================

function openGenrePage(genre) {
  closeAllPagesOnly();
  const page = document.getElementById('genre-page');
  page.classList.add('open');
  page.scrollTop = 0;
  genrePageState = { genre: genre, page: 1, maxPages: 500, loading: false, hasMore: true, initialized: true, seenIds: new Set(), filters: {} };
  document.getElementById('genre-page-title').textContent = `${genre.icon} ${genre.name}`;
  document.getElementById('genre-page-grid').innerHTML = '';
  document.getElementById('genre-page-end').style.display = 'none';
  document.getElementById('genre-page-loading').style.display = 'none';
  page.removeEventListener('scroll', genrePageScrollHandler);
  page.addEventListener('scroll', genrePageScrollHandler, { passive: true });
  setActiveNav('more');
  loadGenrePageBatch();
  pushLayer('genre');
}

function genrePageScrollHandler() {
  if (!genrePageState.initialized || genrePageState.loading || !genrePageState.hasMore) return;
  const page = document.getElementById('genre-page');
  if (!page) return;
  if (page.scrollTop + page.clientHeight >= page.scrollHeight - 300) loadGenrePageBatch();
}

async function loadGenrePageBatch() {
  if (genrePageState.loading || !genrePageState.hasMore) return;
  genrePageState.loading = true;
  document.getElementById('genre-page-loading').style.display = 'block';
  try {
    const genre = genrePageState.genre;
    const filters = genrePageState.filters || {};
    const sortBy = filters.sort || 'popularity.desc';
    let url = `${BASE_URL}/discover/${genre.media}?api_key=${API_KEY}` +
      `&with_genres=${genre.id}` +
      `&with_origin_country=${KOREAN_COUNTRY}` +
      `&with_original_language=${KOREAN_LANG}` +
      `&without_genres=${EXCLUDED_GENRES}` +
      `&sort_by=${sortBy}` +
      `&page=${genrePageState.page}`;
    if (filters.year) {
      if (genre.media === 'movie') url += `&primary_release_year=${filters.year}`;
      else url += `&first_air_date_year=${filters.year}`;
    }
    if (filters.rating) url += `&vote_average.gte=${filters.rating}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      genrePageState.hasMore = false;
      document.getElementById('genre-page-end').style.display = 'block';
      return;
    }
    genrePageState.maxPages = data.total_pages || 1;
    genrePageState.page += 1;
    const grid = document.getElementById('genre-page-grid');
    let filtered = filterReleased(data.results);
    filtered = filterOutNonDrama(filtered);
    filtered.forEach(function(item) {
      if (!item.poster_path) return;
      if (genrePageState.seenIds.has(item.id)) return;
      genrePageState.seenIds.add(item.id);
      item.media_type = genre.media;
      const img = document.createElement('img');
      img.src = `${IMG_W500}${item.poster_path}`;
      img.alt = item.title || item.name;
      img.loading = 'lazy';
      img.dataset.id = item.id;
      img.onclick = function() { showDetails(item); };
      grid.appendChild(img);
    });
    if (genrePageState.page > genrePageState.maxPages) {
      genrePageState.hasMore = false;
      document.getElementById('genre-page-end').style.display = 'block';
    }
  } catch (err) { console.error(err); }
  finally {
    genrePageState.loading = false;
    document.getElementById('genre-page-loading').style.display = 'none';
  }
}

// ============================================================
// ONGOING
// ============================================================

function openOngoingPage() {
  closeAllPagesOnly();
  const page = document.getElementById('ongoing-page');
  page.classList.add('open');
  page.scrollTop = 0;
  ongoingPageState = { page: 1, maxPages: 500, loading: false, hasMore: true, initialized: true, seenIds: new Set() };
  document.getElementById('ongoing-page-grid').innerHTML = '';
  document.getElementById('ongoing-page-end').style.display = 'none';
  document.getElementById('ongoing-page-loading').style.display = 'none';
  page.removeEventListener('scroll', ongoingPageScrollHandler);
  page.addEventListener('scroll', ongoingPageScrollHandler, { passive: true });
  setActiveNav('home');
  loadOngoingPageBatch();
  pushLayer('ongoing');
}

function ongoingPageScrollHandler() {
  if (!ongoingPageState.initialized || ongoingPageState.loading || !ongoingPageState.hasMore) return;
  const page = document.getElementById('ongoing-page');
  if (!page) return;
  if (page.scrollTop + page.clientHeight >= page.scrollHeight - 300) loadOngoingPageBatch();
}

async function loadOngoingPageBatch() {
  if (ongoingPageState.loading || !ongoingPageState.hasMore) return;
  ongoingPageState.loading = true;
  document.getElementById('ongoing-page-loading').style.display = 'block';
  try {
    const data = await fetchOngoingKoreanSeries(ongoingPageState.page);
    ongoingPageState.maxPages = data.total_pages;
    ongoingPageState.page += 1;
    const grid = document.getElementById('ongoing-page-grid');
    data.results.forEach(function(item) {
      if (!item.poster_path) return;
      if (ongoingPageState.seenIds.has(item.id)) return;
      ongoingPageState.seenIds.add(item.id);
      item.media_type = 'tv';
      const img = document.createElement('img');
      img.src = `${IMG_W500}${item.poster_path}`;
      img.alt = item.title || item.name;
      img.loading = 'lazy';
      img.dataset.id = item.id;
      img.onclick = function() { showDetails(item); };
      grid.appendChild(img);
    });
    if (ongoingPageState.page > ongoingPageState.maxPages) {
      ongoingPageState.hasMore = false;
      document.getElementById('ongoing-page-end').style.display = 'block';
    }
  } catch (err) { console.error(err); }
  finally {
    ongoingPageState.loading = false;
    document.getElementById('ongoing-page-loading').style.display = 'none';
  }
}

// ============================================================
// COMPLETED
// ============================================================

function openCompletedPage() {
  closeAllPagesOnly();
  const page = document.getElementById('completed-page');
  page.classList.add('open');
  page.scrollTop = 0;
  completedPageState = { page: 1, maxPages: 500, loading: false, hasMore: true, initialized: true, seenIds: new Set() };
  document.getElementById('completed-page-grid').innerHTML = '';
  document.getElementById('completed-page-end').style.display = 'none';
  document.getElementById('completed-page-loading').style.display = 'none';
  page.removeEventListener('scroll', completedPageScrollHandler);
  page.addEventListener('scroll', completedPageScrollHandler, { passive: true });
  setActiveNav('home');
  loadCompletedPageBatch();
  pushLayer('completed');
}

function completedPageScrollHandler() {
  if (!completedPageState.initialized || completedPageState.loading || !completedPageState.hasMore) return;
  const page = document.getElementById('completed-page');
  if (!page) return;
  if (page.scrollTop + page.clientHeight >= page.scrollHeight - 300) loadCompletedPageBatch();
}

async function loadCompletedPageBatch() {
  if (completedPageState.loading || !completedPageState.hasMore) return;
  completedPageState.loading = true;
  document.getElementById('completed-page-loading').style.display = 'block';
  try {
    const data = await fetchCompletedKoreanSeries(completedPageState.page);
    completedPageState.maxPages = data.total_pages;
    completedPageState.page += 1;
    const grid = document.getElementById('completed-page-grid');
    data.results.forEach(function(item) {
      if (!item.poster_path) return;
      if (completedPageState.seenIds.has(item.id)) return;
      completedPageState.seenIds.add(item.id);
      item.media_type = 'tv';
      const img = document.createElement('img');
      img.src = `${IMG_W500}${item.poster_path}`;
      img.alt = item.title || item.name;
      img.loading = 'lazy';
      img.dataset.id = item.id;
      img.onclick = function() { showDetails(item); };
      grid.appendChild(img);
    });
    if (completedPageState.page > completedPageState.maxPages) {
      completedPageState.hasMore = false;
      document.getElementById('completed-page-end').style.display = 'block';
    }
  } catch (err) { console.error(err); }
  finally {
    completedPageState.loading = false;
    document.getElementById('completed-page-loading').style.display = 'none';
  }
}

// ============================================================
// PROVIDER
// ============================================================

function openProviderPage(providerId, providerName, providerType) {
  closeAllPagesOnly();
  const page = document.getElementById('provider-page');
  page.classList.add('open');
  page.scrollTop = 0;
  providerPageState = {
    providerId: providerId, providerName: providerName, providerType: providerType || 'provider',
    page: 1, batchCount: 0, maxPages: 500, loading: false, hasMore: true, initialized: true, seenIds: new Set(), filters: {}
  };
  document.getElementById('provider-page-title').textContent = '📡 ' + providerName;
  document.getElementById('provider-page-grid').innerHTML = '';
  document.getElementById('provider-page-end').style.display = 'none';
  document.getElementById('provider-page-loading').style.display = 'none';
  page.removeEventListener('scroll', providerPageScrollHandler);
  page.addEventListener('scroll', providerPageScrollHandler, { passive: true });
  loadProviderBatch();
  pushLayer('provider');
}

function providerPageScrollHandler() {
  if (!providerPageState.initialized || providerPageState.loading || !providerPageState.hasMore) return;
  const page = document.getElementById('provider-page');
  if (!page) return;
  if (page.scrollTop + page.clientHeight >= page.scrollHeight - 300) loadProviderBatch();
}

async function loadProviderBatch() {
  if (providerPageState.loading || !providerPageState.hasMore) return;
  providerPageState.loading = true;
  document.getElementById('provider-page-loading').style.display = 'block';
  try {
    const filters = providerPageState.filters || {};
    const sortBy = filters.sort || 'popularity.desc';
    if (typeof providerPageState.batchCount === 'undefined') providerPageState.batchCount = 0;
    const mediaType = (providerPageState.batchCount % 2 === 0) ? 'movie' : 'tv';
    const apiPage = Math.floor(providerPageState.batchCount / 2) + 1;
    let url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}` +
      `&with_watch_providers=${providerPageState.providerId}` +
      `&watch_region=KR` +
      `&with_origin_country=${KOREAN_COUNTRY}` +
      `&with_original_language=${KOREAN_LANG}` +
      `&without_genres=${EXCLUDED_GENRES}` +
      `&page=${apiPage}` +
      `&sort_by=${sortBy}`;
    if (filters.year) {
      if (mediaType === 'movie') url += `&primary_release_year=${filters.year}`;
      else url += `&first_air_date_year=${filters.year}`;
    }
    if (filters.rating) url += `&vote_average.gte=${filters.rating}`;
    if (filters.genre) url += `&with_genres=${filters.genre}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      providerPageState.hasMore = false;
      document.getElementById('provider-page-end').style.display = 'block';
      return;
    }
    providerPageState.maxPages = data.total_pages || 1;
    providerPageState.batchCount += 1;
    const grid = document.getElementById('provider-page-grid');
    let filtered = filterReleased(data.results);
    filtered = filterOutNonDrama(filtered);
    filtered.forEach(function(item) {
      if (!item.poster_path) return;
      if (providerPageState.seenIds.has(item.id)) return;
      providerPageState.seenIds.add(item.id);
      item.media_type = mediaType;
      const img = document.createElement('img');
      img.src = `${IMG_W500}${item.poster_path}`;
      img.alt = item.title || item.name;
      img.loading = 'lazy';
      img.dataset.id = item.id;
      img.onclick = function() { showDetails(item); };
      grid.appendChild(img);
    });
    if (apiPage >= providerPageState.maxPages) {
      providerPageState.hasMore = false;
      document.getElementById('provider-page-end').style.display = 'block';
    }
  } catch (err) { console.error(err); }
  finally {
    providerPageState.loading = false;
    document.getElementById('provider-page-loading').style.display = 'none';
  }
}

// ============================================================
// PERSON PAGE
// ============================================================

function openPersonPage(personId, personName, profilePath) {
  closeModalOnly();
  closeAllPagesOnly();
  const page = document.getElementById('person-page');
  page.classList.add('open');
  page.scrollTop = 0;
  personPageState = {
    page: 1, maxPages: 500, loading: false, hasMore: true, initialized: true,
    seenIds: new Set(), personId: personId, personName: personName
  };
  document.getElementById('person-page-title').textContent = personName;
  const avatar = document.getElementById('person-avatar');
  if (profilePath) avatar.src = `${IMG_PROFILE}${profilePath}`;
  else avatar.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23444"><circle cx="50" cy="40" r="20"/><ellipse cx="50" cy="90" rx="35" ry="30"/></svg>';
  document.getElementById('person-page-grid').innerHTML = '';
  document.getElementById('person-page-end').style.display = 'none';
  document.getElementById('person-page-loading').style.display = 'none';
  page.removeEventListener('scroll', personPageScrollHandler);
  page.addEventListener('scroll', personPageScrollHandler, { passive: true });
  setActiveNav('home');
  loadPersonBatch();
  pushLayer('person');
}

function personPageScrollHandler() {
  if (!personPageState.initialized || personPageState.loading || !personPageState.hasMore) return;
  const page = document.getElementById('person-page');
  if (!page) return;
  if (page.scrollTop + page.clientHeight >= page.scrollHeight - 300) loadPersonBatch();
}

async function loadPersonBatch() {
  if (personPageState.loading || !personPageState.hasMore) return;
  personPageState.loading = true;
  document.getElementById('person-page-loading').style.display = 'block';
  try {
    const [movieData, tvData] = await Promise.all([
      fetchPersonCredits(personPageState.personId, personPageState.page),
      fetchPersonTvCredits(personPageState.personId, personPageState.page)
    ]);
    const combined = [...movieData.results, ...tvData.results];
    personPageState.maxPages = Math.max(movieData.total_pages, tvData.total_pages);
    personPageState.page += 1;
    if (combined.length === 0) {
      personPageState.hasMore = false;
      document.getElementById('person-page-end').style.display = 'block';
      return;
    }
    const grid = document.getElementById('person-page-grid');
    combined.sort(function(a, b) { return (b.popularity || 0) - (a.popularity || 0); }).forEach(function(item) {
      if (!item.poster_path) return;
      if (personPageState.seenIds.has(item.id)) return;
      personPageState.seenIds.add(item.id);
      const img = document.createElement('img');
      img.src = `${IMG_W500}${item.poster_path}`;
      img.alt = item.title || item.name;
      img.loading = 'lazy';
      img.dataset.id = item.id;
      img.onclick = function() { showDetails(item); };
      grid.appendChild(img);
    });
    if (personPageState.page > personPageState.maxPages) {
      personPageState.hasMore = false;
      document.getElementById('person-page-end').style.display = 'block';
    }
  } catch (err) { console.error(err); }
  finally {
    personPageState.loading = false;
    document.getElementById('person-page-loading').style.display = 'none';
  }
}

// ============================================================
// SHOW DETAILS
// ============================================================

async function showDetails(item) {
  currentItem = item;
  if (!item.media_type) {
    if (item.first_air_date || (!item.title && item.name)) item.media_type = 'tv';
    else item.media_type = 'movie';
  }
  const mediaType = item.media_type;
  addToHistory(item);
  addToContinueWatching(item);
  document.getElementById('modal-poster').src = `${IMG_URL}${item.backdrop_path || item.poster_path}`;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-rating-num').textContent = (item.vote_average || 0).toFixed(1);
  document.getElementById('modal-year-num').textContent = (item.release_date || item.first_air_date || '').slice(0, 4) || '—';
  const runtimeEl = document.getElementById('modal-runtime');
  if (item.runtime) {
    const hours = Math.floor(item.runtime / 60);
    const mins = item.runtime % 60;
    runtimeEl.textContent = hours + 'H ' + mins + 'M';
  } else if (item.number_of_seasons) {
    runtimeEl.textContent = item.number_of_seasons + ' Season' + (item.number_of_seasons > 1 ? 's' : '');
  } else runtimeEl.textContent = '—';
  document.getElementById('modal-description').textContent = item.overview || 'No description available.';
  updateBookmarkUI(item);
  document.getElementById('modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('details-back-btn').style.display = 'flex';
  pushLayer('modal');
  document.getElementById('cast-list').innerHTML = '<div style="color:#666;padding:10px 0;">Loading cast...</div>';
  document.getElementById('similar-list').innerHTML = '<div style="color:#666;padding:10px 0;flex-shrink:0;">Loading recommendations...</div>';
  const itemId = item.id;
  const trailerBtn = document.getElementById('btn-trailer');
  if (trailerBtn) trailerBtn.style.display = 'none';
  currentTrailerKey = null;
  const promises = [
    fetchCredits(mediaType, itemId),
    fetchSimilar(mediaType, itemId),
    fetchTrailer(mediaType, itemId)
  ];
  if (mediaType === 'tv') loadEpisodesSection(item);
  else {
    const epSection = document.getElementById('episodes-section');
    if (epSection) epSection.style.display = 'none';
  }
  const [cast, similar, trailerKey] = await Promise.all(promises);
  if (currentItem && currentItem.id !== itemId) return;
  renderCast(cast);
  renderSimilar(similar, mediaType);
  if (trailerKey) {
    currentTrailerKey = trailerKey;
    if (trailerBtn) trailerBtn.style.display = 'flex';
  }
  renderContinueWatching();
}

function renderCast(cast) {
  const container = document.getElementById('cast-list');
  container.innerHTML = '';
  if (!cast || cast.length === 0) {
    container.innerHTML = '<div style="color:#666;padding:10px 0;">No cast information available.</div>';
    return;
  }
  cast.forEach(function(person) {
    const card = document.createElement('div');
    card.className = 'cast-card';
    card.onclick = function() { openPersonPage(person.id, person.name, person.profile_path); };
    const img = document.createElement('img');
    img.alt = person.name;
    img.loading = 'lazy';
    if (person.profile_path) img.src = `${IMG_PROFILE}${person.profile_path}`;
    else img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23444"><circle cx="50" cy="40" r="20"/><ellipse cx="50" cy="90" rx="35" ry="30"/></svg>';
    const name = document.createElement('div');
    name.className = 'cast-name';
    name.textContent = person.name;
    const role = document.createElement('div');
    role.className = 'cast-role';
    role.textContent = person.character || '';
    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(role);
    container.appendChild(card);
  });
}

function renderSimilar(similar, mediaType) {
  const container = document.getElementById('similar-list');
  container.innerHTML = '';
  if (!similar || similar.length === 0) {
    container.innerHTML = '<div style="color:#666;padding:10px 0;flex-shrink:0;">No recommendations available.</div>';
    return;
  }
  similar.forEach(function(item) {
    item.media_type = mediaType;
    const img = document.createElement('img');
    img.src = `${IMG_W500}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.loading = 'lazy';
    img.onclick = function() { showDetails(item); };
    container.appendChild(img);
  });
}

function getWatchlist() {
  try { return JSON.parse(localStorage.getItem('mobiflix_watchlist')) || []; }
  catch (e) { return []; }
}

function saveWatchlist(list) {
  localStorage.setItem('mobiflix_watchlist', JSON.stringify(list));
}

function updateBookmarkUI(item) {
  const list = getWatchlist();
  const exists = list.find(function(x) { return x.id === item.id; });
  const icon = document.getElementById('bookmark-icon');
  const text = document.getElementById('bookmark-text');
  if (exists) {
    icon.className = 'fa fa-bookmark';
    text.textContent = 'Added to List';
  } else {
    icon.className = 'fa fa-bookmark-o';
    text.textContent = 'Add to List';
  }
}

function toggleAddToList() {
  if (!currentItem) return;
  const list = getWatchlist();
  const index = list.findIndex(function(x) { return x.id === currentItem.id; });
  if (index >= 0) list.splice(index, 1);
  else {
    list.push({
      id: currentItem.id,
      title: currentItem.title || currentItem.name,
      poster_path: currentItem.poster_path,
      media_type: currentItem.media_type || (currentItem.title ? 'movie' : 'tv'),
      vote_average: currentItem.vote_average,
      release_date: currentItem.release_date || currentItem.first_air_date
    });
  }
  saveWatchlist(list);
  updateBookmarkUI(currentItem);
}

// ============================================================
// PLAY NOW
// ============================================================

function playNow() {
  if (!currentItem) return;
  const isMovie = currentItem.media_type === 'movie' || (!currentItem.media_type && currentItem.title);
  const title = currentItem.title || currentItem.name || 'MobiFlix';
  const year = (currentItem.release_date || currentItem.first_air_date || '').slice(0, 4);
  let url;
  if (isMovie) url = `player.html?type=movie&id=${currentItem.id}&title=${encodeURIComponent(title)}&year=${year}`;
  else url = `player.html?type=tv&id=${currentItem.id}&title=${encodeURIComponent(title)}`;
  if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function() {});
  window.location.href = url;
}

// ============================================================
// MY LIST
// ============================================================

function openMyListPage() {
  closeModalOnly();
  closeAllPagesOnly();
  const page = document.getElementById('my-list-page');
  page.classList.add('open');
  page.scrollTop = 0;
  renderMyList();
  setActiveNav('home');
  pushLayer('my-list');
}

function renderMyList() {
  const list = getWatchlist();
  const grid = document.getElementById('my-list-grid');
  const empty = document.getElementById('my-list-empty');
  grid.innerHTML = '';
  if (list.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.forEach(function(item) {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_W500}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.loading = 'lazy';
    img.dataset.id = item.id;
    img.onclick = function() { fetchFullDetails(item.id, item.media_type); };
    grid.appendChild(img);
  });
}

async function fetchFullDetails(id, mediaType) {
  try {
    const type = mediaType === 'movie' ? 'movie' : 'tv';
    const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
    const data = await res.json();
    data.media_type = type;
    showDetails(data);
  } catch (err) { console.error(err); }
}

// ============================================================
// SEARCH
// ============================================================

function openSearchModal() {
  closeModalOnly();
  closeAllPagesOnly();
  const modal = document.getElementById('search-modal');
  modal.classList.add('open');
  modal.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  setActiveNav('home');
  setTimeout(function() { document.getElementById('search-input').focus(); }, 200);
  pushLayer('search');
}

let searchTimeout;
async function searchTMDB() {
  clearTimeout(searchTimeout);
  const query = document.getElementById('search-input').value;
  if (!query.trim()) { document.getElementById('search-results').innerHTML = ''; return; }

  searchTimeout = setTimeout(async () => {
    try {
      const [movieRes, tvRes] = await Promise.all([
        fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=true&language=ko-KR&region=KR`),
        fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=true&language=ko-KR`)
      ]);
      const movieData = await movieRes.json();
      const tvData = await tvRes.json();

      const movies = (movieData.results || []).map(function(m) { m.media_type = 'movie'; return m; });
      const tvs = (tvData.results || []).map(function(t) { t.media_type = 'tv'; return t; });

      const combined = [...movies, ...tvs]
        .filter(function(item) {
          const isKorean = (item.origin_country || []).includes(KOREAN_COUNTRY) ||
                           item.original_language === KOREAN_LANG;
          return item.poster_path && isKorean;
        })
        .filter(function(item) {
          const date = item.release_date || item.first_air_date;
          if (!date) return true;
          return date <= new Date().toISOString().split('T')[0];
        })
        .filter(function(item) {
          const genres = item.genre_ids || [];
          const hasExcluded = genres.some(function(g) {
            return EXCLUDED_GENRES.split(',').map(Number).includes(g);
          });
          return !hasExcluded;
        })
        .sort(function(a, b) { return (b.popularity || 0) - (a.popularity || 0); });

      const container = document.getElementById('search-results');
      container.innerHTML = '';

      if (combined.length === 0) {
        container.innerHTML = '<div style="color:#666;padding:40px 20px;text-align:center;grid-column:1/-1;">No Korean results found.</div>';
        return;
      }

      combined.forEach(function(item) {
        const img = document.createElement('img');
        img.src = `${IMG_W500}${item.poster_path}`;
        img.alt = item.title || item.name;
        img.onclick = function() { closeSearchModal(); showDetails(item); };
        container.appendChild(img);
      });
    } catch (err) { console.error('[Search]', err); }
  }, 300);
}

// ============================================================
// BOTTOM NAV
// ============================================================

function setActiveNav(name) {
  document.querySelectorAll('.bottom-nav-item').forEach(function(el) { el.classList.remove('active'); });
  const items = document.querySelectorAll('.bottom-nav-item');
  const map = { home: 0, movies: 1, series: 2, more: 3, profile: 4 };
  if (items[map[name]]) items[map[name]].classList.add('active');
}

function goHome() {
  layerStack = [];
  const modal = document.getElementById('modal');
  if (modal) modal.style.display = 'none';
  ['view-all-page', 'provider-page', 'my-list-page', 'more-page', 'search-modal', 'genre-page',
   'ongoing-page', 'completed-page', 'user-profile-page', 'person-page'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('open'); el.scrollTop = 0; }
  });
  const detailsBackBtn = document.getElementById('details-back-btn');
  if (detailsBackBtn) detailsBackBtn.style.display = 'none';
  document.body.style.overflow = '';
  setActiveNav('home');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.pushState({ mobiflixTrap: false }, '', '#home');
  history.pushState({ mobiflixHome: true }, '', '#home');
}

// ============================================================
// MORE PAGE
// ============================================================

function openMorePage() {
  closeModalOnly();
  closeAllPagesOnly();
  const page = document.getElementById('more-page');
  page.classList.add('open');
  page.scrollTop = 0;
  renderGenresInMore();
  setActiveNav('more');
  pushLayer('more');
}

// ============================================================
// VIEW ALL PAGE
// ============================================================

function openViewAll(key) {
  closeModalOnly();
  closeAllPagesOnly();
  const configs = {
    movies:       { name: 'Korean Movies',               icon: '🎬', media: 'movie', type: 'newest_movies' },
    tv:           { name: 'Korean Series',               icon: '📺', media: 'tv',    type: 'newest_tv' },
    most_watched: { name: 'Most Watched Korean Series',  icon: '📺', media: 'tv',    type: 'most_watched' },
    highest:      { name: 'Highest Rated Korean Series', icon: '⭐', media: 'tv',    type: 'highest' },
    newest:       { name: 'Newest Korean Series',        icon: '🆕', media: 'tv',    type: 'newest' },
    ongoing:      { name: 'Ongoing Korean Series',       icon: '🔴', media: 'tv',    type: 'ongoing' },
    completed:    { name: 'Completed Korean Series',     icon: '✅', media: 'tv',    type: 'completed' }
  };
  const config = configs[key];
  if (!config) return;

  viewAllState = { key: key, config: config, page: 1, maxPages: 500, loading: false, hasMore: true, initialized: true, seenIds: new Set(), filters: {} };

  document.getElementById('view-all-title').textContent = config.icon + ' ' + config.name;

  const grid = document.getElementById('view-all-grid');
  grid.innerHTML = '';
  document.getElementById('view-all-end').style.display = 'none';
  document.getElementById('view-all-loading').style.display = 'none';

  const page = document.getElementById('view-all-page');
  page.classList.add('open');
  page.scrollTop = 0;

  page.removeEventListener('scroll', viewAllScrollHandler);
  page.addEventListener('scroll', viewAllScrollHandler, { passive: true });

  if (key === 'movies') setActiveNav('movies');
  else if (key === 'tv') setActiveNav('series');
  else setActiveNav('home');

  loadViewAllBatch();
  pushLayer('view-all');
}

async function loadViewAllBatch() {
  if (viewAllState.loading || !viewAllState.hasMore) return;
  viewAllState.loading = true;
  document.getElementById('view-all-loading').style.display = 'block';

  const key = viewAllState.key;
  const config = viewAllState.config;
  const grid = document.getElementById('view-all-grid');

  try {
    let data;
    const filters = viewAllState.filters || {};
    const hasFilters = filters.year || filters.rating || filters.genre;

    if (hasFilters) {
      const mediaType = config.media;
      let url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}` +
        `&with_origin_country=${KOREAN_COUNTRY}` +
        `&with_original_language=${KOREAN_LANG}` +
        `&without_genres=${EXCLUDED_GENRES}` +
        `&page=${viewAllState.page}`;
      if (filters.year) {
        if (mediaType === 'movie') url += `&primary_release_year=${filters.year}`;
        else url += `&first_air_date_year=${filters.year}`;
      }
      if (filters.rating) url += `&vote_average.gte=${filters.rating}`;
      if (filters.genre) url += `&with_genres=${filters.genre}`;
      url += `&sort_by=${filters.sort || 'first_air_date.desc'}`;
      const res = await fetch(url);
      data = await res.json();
      data.results = filterReleased(data.results);
      data.results = filterOutNonDrama(data.results);
    } else {
      if (config.type === 'newest_movies') data = await fetchNewestKoreanMovies(viewAllState.page);
      else if (config.type === 'newest_tv') data = await fetchNewestKoreanSeries(viewAllState.page);
      else if (config.type === 'most_watched') data = await fetchMostWatchedKoreanSeries(viewAllState.page);
      else if (config.type === 'highest') data = await fetchHighestRatedKoreanSeries(viewAllState.page);
      else if (config.type === 'newest') data = await fetchNewestKoreanSeries(viewAllState.page);
      else if (config.type === 'ongoing') data = await fetchOngoingKoreanSeries(viewAllState.page);
      else if (config.type === 'completed') data = await fetchCompletedKoreanSeries(viewAllState.page);
    }

    if (!data.results || data.results.length === 0) {
      viewAllState.hasMore = false;
      document.getElementById('view-all-end').style.display = 'block';
      return;
    }

    viewAllState.maxPages = data.total_pages || 1;
    viewAllState.page += 1;

    data.results.forEach(function(item) {
      if (!item.poster_path) return;
      if (viewAllState.seenIds.has(item.id)) return;
      viewAllState.seenIds.add(item.id);
      item.media_type = config.media;
      const img = document.createElement('img');
      img.src = `${IMG_W500}${item.poster_path}`;
      img.alt = item.title || item.name;
      img.loading = 'lazy';
      img.dataset.id = item.id;
      img.onclick = function() { showDetails(item); };
      grid.appendChild(img);
    });

    if (viewAllState.page > viewAllState.maxPages) {
      viewAllState.hasMore = false;
      document.getElementById('view-all-end').style.display = 'block';
    }
  } catch (err) { console.error(err); }
  finally {
    viewAllState.loading = false;
    document.getElementById('view-all-loading').style.display = 'none';
  }
}

let viewAllScrollTimer = null;

function viewAllScrollHandler() {
  if (!viewAllState.initialized || viewAllState.loading || !viewAllState.hasMore) return;
  const page = document.getElementById('view-all-page');
  if (!page) return;
  clearTimeout(viewAllScrollTimer);
  viewAllScrollTimer = setTimeout(function() {
    if (page.scrollTop + page.clientHeight >= page.scrollHeight - 300) loadViewAllBatch();
  }, 150);
}

// ============================================================
// INIT
// ============================================================

async function init() {
  try {
    createSnow();
    loadTheme();
    renderProviders();
    renderContinueWatching();
    updateNotifBadge();
    populateCountryDropdowns();

    const notifToggle = document.getElementById('notif-toggle');
    if (notifToggle) notifToggle.checked = isNotifEnabled();

    const [top20Data, mostWatchedData, highestData, newestData, ongoingData, completedData, newestMoviesData] = await Promise.all([
      fetchTop20KoreanSeriesToday(1),
      fetchMostWatchedKoreanSeries(1),
      fetchHighestRatedKoreanSeries(1),
      fetchNewestKoreanSeries(1),
      fetchOngoingKoreanSeries(1),
      fetchCompletedKoreanSeries(1),
      fetchNewestKoreanMovies(1)
    ]);

    if (top20Data.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(5, top20Data.results.length));
      displayBanner(top20Data.results[randomIndex]);
    }

    renderTop20(top20Data.results, 'top20-kdrama-today', 'tv');
    renderTop20(mostWatchedData.results, 'most-watched-list', 'tv');
    renderTop20(highestData.results, 'highest-rated-list', 'tv');
    renderTop20(newestData.results, 'newest-kdrama-list', 'tv');
    appendToList(newestMoviesData.results, 'korean-movies-list', 'movie');
    renderTop20(ongoingData.results, 'ongoing-kdrama-list', 'tv');
    renderTop20(completedData.results, 'completed-kdrama-list', 'tv');

    generateNotifications().catch(function(err) { console.error('[MobiFlix] Notif error:', err); });

  } catch (err) { console.error('[MobiFlix] Init error:', err); }
}

function startSnowWhenReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() { if (!document.getElementById('snow-container')) createSnow(); }, 500);
    });
  } else {
    setTimeout(function() { if (!document.getElementById('snow-container')) createSnow(); }, 500);
  }
}

startSnowWhenReady();
init();

// ============================================================
// KEYBOARD
// ============================================================

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('modal');
    if (modal && modal.style.display === 'flex') {
      closeModalOnly();
      if (layerStack.length > 0) layerStack.pop();
      return;
    }
    closeAllPagesOnly();
    layerStack = [];
  }
});

// ============================================================
// LOGOUT
// ============================================================

function handleLogout() {
  if (confirm('Are you sure you want to log out?')) {
    logout();
    showLoginScreen();
  }
}