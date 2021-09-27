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
    advancedStatsContainer = document.getElementById('advanced-stats-container'),
    totalVisitsContainer = document.getElementById('table-data-total-visits'),
    totalAttemptsContainer = document.getElementById('table-data-total-attempts'),
    totalTimeContainer = document.getElementById('table-data-total-time'),
    totalCharsContainer = document.getElementById('table-data-total-chars'),
    totalMistakesContainer = document.getElementById('table-data-total-mistakes'),
    avgCpsContainer = document.getElementById('table-data-avg-cps'),
    avgAccuracyContainer = document.getElementById('table-data-avg-accuracy'),
    sessionTimeContainer = document.getElementById('table-data-session-time'),
    sessionAttemptsContainer = document.getElementById('table-data-session-attempts'),
    sessionCharsContainer = document.getElementById('table-data-session-chars'),
    sessionMistakesContainer = document.getElementById('table-data-session-mistakes'),
    sessionAvgCpsContainer = document.getElementById('table-data-session-cps'),
    sessionAvgAccuracyContainer = document.getElementById('table-data-session-accuracy'),
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


// cookies
let defaultCookies = {
        'totalVisits': 0,
        'totalTime': 0,
        'totalAttempts': 0,
        'totalChars': 0,
        'totalMistakes': 0
    },
    sessionStorage = window.sessionStorage;

let measurementStarted;
let keyPressed;


function httpGet(wordCount) {
    apiURL = 'https://random-word-api.herokuapp.com/word?number=' + wordCount;
    xmlHttp.open("GET", apiURL, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function getWords(wordCount) {
    unwrittenCharacters = httpGet(wordCount).replaceAll(specialChars, ' ');
    unwrittenCharacters = unwrittenCharacters.split('   ');
    unwrittenCharacters = unwrittenCharacters.join(' ').trim();
    unwrittenWords = unwrittenCharacters.split(' ');
    unwrittenWords.forEach(function (word, index, array) {
        array[index] = word.trim();
    });
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
    } else {
        wrongKeysCounter += 1;
        currentCharContainer.style.backgroundColor = 'orangered';
    }
}

function startMeasurement() {
    measurementStarted = true;
    timeStarted = Date.now();
    wrongKeysCounter = 0;
    incrementDocumentCookieValue('totalAttempts');
}

function endMeasurement() {
    measurementStarted = false;
    document.onkeypress = null;

    timeStopped = Date.now();
    timeDifference = ((timeStopped - timeStarted) / 1000).toFixed(2);

    charPerSec = (lengthOfString / timeDifference).toFixed(2);
    accuracy = ((1 - (wrongKeysCounter / lengthOfString)) * 100).toFixed(2);

    timeContainer.innerHTML = `${timeDifference} s`;
    cpsContainer.innerHTML = charPerSec;
    accuracyContainer.innerHTML = `${accuracy}%`;

    // cookie storage update
    incrementDocumentCookieValue('totalTime', parseFloat(timeDifference));
    incrementDocumentCookieValue('totalChars', lengthOfString);
    incrementDocumentCookieValue('totalMistakes', wrongKeysCounter);

    // session storage update
    incrementSessionStorageItem('totalTime', parseFloat(timeDifference))
    incrementSessionStorageItem('totalAttempts')
    incrementSessionStorageItem('totalChars', lengthOfString)
    incrementSessionStorageItem('totalMistakes', wrongKeysCounter)

    updateStatsContainer(cookieToObject(document.cookie))

}

function updateStatsContainer(cookieObject) {
    let totalCps = (cookieObject.totalChars / cookieObject.totalTime).toFixed(2);
    let totalAccuracy = ((1 - (cookieObject.totalMistakes / cookieObject.totalChars)) * 100).toFixed(2);
    let sessionChars = parseInt(sessionStorage.getItem('totalChars'))
    let sessionMistakes = parseInt(sessionStorage.getItem('totalMistakes'))
    let sessionTime = parseFloat(sessionStorage.getItem('totalTime')).toFixed(2)
    let sessionCps = sessionChars / sessionTime;
    let sessionAccuracy = ((1 - (sessionMistakes / sessionChars)) * 100)

    totalVisitsContainer.innerHTML = cookieObject.totalVisits;
    totalAttemptsContainer.innerHTML = cookieObject.totalAttempts;
    totalTimeContainer.innerHTML = `${parseFloat(cookieObject.totalTime).toFixed(2)} s`;
    totalCharsContainer.innerHTML = cookieObject.totalChars;
    totalMistakesContainer.innerHTML = cookieObject.totalMistakes;
    avgCpsContainer.innerHTML = totalCps;
    avgAccuracyContainer.innerHTML = `${totalAccuracy} %`;

    if (sessionCps.toString() === 'NaN') {
        sessionCps = 0
        sessionAccuracy = 0
    }

    sessionTimeContainer.innerHTML = `${sessionTime} s`;
    sessionAttemptsContainer.innerHTML = sessionStorage.getItem('totalAttempts');
    sessionCharsContainer.innerHTML = `${sessionChars}`;
    sessionMistakesContainer.innerHTML = `${sessionMistakes}`;
    sessionAvgCpsContainer.innerHTML = sessionCps.toFixed(2)
    sessionAvgAccuracyContainer.innerHTML = `${sessionAccuracy.toFixed(2)} %`
}

function setCookie(cookieKey, cookieValue, expiryInMinutes = 10) {
    expiryInMinutes = expiryInMinutes * (60);
    return `${cookieKey}=${cookieValue};Max-Age=${expiryInMinutes};path=/typing_practice_2021;domain=localhost`;
}

function objectToDocumentCookies(cookieObject) {
    for (const [key, value] of Object.entries(cookieObject)) {
        document.cookie = setCookie(key, value);
    }
}

function cookieToObject(cookie) {
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
    let sessionValue = sessionStorage.getItem(sessionKey);
    if (sessionValue.indexOf('.') !== -1) {
        sessionStorage.setItem(sessionKey, `${parseFloat(sessionValue) + incrementValue}`)
    } else {
        sessionStorage.setItem(sessionKey, `${parseInt(sessionValue) + incrementValue}`)
    }
}

function advancedStats() {
    if (advancedStatsContainer.style.display === 'none') {
        advancedStatsContainer.style.display = 'block';
    } else {
        advancedStatsContainer.style.display = 'none';
    }
    updateStatsContainer(cookieToObject(document.cookie));
}


if (!document.cookie) {
    console.log('Setting default cookies')
    objectToDocumentCookies(defaultCookies);
}

incrementDocumentCookieValue('totalVisits', 1);

initializeWords();
advancedStatsContainer.style.display = 'none';

sessionStorage.setItem('totalTime', '0');
sessionStorage.setItem('totalAttempts', '0');
sessionStorage.setItem('totalChars', '0');
sessionStorage.setItem('totalMistakes', '0');
