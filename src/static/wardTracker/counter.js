
// rangeCounter
// totalCounter
var animDelta = 100;
function updateCounter(val, counterID) {

    let container = document.getElementById(counterID);

    if (container.getAttribute("prevVal") == val) {
        return 0;
    } // Do nothing if the number did not change

    if (container.getAttribute("prevVal") == null) { // Container was just made
        container.setAttribute("prevVal", "")
    } // Do nothing if the number did not change

    let prevStateArr = Array.from(String(container.getAttribute("prevVal"))) // Store previous state
    let stateArr = Array.from(String(val)); // Split number into an array

    container.setAttribute("prevVal", val); // Store new previous value
    container.classList.add("flex", "hstack"); // setup hstack

    var runningTime = animDelta
    function scheduleItem(cb) {
        setTimeout(() => {
            cb()
        }, runningTime);
        runningTime += animDelta
    }
    function numID(index) { return "num-" + counterID + "-" + index }

    let diff = stateArr.length - prevStateArr.length // Calc difference in array lengths
    // console.log(`DIFF: ${diff}`)

    if (diff > 0) { // Need to add elements

        for (let i = 0; i < prevStateArr.length; i++) { // Update old chars
            scheduleItem(() => {
                let numberID = numID(i);
                updateNumber(stateArr[i], numberID)
            })
        }

        // Loop Through String left to right, starting at the new point 
        for (let i = stateArr.length - diff; i < stateArr.length; i++) {
            scheduleItem(() => {
                let numberID = numID(i);
                createNumber(stateArr[i], numberID, container.id);
            })
        }
    }

    if (diff < 0) { // Need to remove elements
        // Loop through elements right to left
        for (let i = prevStateArr.length - 1; i > stateArr.length - 1; i--) {
            scheduleItem(() => {
                let numberID = numID(i);
                removeNumber(numberID, container.id)
            })
        }

    }

    if (diff == 0 || diff < 0) {
        for (let i = stateArr.length - 1; i >= 0; i--) {
            scheduleItem(() => {
                let numberID = numID(i);
                updateNumber(stateArr[i], numberID)
            })
        }
    }

    return runningTime;
}

function createNumber(startVal, numberID, containerID, insertLeft) {
    let container = document.getElementById(containerID);
    let num = document.createElement("h1");
    num.innerText = startVal;
    num.id = numberID;
    num.style.width = "0px";
    num.setAttribute("prevVal", startVal);

    if (insertLeft) {
        container.insertBefore(num, container.firstChild); // Inserts element to the front 
    } else {
        container.appendChild(num) // Insert child on the end
    }

    // fade in animation
    num.classList.add("fade-in", "numeric-text");

    setTimeout(() => {
        num.classList.add("fade-default");
        num.style.width = "1rem";
    }, 250);

    setTimeout(() => {
        num.classList.remove("fade-in", "fade-out", "fade-default");
    }, 300);
}
function updateNumber(newValue, textID) {
    let text = document.getElementById(textID);

    if (text.getAttribute("prevVal") == newValue) { return; }
    text.setAttribute("prevVal", newValue);

    text.classList.add("fade-out");
    setTimeout(() => {
        text.textContent = newValue;
        text.classList.remove("fade-out");
        text.classList.add("fade-in");
    }, 150);

    setTimeout(() => {
        text.classList.add("fade-default");
    }, 250);

    setTimeout(() => {
        text.classList.remove("fade-in", "fade-out", "fade-default");
    }, 300);
}
function removeNumber(numberID, containerID) {
    let container = document.getElementById(containerID);
    let num = document.getElementById(numberID);

    // fade in animation
    num.classList.add("fade-out", "numeric-text");
    num.style.width = "0";

    setTimeout(() => {

        container.removeChild(num)
        
    }, 250);
}






let endDate = new Date("Jan 31 2025")
setTimeout(() => {
    counter()
}, 2500);

function counter() {
    let interval = setInterval(() => {

        let now = new Date()

        if (now > endDate && cachedData.amt >= cachedData.max) {
            updateCounter("Goal Reached!", "countDownTimer")
            clearInterval(interval)
            return
        }
        if (now > endDate && cachedData.amt < cachedData.max) {
            updateCounter("Times Up...", "countDownTimer")
            clearInterval(interval)
            return
        }
        if (cachedData.amt >= cachedData.max) {
            updateCounter("Goal Reached!", "countDownTimer")
            clearInterval(interval)
            return
        }

        const diff = endDate.getTime() - now.getTime();

        // Convert to days, hours, minutes, and seconds
        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (seconds < 10) { seconds = `0${seconds}`}
        if (minutes < 10) { minutes = `0${minutes}`}
        if (hours < 10) { hours = `0${hours}`}
        if (days < 10) { days = `0${days}`}

        let str = `${days}:${hours}:${minutes}:${seconds}`

        updateCounter(str, "countDownTimer", true)
    }, 1000);
}