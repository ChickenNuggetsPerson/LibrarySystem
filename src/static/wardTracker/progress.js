let cachedData = {
    amt: 0,
    max: 1
}


// Sets the display progress to the set amount
// Takes in a range of 0 - 1
function setProgress() {

    try {
        let text = document.getElementById("percentText")
        text.innerText = `${ Math.floor((cachedData.amt / cachedData.max)*1000) / 10 } %`
    } catch(err) {}

    try {
        let text = document.getElementById("rangeText")
        text.innerText = `${cachedData.amt} / ${cachedData.max}`
    } catch(err) {}

    try {
        let prog = getRelativeProgress( cachedData.amt / cachedData.max )
        let img = document.getElementById("progressImg")
        img.style.clipPath = `inset(${100 - (prog * 100)}% 0 0 0)`;
    } catch(err) {}
}
function getRelativeProgress(val) {
    // return Math.pow(val, 0.55693)
    return val
}




async function fetchProgress() {
    console.log("Fetching Data")

    cachedData = await getData("/wardTracker/progress")
    setProgress()
}




async function onLoad() {
    setProgress()

    setTimeout(() => {
        fetchProgress()
    }, 500);

    setInterval(() => {
        fetchProgress()
    }, (25 * 1000) + Math.random() * 5000);
}
onLoad()