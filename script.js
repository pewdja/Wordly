
const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

let currentWordData = null;
const audioController = new Audio();

const ui = {
    form: document.getElementById('search-form'),
    input: document.getElementById('search-input'),
    details: document.getElementById('word-details'),
    error: document.getElementById('error-message'),
    favList: document.getElementById('favorites-list'),
    saveBtn: document.getElementById('save-word-btn')
};

async function lookupWord(word) {
    const response = await fetch(`${API_BASE_URL}${word.toLowerCase()}`);
    if (!response.ok) throw new Error('We couldn’t find that word in our records.');
    const [data] = await response.json();
    return data;
}

const displayResult = (data) => {
    currentWordData = data; // Store for favorites
    const { word, meanings, phonetics, phonetic } = data;

    ui.details.querySelector('#word-title').textContent = word;
    ui.details.querySelector('#word-punctuation').textContent = phonetic || phonetics[0]?.text || '';
    
    const sense = meanings[0];
    const def = sense.definitions[0];

    const slots = {
        '#word-type span': sense.partOfSpeech,
        '#word-meaning span': def.definition,
        '#word-example span': def.example || 'No example provided.',
        '#word-synonyms span': sense.synonyms?.join(', ') || 'N/A',
        '#word-antonyms span': sense.antonyms?.join(', ') || 'N/A'
    };

    Object.entries(slots).forEach(([selector, text]) => {
        const el = ui.details.querySelector(selector);
        if (el) el.textContent = text;
    });

    // Audio Setup
    const track = phonetics.find(p => p.audio !== '');
    const playBtn = document.getElementById('word-audio');
    
    if (track) {
        audioController.src = track.audio;
        playBtn.style.display = 'inline-block';
    } else {
        playBtn.style.display = 'none';
    }

    ui.details.style.display = 'block';
};

const syncFavorites = () => {
    const list = JSON.parse(localStorage.getItem('oxforder_favs')) || [];
    ui.favList.innerHTML = list.map(item => `<li>${item}</li>`).join('');
};

const addToFavorites = () => {
    if (!currentWordData) return;
    const list = JSON.parse(localStorage.getItem('oxforder_favs')) || [];
    if (!list.includes(currentWordData.word)) {
        list.push(currentWordData.word);
        localStorage.setItem('oxforder_favs', JSON.stringify(list));
        syncFavorites();
    }
};

ui.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = ui.input.value.trim();
    if (!query) return;

    ui.error.textContent = 'Searching...';
    ui.details.style.display = 'none';

    try {
        const data = await lookupWord(query);
        ui.error.textContent = '';
        displayResult(data);
    } catch (err) {
        ui.error.textContent = err.message;
    }
});

ui.saveBtn.addEventListener('click', addToFavorites);
document.getElementById('word-audio').addEventListener('click', () => audioController.play());

syncFavorites();
