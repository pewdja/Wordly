// Select DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const wordDetails = document.getElementById('word-details');
const errorMessage = document.getElementById('error-message');
const favoritesList = document.getElementById('favorites-list');
const audio = document.getElementById('audio-element');

async function fetchWord(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) throw new Error("Word not found.");
    const data = await response.json();
    return data[0];
}

function renderWord(data) {
    document.getElementById('word-title').textContent = data.word;
    document.getElementById('word-phonetic').textContent = data.phonetic || "";
    
    const meaning = data.meanings[0];
    const definition = meaning.definitions[0];

    document.querySelector('#word-type span').textContent = meaning.partOfSpeech;
    document.querySelector('#word-meaning span').textContent = definition.definition;
    document.querySelector('#word-example span').textContent = definition.example || "No example available.";
    
    const synonyms = meaning.synonyms.length ? meaning.synonyms.join(', ') : "None";
    document.querySelector('#word-synonyms span').textContent = synonyms;
    const antonyms = meaning.antonyms.length ? meaning.antonyms.join(', ') : "None";
    document.querySelector('#word-antonyms span').textContent = antonyms;


    const audioEntry = data.phonetics.find(p => p.audio !== "");
    const audioBtn = document.getElementById('word-audio');
    if (audioEntry) {
        audio.src = audioEntry.audio;
        audioBtn.style.display = 'inline-block';
    } else {
        audioBtn.style.display = 'none';
    }

    wordDetails.style.display = 'block';
}

function saveToFavorites(word) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(word)) {
        favorites.push(word);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites();
    }
}

function renderFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesList.innerHTML = favorites.map(w => `<li onclick="quickSearch('${w}')">${w}</li>`).join('');
}

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const word = searchInput.value.trim();
    errorMessage.textContent = "";
    wordDetails.style.display = 'none';

    if (!word) return;

    try {
        const data = await fetchWord(word);
        renderWord(data);
    } catch (err) {
        errorMessage.textContent = err.message;
    }
});

document.getElementById('save-word-btn').addEventListener('click', () => {
    const word = document.getElementById('word-title').textContent;
    saveToFavorites(word);
});

document.getElementById('word-audio').addEventListener('click', () => audio.play());

window.quickSearch = (word) => {
    searchInput.value = word;
    searchForm.dispatchEvent(new Event('submit'));
};
renderFavorites();
