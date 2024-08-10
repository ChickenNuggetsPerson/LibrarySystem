let cachedData = {
    amt: 1,
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
        let prog = getRelativeProgress( cachedData.amt / cachedData.max )
        let img = document.getElementById("progressImg")
        img.style.clipPath = `inset(${100 - (prog * 100)}% 0 0 0)`;
    } catch(err) {}
}
function getRelativeProgress(val) {
    // return Math.pow(val, 0.55693)
    return val
}




function fetchProgress() {
    console.log("Fetching Data")

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const apiUrl = `${baseUrl}/wardTracker/progress`;

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            // Add any custom headers if necessary
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json()
    })
    .then(data => {
        cachedData = data
        setProgress()

    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}




async function onLoad() {
    setProgress()

    setInterval(() => {
        fetchProgress()
    }, 10000);

    setTimeout(() => {
        fetchProgress()
    }, 500);
}
onLoad()