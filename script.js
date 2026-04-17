const API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const audio = new Audio();
let currentWord = null;

const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const details = document.getElementById('word-details');
const error = document.getElementById('error-message');
const favList = document.getElementById('favorites-list');
const saveBtn = document.getElementById('save-word-btn');
const playBtn = document.getElementById('word-audio');

async function getWord(word) {
    const res = await fetch(API + word.toLowerCase());
    if (!res.ok) throw new Error('Word not found');
    return (await res.json())[0];
}

function showWord(data) {
    currentWord = data;

    const meaning = data.meanings?.[0];
    const def = meaning?.definitions?.[0];

    if (!meaning || !def) {
        error.textContent = 'No data available';
        return;
    }

    document.getElementById('word-title').textContent = data.word;
    document.getElementById('word-punctuation').textContent =
        data.phonetic || data.phonetics?.[0]?.text || '';

    document.querySelector('#word-type span').textContent = meaning.partOfSpeech;
    document.querySelector('#word-meaning span').textContent = def.definition;
    document.querySelector('#word-example span').textContent =
        def.example || 'No example';
    document.querySelector('#word-synonyms span').textContent =
        meaning.synonyms?.join(', ') || 'N/A';
    document.querySelector('#word-antonyms span').textContent =
        meaning.antonyms?.join(', ') || 'N/A';

    const track = data.phonetics?.find(p => p.audio);
    if (track) {
        audio.src = track.audio;
        playBtn.style.display = 'inline';
    } else {
        playBtn.style.display = 'none';
    }

    details.style.display = 'block';
}

function loadFavs() {
    const favs = JSON.parse(localStorage.getItem('favs')) || [];
    favList.innerHTML = favs.map(w => `<li>${w}</li>`).join('');
}

function saveFav() {
    if (!currentWord) return;

    const favs = JSON.parse(localStorage.getItem('favs')) || [];
    if (!favs.includes(currentWord.word)) {
        favs.push(currentWord.word);
        localStorage.setItem('favs', JSON.stringify(favs));
        loadFavs();
    }
}

form.onsubmit = async (e) => {
    e.preventDefault();
    const word = input.value.trim();
    if (!word) return;

    error.textContent = 'Searching...';
    details.style.display = 'none';

    try {
        const data = await getWord(word);
        error.textContent = '';
        showWord(data);
    } catch (err) {
        error.textContent = err.message;
    }
};

saveBtn.onclick = saveFav;
playBtn.onclick = () => audio.play();

loadFavs();