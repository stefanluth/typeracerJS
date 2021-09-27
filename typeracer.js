// api
let apiURL;
let xmlHttp = new XMLHttpRequest();
let specialChars = /[^A-Za-z ]/g;

// html containers
let resetButtonContainer = document.getElementById('reset-button'),
    statButtonContainer = document.getElementById('stat-button'),
    writtenWordsContainer = document.getElementById('written-words-container'),
    currentWordContainer = document.getElementById('current-word-container'),
    unwrittenWordsContainer = document.getElementById('unwritten-words-container'),
    currentTimeContainer = document.getElementById('table-data-time'),
    currentCpsContainer = document.getElementById('table-data-cps'),
    currentAccuracyContainer = document.getElementById('table-data-accuracy'),
    advancedStatsContainer = document.getElementById('total-stats-container'),
    totalVisitsContainer = document.getElementById('table-data-total-visits'),
    totalAttemptsContainer = document.getElementById('table-data-total-attempts'),
    totalTimeContainer = document.getElementById('table-data-total-time'),
    totalCharsContainer = document.getElementById('table-data-total-chars'),
    totalMistakesContainer = document.getElementById('table-data-total-mistakes'),
    totalCpsContainer = document.getElementById('table-data-avg-cps'),
    totalAccuracyContainer = document.getElementById('table-data-avg-accuracy'),
    sessionTimeContainer = document.getElementById('table-data-session-time'),
    sessionAttemptsContainer = document.getElementById('table-data-session-attempts'),
    sessionCharsContainer = document.getElementById('table-data-session-chars'),
    sessionMistakesContainer = document.getElementById('table-data-session-mistakes'),
    sessionCpsContainer = document.getElementById('table-data-session-cps'),
    sessionAccuracyContainer = document.getElementById('table-data-session-accuracy'),
    currentWordWrittenCharsContainer,
    currentCharContainer,
    currentRestContainer,
    unwrittenWordContainer;

// strings and lists manipulation
let unwrittenWords = [],
    finishedWord,
    currentChar = '',
    currentWord = '',
    currentWrittenChars;

// statistics & time keeping
let timeStarted = 0,
    timeStopped = 0,
    timeDifference = 0,
    mistakesCounter = 0,
    stringLength = 0,
    charPerSec = 0,
    accuracy = 0,
    measurementStarted;


// cookies & storage
let defaultCookies = {
        'totalVisits': 0,
        'totalTime': 0,
        'totalAttempts': 0,
        'totalChars': 0,
        'totalMistakes': 0
    },
    sessionStorage = window.sessionStorage;

function httpGet(wordCount) {
    // Gets words as a string from the API.
    apiURL = 'https://random-word-api.herokuapp.com/word?number=' + wordCount;
    xmlHttp.open("GET", apiURL, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function getWords(wordCount) {
    // Parses the raw string into an array of words and sets the stringLength.
    let unwrittenCharacters = httpGet(wordCount).replaceAll(specialChars, ' ');
    unwrittenCharacters = unwrittenCharacters.split('   ');
    unwrittenCharacters = unwrittenCharacters.join(' ').trim();
    unwrittenWords = unwrittenCharacters.split(' ');
    unwrittenWords.forEach(function (word, index, array) {
        array[index] = word.trim();
    });
    stringLength = unwrittenWords.join('').length;
}

function initializeWords() {
    // Initializes and resets all variables and containers.
    timeStarted = 0;
    timeStopped = 0;
    timeDifference = 0;
    mistakesCounter = 0;
    stringLength = 0;
    charPerSec = 0;
    accuracy = 0;
    measurementStarted = false;

    document.onkeypress = checkCharacter;

    currentChar = '';
    currentWrittenChars = '';
    currentWord = '';

    writtenWordsContainer.innerHTML = '';
    currentWordContainer.innerHTML = '';
    currentTimeContainer.innerHTML = '0';
    currentCpsContainer.innerHTML = '0';
    currentAccuracyContainer.innerHTML = '100%';
    unwrittenWordsContainer.innerHTML = '';


    if (currentCharContainer !== undefined) {
        currentCharContainer.innerHTML = '';
    }

    if (currentWordWrittenCharsContainer !== undefined) {
        currentWordWrittenCharsContainer.innerHTML = '';
    }

    if (currentRestContainer !== undefined) {
        currentRestContainer.innerHTML = '';
    }

    getWords(document.getElementById('wordCountSelect').value);
    fillUnwrittenWords();
    getNextChar();

    resetButtonContainer.blur();
}

function fillUnwrittenWords() {
    // (Re-)fills the container with unwritten words.
    unwrittenWordsContainer.innerHTML = '';
    unwrittenWords.forEach(function (unwrittenWord) {
        unwrittenWordContainer = document.createElement('span');
        unwrittenWordContainer.id = 'unwritten-word';
        unwrittenWordContainer.innerHTML = unwrittenWord + ' ';
        unwrittenWordsContainer.appendChild(unwrittenWordContainer);
    })
}

function getNextChar() {
    /*
     * Slices the current word to give the new current character.
     * Slices the list of unwritten words if current word is empty and resets the written characters.
     * Moves the finished written word vom current word container to finished words container.
     * Ends the statistics measurements when it's the last word & character.
     */
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
    /*
     * The main key press function:
     * Checks if the pressed key is equal to the currently required character.
     * If true: updates the containers.
     * If false: increments mistakes counter and highlights the letter red.
     */
    let keyPressed = keyPressEvent.key;

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
    } else {
        mistakesCounter += 1;
        currentCharContainer.style.backgroundColor = 'orangered';
    }
}

function startMeasurement() {
    // Starts the statistics measurements.
    measurementStarted = true;
    timeStarted = Date.now();
    incrementDocumentCookieValue('totalAttempts');
}

function endMeasurement() {
    // Ends the statistics measurements and updates the statistics containers and cookies/storage with the new values.
    measurementStarted = false;
    document.onkeypress = null;

    timeStopped = Date.now();
    timeDifference = ((timeStopped - timeStarted) / 1000).toFixed(2);

    charPerSec = (stringLength / timeDifference).toFixed(2);
    accuracy = ((1 - (mistakesCounter / stringLength)) * 100).toFixed(2);

    currentTimeContainer.innerHTML = `${timeDifference} s`;
    currentCpsContainer.innerHTML = charPerSec;
    currentAccuracyContainer.innerHTML = `${accuracy}%`;

    // cookie storage update
    incrementDocumentCookieValue('totalTime', parseFloat(timeDifference));
    incrementDocumentCookieValue('totalChars', stringLength);
    incrementDocumentCookieValue('totalMistakes', mistakesCounter);

    // session storage update
    incrementSessionStorageItem('totalTime', parseFloat(timeDifference));
    incrementSessionStorageItem('totalAttempts');
    incrementSessionStorageItem('totalChars', stringLength);
    incrementSessionStorageItem('totalMistakes', mistakesCounter);

    updateStatsContainer(cookieToObject(document.cookie));
}

function updateStatsContainer(cookieObject) {
    // Updates the statistics containers.
    let totalCps = (cookieObject.totalChars / cookieObject.totalTime).toFixed(2);
    let totalAccuracy = ((1 - (cookieObject.totalMistakes / cookieObject.totalChars)) * 100).toFixed(2);
    let sessionAttempts = sessionStorage.getItem('totalAttempts');
    let sessionChars = parseInt(sessionStorage.getItem('totalChars'));
    let sessionMistakes = parseInt(sessionStorage.getItem('totalMistakes'));
    let sessionTime = parseFloat(sessionStorage.getItem('totalTime')).toFixed(2);
    let sessionCps = sessionChars / sessionTime;
    let sessionAccuracy = ((1 - (sessionMistakes / sessionChars)) * 100);

    if (sessionCps.toString() === 'NaN') {
        sessionCps = 0;
        sessionAccuracy = 0;
    }
    if (totalCps.toString() === 'NaN') {
        totalCps = 0;
        totalAccuracy = 0;
    }

    // total stats
    totalVisitsContainer.innerHTML = cookieObject.totalVisits;
    totalAttemptsContainer.innerHTML = cookieObject.totalAttempts;
    totalTimeContainer.innerHTML = `${parseFloat(cookieObject.totalTime).toFixed(2)} s`;
    totalCharsContainer.innerHTML = cookieObject.totalChars;
    totalMistakesContainer.innerHTML = cookieObject.totalMistakes;
    totalCpsContainer.innerHTML = totalCps;
    totalAccuracyContainer.innerHTML = `${totalAccuracy} %`;

    // session stats
    sessionTimeContainer.innerHTML = `${sessionTime} s`;
    sessionAttemptsContainer.innerHTML = `${sessionAttempts}`;
    sessionCharsContainer.innerHTML = `${sessionChars}`;
    sessionMistakesContainer.innerHTML = `${sessionMistakes}`;
    sessionCpsContainer.innerHTML = sessionCps.toFixed(2);
    sessionAccuracyContainer.innerHTML = `${sessionAccuracy.toFixed(2)} %`;
}

function setCookie(cookieKey, cookieValue, expiryInMinutes =  60*24) {
    // Wrapper function to easily a create cookie.
    expiryInMinutes = expiryInMinutes * (60);
    return `${cookieKey}=${cookieValue};Max-Age=${expiryInMinutes};path=/typing_practice_2021;domain=localhost`;
}

function objectToDocumentCookies(cookieObject) {
    // Wrapper function to create multiple cookies using an object.
    for (const [key, value] of Object.entries(cookieObject)) {
        document.cookie = setCookie(key, value);
    }
}

function cookieToObject(cookie) {
    // Creates an object out of a cookie.
    let separatorIndex;
    let cookieKey, cookieValue;
    let cookieObject = {};

    cookie = cookie.split(';');

    cookie.forEach(function (element) {
        separatorIndex = element.indexOf('=') + 1;
        cookieKey = element.split('=')[0].trim();
        cookieValue = element.slice(separatorIndex).trim();
        cookieObject[cookieKey] = cookieValue;
    });

    return cookieObject;
}

function incrementDocumentCookieValue(cookieKey, incrementValue = 1) {
    // Wrapper function to increment a key value in the document.cookie.
    let userCookieObject = cookieToObject(document.cookie);
    let cookieValue = userCookieObject[cookieKey];

    if (cookieValue.indexOf('.') !== -1) {
        userCookieObject[cookieKey] = parseFloat(cookieValue) + incrementValue;
    } else {
        userCookieObject[cookieKey] = parseInt(cookieValue) + incrementValue;
    }

    return objectToDocumentCookies(userCookieObject);
}

function incrementSessionStorageItem(sessionKey, incrementValue = 1) {
    // Wrapper function to increment a key value in the session storage.
    let sessionValue = sessionStorage.getItem(sessionKey);

    if (sessionValue.indexOf('.') !== -1) {
        sessionStorage.setItem(sessionKey, `${parseFloat(sessionValue) + incrementValue}`);
    } else {
        sessionStorage.setItem(sessionKey, `${parseInt(sessionValue) + incrementValue}`);
    }
}

function advancedStats() {
    // Shows/hides and updates the advanced stats containers.
    if (advancedStatsContainer.style.display === 'none') {
        advancedStatsContainer.style.display = 'block';
    } else {
        advancedStatsContainer.style.display = 'none';
    }

    updateStatsContainer(cookieToObject(document.cookie));

    statButtonContainer.blur()
}

// Create cookies of none are present.
if (!document.cookie) {
    console.log('Setting default cookies');
    objectToDocumentCookies(defaultCookies);
}


incrementDocumentCookieValue('totalVisits', 1);

initializeWords();
advancedStatsContainer.style.display = 'none';

sessionStorage.setItem('totalTime', '0');
sessionStorage.setItem('totalAttempts', '0');
sessionStorage.setItem('totalChars', '0');
sessionStorage.setItem('totalMistakes', '0');

updateStatsContainer(cookieToObject(document.cookie));
