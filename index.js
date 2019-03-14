#!/usr/bin/env node

var fs = require('fs');
var inquirer = require('inquirer');
var util = require('util');
var ProgressBar = require('progress');
var player = require('play-sound')(opts = {});
var path = require('path');

var appDir = path.dirname(require.main.filename);
// Constants
var ASSETS_DIRECTORY = `${appDir}/assets`;
var COFFEE_ART_FILE = 'coffee.txt'
var RING_SOUND_FILE = 'telephone-ring.mp3';
var PROGRESS_BAR_TICKS = 30;
var DEFAULT_BREW_MINUTES = '3';
var BREW_TIME_QUESTION_PROMPT = 'How many minutes would you like to brew for?';
var COFFEE_TOO_WEAK_MESSAGE = 'Your coffee will be weak! 3-5 minutes is recommended.';
var COFFEE_TOO_BITTER_MESSAGE = 'Your coffee will be bitter! 3-5 minutes is recommended.';
var COFFEE_IS_DONE_MESSAGE = 'Your coffee is done!';

// Promisify the fs readfile method
var readFile = util.promisify(fs.readFile);

async function printCoffeeArt() {
    const filecontents = await readFile(
        `${ASSETS_DIRECTORY}/${COFFEE_ART_FILE}`,
        {encoding: 'utf-8'}
    );

    console.log();
    console.log(filecontents);
    console.log();
}

async function promptForBrewTime() {
    const answers = await inquirer.prompt([{
        type: 'input',
        name: 'brewTime',
        default: DEFAULT_BREW_MINUTES,
        message: BREW_TIME_QUESTION_PROMPT,
        validate: function(value) {
            if ( parseInt(value) < 3 ) {
                return COFFEE_TOO_WEAK_MESSAGE;
            }else if ( parseInt(value) > 5 ){
                return COFFEE_TOO_BITTER_MESSAGE;
            }else{
                return true
            }
        }
    }]);

    return parseFloat(answers.brewTime);
}

async function startBrewTimer(brewTime){
    var brewInterval = (brewTime * 60000)/PROGRESS_BAR_TICKS;
    var bar = new ProgressBar(':bar', {total: PROGRESS_BAR_TICKS})
    var timer = setInterval(function () {
        bar.tick();
        if (bar.complete) {
            player.play(`${ASSETS_DIRECTORY}/${RING_SOUND_FILE}`, (err) => {
                if (err) throw err;
                console.log(COFFEE_IS_DONE_MESSAGE);
            }); 
            clearInterval(timer);
        }
    }, brewInterval);
}

async function brew(){
    await printCoffeeArt();
    var brewTime = await promptForBrewTime();
    startBrewTimer(brewTime);
}


brew();
