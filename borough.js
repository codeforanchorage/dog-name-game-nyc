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
                parseJSON(httpRequest.responseText)
                startGame()
            } else {
                alert("Sorry, couldn't load the dog name data")
            }
        }
    }
    httpRequest.open('GET', 'nyc_dog_name_uniqueness.json')
    httpRequest.send()
}

function parseJSON(text) {
    var data = JSON.parse(text)
    var boroughs = data.boroughs
    for (var borough in boroughs) {
        var names = boroughs[borough]
        for (var i = 0; i < names.length; i++) {
            var entry = names[i]
            all_names.push({
                borough: borough,
                rank: entry.rank,
                name: entry.name,
                uniqueness_score: entry.uniqueness_score,
                borough_count: entry.borough_count,
                borough_per_10k: entry.borough_per_10k,
                nyc_count: entry.nyc_count,
                nyc_per_10k: entry.nyc_per_10k,
                concentration: entry.concentration
            })
        }
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

    var scoreText = current_name.uniqueness_score.toFixed(1) + 'x'
    detailDiv.innerHTML = '<strong>' + current_name.name + '</strong> is ' + scoreText +
        ' more popular in <strong>' + current_name.borough + '</strong> than the city average' +
        '<br>' + current_name.borough_per_10k + ' per 10k in ' + current_name.borough +
        ' vs. ' + current_name.nyc_per_10k + ' per 10k citywide' +
        '<br>(' + current_name.borough_count + ' in borough, ' + current_name.nyc_count + ' citywide)'

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
