//where the magic happens
const API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const audio = new Audio();
let currentWord = null;
// getting the elements from the DOM
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const details = document.getElementById('word-details');
const error = document.getElementById('error-message');
const favList = document.getElementById('favorites-list');
const saveBtn = document.getElementById('save-word-btn');
const playBtn = document.getElementById('word-audio');
//the function to fetch the word data from the API
async function getWord(word) {
    const res = await fetch(API + word.toLowerCase()); // API expects lowercase
    if (!res.ok) throw new Error('Word not found');
    return (await res.json())[0]; // we take the first result and turn it into an object
}

function showWord(data) {
    currentWord = data;// store the current word data for later use

    const meaning = data.meanings?.[0]; // we take the first meaning 
    const def = meaning?.definitions?.[0]; // we take the first definition of that meaning

    if (!meaning || !def) {
        error.textContent = 'No data available'; //if error occurs, we show the error message and hide the details section
        return;
    }

    document.getElementById('word-title').textContent = data.word;
    document.getElementById('word-punctuation').textContent =
        data.phonetic || data.phonetics?.[0]?.text || '';// we show the phonetic transcription if available

    document.querySelector('#word-type span').textContent = meaning.partOfSpeech;
    document.querySelector('#word-meaning span').textContent = def.definition;
    document.querySelector('#word-example span').textContent =
        def.example || 'No example';
    document.querySelector('#word-synonyms span').textContent =
        meaning.synonyms?.join(', ') || 'N/A';
    document.querySelector('#word-antonyms span').textContent =
        meaning.antonyms?.join(', ') || 'N/A';// we show the synonyms and antonyms if available

    const track = data.phonetics?.find(p => p.audio);// we look for the first phonetic entry that has an audio file
    if (track) {
        audio.src = track.audio;// we set the audio source to that file
        playBtn.style.display = 'inline';// we show the play button
    } else {
        playBtn.style.display = 'none';// if no audio is available, we hide the play button
    }

    details.style.display = 'block';
}

function loadFavs() {
    const favs = JSON.parse(localStorage.getItem('favs')) || [];// we get the favorites from localStorage, or an empty array if none
    favList.innerHTML = favs.map(w => `<li>${w}</li>`).join('');// we create a list item for each favorite word and join them into a single string to set as the innerHTML of the favorites list
}

function saveFav() {
    if (!currentWord) return;

    const favs = JSON.parse(localStorage.getItem('favs')) || [];
    if (!favs.includes(currentWord.word)) {
        favs.push(currentWord.word);// we add the current word to the favorites list if it's not already there
        localStorage.setItem('favs', JSON.stringify(favs));// we save the updated favorites list back to localStorage
        loadFavs();
    }
}

form.onsubmit = async (e) => {// we make the form submission an asynchronous function to handle the API call
    e.preventDefault();// we prevent the default form submission behavior
    const word = input.value.trim();
    if (!word) return;// if the input is empty, we do nothing

    error.textContent = 'Searching...';
    details.style.display = 'none';

    try {
        const data = await getWord(word);// we fetch the word data from the API
        error.textContent = '';
        showWord(data);
    } catch (err) {
        error.textContent = err.message;
    }
};

saveBtn.onclick = saveFav;
playBtn.onclick = () => audio.play();

loadFavs();// we load the favorites when the page loads