// const dogs = require('./dogs.json')

var NUMBER_OF_ROUNDS = 10
var is_hard_mode = false
var rounds_played = 0
var correct_rounds = 0
var current_dog_pair = null
var dogs = []
var loading = true;

var DOG_DATA_URL = 'nyc_dog_names_all.json'
/*  Dog data as an array of objects:
    [{"name": "FIDO", "count": "30"}, {"name": ...]
    The input script transforms the 'name' parameter to lowercase
    and parses the 'count' parameter to an integrer
*/

getDogData()

function getDogData(){
    httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      alert("I'm sorry - I can't load the dog data");
      return false;
    }
    httpRequest.onreadystatechange = incoming;
    httpRequest.open('GET', DOG_DATA_URL);
    httpRequest.send();
  }

  function incoming() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        dogs = JSON.parse(httpRequest.responseText);
        dogs.forEach(function(dog){
            dog.count = parseInt(dog.count)
            dog.name = dog.name.toLowerCase()
        })
        var htmlElement = document.querySelector("html");
        htmlElement.className = ""
        loading = false
      } else {
        alert("I'm sorry - the was an error loading the dog data");
      }
    }
  }


// Grabs 2 dogs from the (global) dog list
// You can tune the difficulty by passing in the maximim and minimum difference
// in popularity count. Both are nullable.
function getTwoDogs(minimum_count_diff, maximum_count_diff) {
    var dog1 = dogs[Math.floor(Math.random() * dogs.length)]

    var other_dogs = dogs.filter(function(dog) {
        // check for minimum difference
        if (!isNaN(parseInt(minimum_count_diff))) {
            if (Math.abs(dog.count - dog1.count) < parseInt(minimum_count_diff)) {
                return false
            }
        }

        // check for maximum difference
        if (!isNaN(parseInt(maximum_count_diff))) {
            if (Math.abs(dog.count - dog1.count) > parseInt(maximum_count_diff)) {
                return false
            }
        }

        // make sure they don't have the same count
        if (dog.count === dog1.count) return false

        return true
    })
    var dog2 = other_dogs[Math.floor(Math.random() * other_dogs.length)]

    /* Dog1 is almost guarateened to be the lowest score because
       the distribution strongly favors picking a very low-numbered name
       so let's randomize the order a bit
    */
    return Math.random() < 0.5 ? [ dog1, dog2 ] : [ dog2, dog1 ]
}

function getTwoIcons() {
    // list in './dogIconClasses.js'
    var num_of_icons = dogIconsClasses.length;
    var idx1 = Math.floor(Math.random() * num_of_icons);
    // Calculate second index with offset so we get unique icons
    var idx2 = (idx1 + 1 + Math.floor(Math.random() * (num_of_icons - 1))) % num_of_icons
    return [dogIconsClasses[idx1], dogIconsClasses[idx2]]
}

// Set mode and begin the game
function chooseMode(_is_hard_mode) {
    is_hard_mode = _is_hard_mode

    var count_div = document.querySelector('#round');

    (function addBone(n){
        var s = document.createElement('span');
        s.className = "bone"
        count_div.appendChild(s)
        if(n<NUMBER_OF_ROUNDS) setTimeout(function() {
            addBone(++n);
        }, 50)
    })(1)

    playARound()
}


// Gets new dog choices and displays them
function playARound() {
    document.body.className = 'play'

    if (is_hard_mode) {
        current_dog_pair = getTwoDogs(null, 1) // hard mode
    }
    else {
        current_dog_pair = getTwoDogs(10, null) // easy mode
    }

    iconClasses = getTwoIcons();

    document.querySelector('#roundNumber').innerText = rounds_played + 1 + ' / ' + NUMBER_OF_ROUNDS

    document.querySelectorAll('#play button')[0].innerText = current_dog_pair[0].name
    document.querySelectorAll('#play button')[0].className = iconClasses[0];

    document.querySelectorAll('#play button')[1].innerText = current_dog_pair[1].name
    document.querySelectorAll('#play button')[1].className = iconClasses[1];

}


// Displays results of a choice
function displayResults(is_correct) {
    document.body.className = 'results'

    document.querySelector('#gameNav #result').innerText = (is_correct ? 'Correct' : 'Wrong')
    document.querySelector('#gameNav #result').className = is_correct ? 'correct' : 'wrong'

    var count_div = document.querySelectorAll('#round span')[rounds_played].className += is_correct ? " correct" : " wrong"
    var result_divs = document.querySelectorAll('#counts div')
    result_divs[0].innerHTML = current_dog_pair[0].name + '<br>' + current_dog_pair[0].count + ' dogs'
    result_divs[0].className = iconClasses[0] + (current_dog_pair[0].count > current_dog_pair[1].count ? " correct" : " wrong")

    result_divs[1].innerHTML = current_dog_pair[1].name + '<br>' + current_dog_pair[1].count + ' dogs'
    result_divs[1].className = iconClasses[1] + (current_dog_pair[1].count > current_dog_pair[0].count ? " correct" : " wrong")
}


// Displays final results
function displayFinalResults() {
    document.body.className = 'final_results'

    document.querySelector('#final_results h2').innerText = 'You got ' + correct_rounds + ' out of ' + NUMBER_OF_ROUNDS + ' correct'

    var social_text = "I just scored " + correct_rounds + " out of " + NUMBER_OF_ROUNDS + " on the New York City Dog Name Game!"
    document.querySelector('#twitter-link').href = "https://twitter.com/home?status=" + encodeURIComponent(social_text)

    // initialize()
}


// Onclick handler for choosing a dog
function nameChosen(name) {
    var popular_dog = current_dog_pair.slice().sort(function(a, b) {
        return a.count - b.count
    })[1] // prevent sorting original array
    var is_correct = name.toLowerCase() === popular_dog.name

    displayResults(is_correct)

    rounds_played++
    if (is_correct) correct_rounds++

    return false // onclick event response
}


// Onclick handler for next button
function nextButton() {
    if (rounds_played === NUMBER_OF_ROUNDS) {
        displayFinalResults()
    }
    else {
        playARound()
    }
}


// initialize the game
function initialize() {
    rounds_played = 0
    correct_rounds = 0
    current_dog_pair = null
    var bones = document.querySelectorAll('#round span')
    Array.prototype.forEach.call( bones, function( node ) {
        node.parentNode.removeChild( node );
    });
    document.body.className = 'choose_mode'
}


initialize()
