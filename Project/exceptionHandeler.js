exports.ElementNotVisible =  function (error) {
    console.log("ElementNotVisible:-", error);
}

exports.NoSuchElement = function (error) {
    console.log("NoSuchElement:-", error.message, "----", error.name);
}

exports.InvalidSelector = function (error) {
    console.log("InvalidSelector:-", error);
}

exports.StaleElementReference = function (error) {
    console.log("StaleElementReference:-", error);
}