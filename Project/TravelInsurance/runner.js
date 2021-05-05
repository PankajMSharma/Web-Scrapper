var webdriver = require('selenium-webdriver');
var fs = require('fs');
var chrome = require('chromedriver');

var driver = null;
const delayFactor = 5;

const travelInsurance = 'CircleCover';

var site = require('./' + travelInsurance);
var params = require('./' + travelInsurance + '/data.js').data;
const filePath = travelInsurance + '.csv';
var currentParams = undefined;

console.log('running travel insurance website: ' + travelInsurance);

function LoopingParams() {
    console.log('Looping Params');
    if (params.length < 1) {
        console.log('No Test Cases Left in data.js | All params have been passed.');
        return;
    }

    currentParams = params.shift();
    console.log(currentParams);
    ExecuteTestCases();
}

function ExecuteTestCases() {
    driver = new webdriver.Builder()
                .forBrowser('chrome')
                .build();
    console.log('running : ' + JSON.stringify(currentParams));
    var _groupType = currentParams.ages.length === 1 ? 'individual'
                    : currentParams.ages.length === 2 ? 'couple'
                    : 'family';
    
    site.Run(
        currentParams.tripType,
        currentParams.location,
        _groupType,
        currentParams.tripDays,
        currentParams.ages,
        delayFactor,
        driver,
        function(results) { //callback func to save data in csv
            console.log('Results from Index file ' + JSON.stringify(results));
            for (var i=0; i<results.length; i++) {
                AppendResultsToCSV(results[i]);
            }

            driver.quit();

            //for next Test case
            LoopingParams();
        }
    );
}

function AppendResultsToCSV(result) {
    fs.appendFileSync(filePath, ''
    + result.tripType + ','
    + result.location + ','
    + result.groupType + ','
    + result.tripDays + ','
    + result.ages.join('&') + ','
    + result.name + ','
    + result.price + ','
    + '/n /r'
    );
}

//start of execution
LoopingParams();
