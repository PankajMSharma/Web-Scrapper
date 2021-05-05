var webdriver = require('selenium-webdriver');
var NoSuchElement = require('../../exceptionHandeler.js').NoSuchElement;

var By =  webdriver.By;
var tripTypes = {
    singleType: 2,
    annualTrip: 3,
    cruiseTrip: 4
};
var destinations = {
    singleType: {
        europe: 2,
        australia: 3,
        worldwideExclude: 4,
        worldwideInclude: 5,
        uk: 6
    },
    annualTrip: {
        europe: 2,
        worldwideInclude: 3
    },
    cruiseTrip: {
        europe: 2,
        australia: 3,
        worldwideExclude: 4,
        worldwideInclude: 5,
        uk: 6        
    }
};

exports.Run = function Run(tripType, location, groupType, tripDays, ages, delayFactor, driver, resultsCallBack) {
    var finalResults = {
        packageName: [],
        packagePrice: []
    }

    driver.get('http://www.circlecover.com');

    /**
     * adding selenium wait
     * Delay is seconds
     * @param int time
     * @param function func
     */ 
    function Pause(Time, FuncName) {
        setTimeout(FuncName, Time * 1000);
    }

    Pause(delayFactor * 2, SetCover);

    function SetCover() {
        var id = tripTypes[tripType];
        driver.findElement(By.xpath('// select [@id="ddPolicyType"]/option[' + id + ']')).click()
            .catch(NoSuchElement);
        Pause(delayFactor, SetDestination);
    }

    function SetDestination() {
        var id = destinations[tripType][location];
        driver.findElement(By.xpath('// select [@id="ddDestination"]/option[' + id + ']')).click()
            .catch(NoSuchElement);
        Pause(delayFactor, SetTripDuration);
    }

  /**
   * This method sets start and end date of a trip
   */
  function SetTripDuration(){

    console.log('setTripDuration()');
    var tmrw = new Date();

    tmrw.setDate(tmrw.getDate() + 1);
    var dateStr = ConvertDate(tmrw);
    driver.findElement(By.css('#txtCoverStartDate')).sendKeys(dateStr)
        .catch(NoSuchElement);

    Pause(delayFactor, function(){
        if(tripType !== 'annualtrip'){

            var endDate = new Date(tmrw);
            endDate.setDate(endDate.getDate() + tripDays);
            dateStr = ConvertDate(endDate);

            driver.findElement(By.css('#txtCoverEndDate')).click()
                .catch(NoSuchElement);

            driver.findElement(By.css('#txtCoverEndDate')).clear()
            .catch(NoSuchElement);

            Pause(delayFactor, function(){
                driver.findElement(By.css('#txtCoverEndDate')).sendKeys(dateStr)
                    .catch(NoSuchElement);
            });
        }

        Pause(delayFactor, SetAges);
    });
  }

    function SetAges() {
        driver.findElement(By.css('#ddlNoOfTravellers option:nth-child(' + ages.length + ')')).click()
        .catch(NoSuchElement);
        Pause(delayFactor, function() {
            for(var i=0; i < ages.length; i++) {
                driver.findElement(By.id('tb_travellerAge_' + (i+1))).sendKeys(ages[i].toString())
                .catch(NoSuchElement);
            }
            Pause(5, MoveToNextQuotePage);
        });
    }

    function MoveToNextQuotePage() {

        checkIfErrorMessageIsDisplayed

        driver.executeScript('document.getElementById("btnNext").click()') //used when selenium driver.findElemetnt doesn't work
            .catch(err => console.log('move to next quote not available-', err));

        Pause(5, GetPackageName);
    }

    function checkIfErrorMessageIsDisplayed() {
        var destinationErrorElem = driver.findElement(By.id('spandestination'))
            .catch(NoSuchElement);
        var dateErrorElem = driver.findElement(By.id('spanstartdate'))
            .catch(NoSuchElement);
        
        if (destinationErrorElem) {
            Pause(delayFactor, SetDestination);
        }
        if (dateErrorElem) {
            Pause(delayFactor, SetTripDuration);
        }
    }

    function GetPackageName() {
        driver.findElements(By.className('productheadings')).then(function(head) {

            for(var i=0; i<head.length; i++) {
                head[i].getText().then(function(headText) {
                    console.log(headText);
                    finalResults.packageName.push(headText);
                });
            }
        });
        Pause(delayFactor, GetPackagePrices);
    }

    function GetPackagePrices() {
        driver.findElements(By.xpath('//span [@class="comparePriceJustPrice"] /span')).then(function(body) {
            for(var i=0; i<body.length; i++) {
                body[i].getText().then(function(bodyText) {
                    console.log(bodyText);
                    finalResults.packagePrice.push(bodyText);
                });
            }
        });
        Pause(delayFactor, CompileResults);
    }

    function CompileResults() {
        var toReturn = [];
        console.log('Raw Results : ' + JSON.stringify(finalResults));

        for(var i=0; i<finalResults.packageName.length; i++) {
            toReturn.push({
                tripType: tripType,
                location: location,
                groupType: groupType,
                tripDays: tripDays,
                ages: ages,
                name: finalResults.packageName[i],
                price: finalResults.packagePrice[i]
            });
        }
        //return data
        resultsCallBack(toReturn);
    }

    function ConvertDate(inputFormat) {
        var d = new Date(inputFormat);
        
        function Padding(S) {
            return (S < 10) ? '0' + S : S;
        }

        return [Padding(d.getDate()), Padding(d.getMonth() + 1), d.getFullYear()].join('/');
    }
} //ends Run function