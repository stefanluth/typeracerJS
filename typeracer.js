// api
let apiURL;
let xmlHttp = new XMLHttpRequest();
let specialChars = /[^A-Za-z ]/g;

// containers
let buttonContainer = document.getElementById('reset-button'),
    writtenWordsContainer = document.getElementById('written-words-container'),
    currentWordContainer = document.getElementById('current-word-container'),
    unwrittenWordsContainer = document.getElementById('unwritten-words-container'),
    timeContainer = document.getElementById('table-data-time'),
    cpsContainer = document.getElementById('table-data-cps'),
    accuracyContainer = document.getElementById('table-data-accuracy'),
    currentWordWrittenCharsContainer,
    currentCharContainer,
    currentRestContainer,
    unwrittenWordContainer;

// strings and lists manipulation
let unwrittenCharacters = '',
    unwrittenWords = [],
    finishedWord,
    currentChar = '',
    currentWord = '',
    currentWrittenChars;

// statistics & time keeping
let timeStarted = 0,
    timeStopped = 0,
    timeDifference = 0,
    wrongKeysCounter = 0,
    lengthOfString = 0,
    charPerSec = 0,
    accuracy = 0;

let measurementStarted;
let keyPressed;


function httpGet(wordCount) {
    apiURL = 'https://random-word-api.herokuapp.com/word?number=' + wordCount;
    xmlHttp.open( "GET", apiURL, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function getWords(wordCount) {
    unwrittenCharacters = httpGet(wordCount).replaceAll(specialChars, ' ');
    unwrittenCharacters = unwrittenCharacters.split('   ');
    unwrittenCharacters = unwrittenCharacters.join(' ').trim();
    unwrittenWords = unwrittenCharacters.split(' ');
    unwrittenWords.forEach(function (word, index, array) {array[index] = word.trim();});
    lengthOfString = unwrittenWords.join('').length;
}

function initializeWords() {
    timeStarted = 0;
    timeStopped = 0;
    timeDifference = 0;
    wrongKeysCounter = 0;
    lengthOfString = 0;
    charPerSec = 0;
    accuracy = 0;
    measurementStarted = false;
    document.onkeypress = checkCharacter;

    currentChar = '';
    currentWrittenChars = '';
    currentWord = '';

    writtenWordsContainer.innerHTML = '';
    currentWordContainer.innerHTML = '';
    timeContainer.innerHTML = '0';
    cpsContainer.innerHTML = '0';
    accuracyContainer.innerHTML = '100%';
    if (currentCharContainer !== undefined) {
        currentCharContainer.innerHTML = '';
    }
    if (currentWordWrittenCharsContainer !== undefined) {
        currentWordWrittenCharsContainer.innerHTML = '';
    }
    if (currentRestContainer !== undefined) {
        currentRestContainer.innerHTML = '';
    }
    unwrittenWordsContainer.innerHTML = '';

    getWords(document.getElementById('wordCountSelect').value);
    fillUnwrittenWords();
    getNextChar();

    buttonContainer.blur();
}

function fillUnwrittenWords() {
    unwrittenWordsContainer.innerHTML = '';
    unwrittenWords.forEach(function (unwrittenWord) {
        unwrittenWordContainer = document.createElement('span');
        unwrittenWordContainer.id = 'unwritten-word';
        unwrittenWordContainer.innerHTML = unwrittenWord + ' ';
        unwrittenWordsContainer.appendChild(unwrittenWordContainer);
    })
}

function getNextChar() {
    if (currentWord.length === 0) {
        currentWrittenChars = '';
        currentWord = unwrittenWords.shift() + ' ';
        fillUnwrittenWords();
    }
    currentChar = currentWord[0];

    currentWord = currentWord.slice(1);
    currentWordContainer.innerHTML = '';

    currentCharContainer = document.createElement('span');
    currentCharContainer.id = 'current-character';
    currentCharContainer.innerHTML = currentChar;
    currentWordContainer.appendChild(currentCharContainer);

    currentRestContainer = document.createElement('span');
    currentRestContainer.id = 'unwritten-word';
    currentRestContainer.innerHTML = currentWord;
    currentWordContainer.appendChild(currentRestContainer);

    if (unwrittenWords.length === 0 && currentChar === ' ') {
        currentRestContainer.innerHTML = '';
        currentCharContainer.innerHTML = '';
        endMeasurement();
    }
}

function checkCharacter(keyPressEvent) {
    keyPressed = keyPressEvent.key;

    if (measurementStarted === false) {
        startMeasurement();
    }

    if (keyPressed === currentChar) {
        currentWrittenChars += currentChar;
        currentWordWrittenCharsContainer = document.createElement('span');
        currentWordWrittenCharsContainer.id = 'written-word';
        currentWordWrittenCharsContainer.innerHTML = currentWrittenChars;
        if (currentWrittenChars[currentWrittenChars.length - 1] === ' ') {
            finishedWord = document.createElement('span');
            finishedWord.id = 'written-word';
            finishedWord.innerHTML = currentWrittenChars;
            writtenWordsContainer.appendChild(finishedWord);
            currentWordWrittenCharsContainer.innerHTML = '';
        }
        getNextChar();
        currentWordContainer.insertAdjacentElement('afterbegin', currentWordWrittenCharsContainer);
    }
    else {
        wrongKeysCounter += 1;
        currentCharContainer.style.backgroundColor = 'orangered';
    }
}

function startMeasurement() {
    measurementStarted = true;
    timeStarted = Date.now();
    wrongKeysCounter = 0
}

function endMeasurement() {
    measurementStarted = false;
    document.onkeypress = null;

    timeStopped = Date.now();
    timeDifference = ((timeStopped - timeStarted)/1000).toFixed(2);
    charPerSec = (lengthOfString/timeDifference).toFixed(2);
    accuracy = ((1 - (wrongKeysCounter/lengthOfString)) * 100).toFixed(2);

    timeContainer.innerHTML = `${timeDifference} s`;
    cpsContainer.innerHTML = charPerSec;
    accuracyContainer.innerHTML = `${accuracy}%`;
}


initializeWords();