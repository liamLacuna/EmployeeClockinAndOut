/********* DOM util method start *********/
function getUserName() {
    return document.getElementById("username").value;
}

function getPassword() {
    return document.getElementById("password").value;
}

function setErrorMessage(msg) {
    document.getElementById("error-msg").innerHTML = msg;
}

const ERROR_ID_OR_PASS = "There is an error in the username or password.";
const ERROR_EMPTY_ID = "Username should not be empty.";
const ERROR_EMPTY_PASS = "Password should not be empty.";

/********* DOM util method end *********/

/********* fetch wrapper start *********/
function doPost(url = '', data = {}, okCallback, failCallback) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => fetchHandler(res, okCallback, failCallback));
}

function doGet(url = '', okCallback, failCallback) {
    fetch(url).then(res => {
        if (res.ok) {
            res.json().then(data => {
                okCallback && okCallback(data);
            })
        } else {
            console.log('Error: ', res.status);
            failCallback && failCallback(res);
        }
    });
}

function fetchHandler(res, okCallback, failCallback) {
    if (res.ok) {
        res.json().then(data => {
            okCallback && okCallback(data);
        });
    } else {
        console.log('Error: ', res.status);
        failCallback && failCallback(res);
    }
}

function validateInput() {
    var username = getUserName();
    var password = getPassword();
    if (!username) {
        setErrorMessage(ERROR_EMPTY_ID);
        return false;
    }
    if (!password) {
        setErrorMessage(ERROR_EMPTY_PASS);
        return false;
    }
    return true;
}

function clockHeloper(type) {
    if (!validateInput())
        return;
    var username = getUserName();
    var password = getPassword();
    var apClockTime = apBaseTime + (new Date().getTime() - localBaseTime);
    var successUrl = type === 1 ? 'clock-in.html' : 'clock-out.html';
    doPost("/api/clock/", {
        username: username,
        password: password,
        type: type,
        clockTime: apClockTime
    }, function (data) {
        console.log(data);
        if (data == "0") { // failed
            setErrorMessage(ERROR_ID_OR_PASS);
        } else { // success
            location.href = successUrl + '?ts=' + apClockTime;
        }
    }, function () {
        setErrorMessage(ERROR_ID_OR_PASS);
    });
}

function clockIn() {
    clockHeloper(1);
}

function clockOut() {
    clockHeloper(2);
}

/********* fetch wrapper end *********/
var apBaseTime = 0;
var localBaseTime = 0;

function loadAPTime() {
    doGet("/api/clock/", function (data) { // success
        localBaseTime = new Date().getTime();
        apBaseTime = parseInt(data);
    }, function () { // fail
        localBaseTime = new Date().getTime();
        apBaseTime = new Date().getTime();
    });
}

function getTimeString(time) {
    var wrapZero = (e) => e < 10 ? "0" + e : e;
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var date = time.getDate();
    var hour = time.getHours();
    var min = time.getMinutes();
    var sec = time.getSeconds();
    return year + "-" + wrapZero(month) + "-" + wrapZero(date) + " "
    + wrapZero(hour) + ":" + wrapZero(min) + ":" + wrapZero(sec);
}

$(document).ready(function () {
    if ($(".login-div").length > 0) { // index page
        $('.login-clock-in-button').click(clockIn);
        $('.login-clock-out-button').click(clockOut);

        $("input").focus(function () {
            $(this).parents(".input-wrapper").addClass("focused");
        });

        $("label").click(function () {
            $(this).parents(".input-wrapper").find("input").focus();
        });

        $("input").blur(function () {
            var inputValue = $(this).val();
            if (inputValue == "") {
                $(this).parents(".input-wrapper").removeClass("focused");
            }
        });

        loadAPTime();
        clockTime.innerHTML = getTimeString(new Date());
        setInterval(function() {
            clockTime.innerHTML = getTimeString(new Date());
        }, 1000);
    } else { // show clock in/out result
        var params = Object.fromEntries(new URLSearchParams(location.search));
        var time;
        if (params.ts) {
            time = new Date(parseInt(params.ts));
        } else {
            time = new Date();
        }

        clockResult.innerHTML = getTimeString(time);
    }
});
