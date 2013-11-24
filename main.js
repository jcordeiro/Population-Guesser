var country_data, left_country, right_country, random_right, random_left;
var disabled_events = false, game_started = false, score = 0, num_of_guesses = 0;

// Country object
function Country(name, population, isoCode) {
	this.name = name;
	this.population = population;
	this.isoCode = isoCode;
}

$(document).ready(function() {
	
	$('#score').hide();

	getXMLCountryData();
	
	$('#start-button').on('click', startGame);
	
	// Listen for keyboard input
	// The user can start the game by pressing the enter key
	$(document).on('keydown', function( event ) {
		if (game_started === false) {
			if (event.which === 13 ) { // enter key
				$('#start-button').trigger('click');
			}	
		}
	});

});

// Perform an AJAX call and load the XML country data into country_data
function getXMLCountryData() {

	$.ajax({
		url: 'CountryData.xml',
		dataType: 'xml',
		success: function(data) {
			country_data = $(data).find('Records').find('Record');
		},
		error: function() {
			alert('There was an error retrieving the country data :( \n' +
						'Please refresh the page and try again');
		}
	});

}

// builds country objects containing the countries' data
function buildCountryObjects(country_data) {

	var length, country_name, country_population, country_code;

	// Calculate a random number to pull random countries
	length = country_data.length - 1;
	random_left = Math.round(Math.random() * length);
	random_right = Math.round(Math.random() * length);

	// Ensure that the 2 random numbers are unique
	if (random_right === random_left) {
		while(random_right === random_left) {
			random_right = Math.round(Math.random() * length);
		}
	}
	
	var random_row_left = $(country_data[random_left]).find('Row');
	var random_row_right = $(country_data[random_right]).find('Row');
	
	country_name = random_row_left.attr('C');
	country_code = random_row_left.attr('D').toLowerCase();
	country_population = parseInt(random_row_left.attr('E'), 10);
	left_country = new Country(country_name, country_population, country_code);

	country_name = random_row_right.attr('C');
	country_code = random_row_right.attr('D').toLowerCase();
	country_population = parseInt(random_row_right.attr('E'), 10);
	right_country = new Country(country_name, country_population, country_code);

}

// Reads the data from 2 country objects and loads them into the page
function loadCountriesIntoPage(left_country, right_country) {

	// Fade out old countries and fade in 2 new ones
	// We don't fully fade out to 0 opacity because the elements
	// cannot have a 'display: none' in order for us to measure
	// the width, and ensure that country name fits in the div
	$('#content').fadeOut('200', function() {

		$('#left-country').find('.flag').addClass('country-choice');
		$('#right-country').find('.flag').addClass('country-choice');
		$('#left-country').find('.country-name').html(left_country.name);
		$('#right-country').find('.country-name').html(right_country.name);
		$('#left-country').find('.flag').attr('src', '/img/flags/' + left_country.isoCode + '.png');
		$('#right-country').find('.flag').attr('src', '/img/flags/' + right_country.isoCode + '.png');
		$('#left-country').find('.flag').attr('alt', 'flag of ' + left_country.name);
		$('#right-country').find('.flag').attr('alt', 'flag of ' + right_country.name);
		$('#left-country').find('.population-number').html(' ?');
		$('#right-country').find('.population-number').html(' ?');
		$('#left-country').find('.flag').removeClass('shadow');
		$('#right-country').find('.flag').removeClass('shadow');
		$('#left-country').find('.country-population').removeClass('correct wrong');
		$('#right-country').find('.country-population').removeClass('correct wrong');

		// Fade elements back in
		$('#content').fadeIn();

	});
}

// format result nicely with commas 
// (http://stackoverflow.com/questions/14075014/jquery-function-to-to-format-number-with-commas-and-decimal)
function numberWithCommas(num) {
  var parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

// Checks whether or not the country the user picked is the correct answer
function evaluateGuess(el) {

	// disable click events
	disabled_events = true;

	var country_picked, country_not_picked;

	if (el.id === 'left-country') {
		country_picked = left_country;
		country_not_picked = right_country;
	}
	else {
		country_picked = right_country;
		country_not_picked = left_country;
	}

	// If the user has picked the correct answer
	if (country_picked.population > country_not_picked.population) {
		$(el).find('.country-population').addClass('correct');
		updateScore(++score);
	}
	else { // user has select the wrong answer
		$(el).find('.country-population').addClass('wrong');
		updateScore(score);
	}

	$('#left-country').find('.population-number').html(numberWithCommas(left_country.population) + ' people');
	$('#right-country').find('.population-number').html(numberWithCommas(right_country.population) + ' people');

	// Wait 3 seconds before starting the next round
	window.setTimeout(playGameRound, 2000);

}

// Play a round of the game
// builds the country objects and laods 2 new countries into the page
function playGameRound() {
	
	buildCountryObjects(country_data);
	loadCountriesIntoPage(left_country, right_country);

	// Re-enable click events
	disabled_events = false;
}

// Starts the country guessing game
function startGame() {
	
	game_started = true;
	
	$('#start-button').fadeOut( function() {			
		$('#score').fadeIn();
	});

	//Listen for click events on the country flags
	$('#left-country').on('click', handleClick);
	$('#right-country').on('click', handleClick);

	// Listen for keyboard input
	// The left and right arrows simulate clicking on the flags
	$(document).on("keydown", function( event ) {
		if (event.which === 37) { // left arrow
			$('#left-country').trigger('click');
		}
		else if (event.which === 39) { // right arrow
			$('#right-country').trigger('click');
		}
	});
	
	playGameRound();
}

// Update the score on the page
function updateScore(score) {
	num_of_guesses++;
	$('#score').html('Score: ' + score + ' / ' + num_of_guesses);
}

function handleClick() {

	// Check if events are disabled
	// This prevents the user from repeatedly spamming guesses
	// and limits them to one guess per round
	if(disabled_events) {
		return;
	}

		$(this).find('.flag').addClass('shadow');
		evaluateGuess(this);
}