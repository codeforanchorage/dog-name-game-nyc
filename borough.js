var NUMBER_OF_ROUNDS = 10
var rounds_played = 0
var correct_rounds = 0
var all_names = []
var used_indices = []
var current_name = null
var waiting_for_click = true

var BOROUGH_IDS = {
    'Manhattan': 'map-manhattan',
    'Brooklyn': 'map-brooklyn',
    'Queens': 'map-queens',
    'The Bronx': 'map-the-bronx',
    'Staten Island': 'map-staten-island'
}

loadData()

function loadData() {
    var httpRequest = new XMLHttpRequest()
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                parseCSV(httpRequest.responseText)
                startGame()
            } else {
                alert("Sorry, couldn't load the dog name data")
            }
        }
    }
    httpRequest.open('GET', 'nyc_dog_name_uniqueness.csv')
    httpRequest.send()
}

function parseCSV(text) {
    var lines = text.trim().split('\n')
    // skip header
    for (var i = 1; i < lines.length; i++) {
        var parts = lines[i].split(',')
        all_names.push({
            borough: parts[0],
            rank: parseInt(parts[1]),
            name: parts[2],
            lift: parseFloat(parts[3]),
            borough_count: parseInt(parts[4]),
            citywide_count: parseInt(parts[5])
        })
    }
}

function startGame() {
    rounds_played = 0
    correct_rounds = 0
    used_indices = []

    // build round bones
    var roundDiv = document.getElementById('borough-round')
    roundDiv.innerHTML = ''
    for (var i = 0; i < NUMBER_OF_ROUNDS; i++) {
        var s = document.createElement('span')
        s.className = 'bone'
        roundDiv.appendChild(s)
    }

    document.getElementById('final-results-borough').className = 'borough-hidden'
    playRound()
}

function pickRandomName() {
    var available = []
    for (var i = 0; i < all_names.length; i++) {
        if (used_indices.indexOf(i) === -1) {
            available.push(i)
        }
    }
    var idx = available[Math.floor(Math.random() * available.length)]
    used_indices.push(idx)
    return all_names[idx]
}

function playRound() {
    current_name = pickRandomName()
    waiting_for_click = true

    document.getElementById('borough-play').style.display = 'block'
    document.getElementById('borough-results').className = 'borough-hidden'

    document.getElementById('dog-name-display').innerText = current_name.name

    // reset map colors
    resetMap()

    // update round indicator
    var bones = document.querySelectorAll('#borough-round span')
    for (var i = 0; i < bones.length; i++) {
        if (i < rounds_played) continue
        bones[i].className = 'bone'
    }
}

function resetMap() {
    var paths = document.querySelectorAll('#borough-map path')
    for (var i = 0; i < paths.length; i++) {
        paths[i].className.baseVal = ''
    }
}

function boroughClicked(borough) {
    if (!waiting_for_click) return
    waiting_for_click = false

    var is_correct = (borough === current_name.borough)
    var resultDiv = document.getElementById('borough-result')
    var detailDiv = document.getElementById('borough-detail')

    // highlight correct borough
    var correctPath = document.getElementById(BOROUGH_IDS[current_name.borough])
    correctPath.className.baseVal = is_correct ? 'correct-borough' : 'highlight-correct'

    // if wrong, also dim the clicked borough
    if (!is_correct) {
        var wrongPath = document.getElementById(BOROUGH_IDS[borough])
        wrongPath.className.baseVal = 'wrong-borough'
    }

    resultDiv.innerText = is_correct ? 'Correct!' : 'Wrong!'
    resultDiv.className = is_correct ? 'correct' : 'wrong'

    var liftText = current_name.lift.toFixed(1) + 'x'
    detailDiv.innerHTML = '<strong>' + current_name.name + '</strong> is ' + liftText +
        ' more popular in <strong>' + current_name.borough + '</strong> than the city average' +
        '<br>(' + current_name.borough_count + ' in ' + current_name.borough +
        ' out of ' + current_name.citywide_count + ' citywide)'

    // update bone
    var bones = document.querySelectorAll('#borough-round span')
    bones[rounds_played].className = 'bone ' + (is_correct ? 'correct' : 'wrong')

    rounds_played++
    if (is_correct) correct_rounds++

    document.getElementById('borough-results').className = ''
}

function nextRound() {
    if (rounds_played === NUMBER_OF_ROUNDS) {
        showFinalResults()
    } else {
        playRound()
    }
}

function showFinalResults() {
    document.getElementById('borough-play').style.display = 'none'
    document.getElementById('borough-results').className = 'borough-hidden'
    document.getElementById('final-results-borough').className = ''
    document.getElementById('final-score').innerText =
        'You got ' + correct_rounds + ' out of ' + NUMBER_OF_ROUNDS + ' correct!'
}
