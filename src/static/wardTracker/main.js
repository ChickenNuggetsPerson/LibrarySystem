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
        // rangeCounter
        // totalCounter

        // check for defaults
        if (cachedData.amt == 0 && cachedData.max == 1) {

            // First time
            setTimeout(() => {
                createNumber("/", "slash", "middleCounter")
            }, 800);

            throw new Error("Skipping defaults")
        }
        
        let time = updateCounter(cachedData.amt, "rangeCounter") + animDelta
        
        setTimeout(() => {
            updateCounter(cachedData.max, "totalCounter")
        }, time);

    } catch(err) {}

    try {
        let prog = getRelativeProgress( cachedData.amt / cachedData.max )
        let img = document.getElementById("progressImg")

        let pixels = 100 * prog

        img.style.clipPath = `inset(${100 - pixels}% 0 0 0)`;
    } catch(err) {}
}
function getRelativeProgress(val) {
    // val *= 2.99
    // val = Math.pow(Math.E, val) * 0.05
    // val -= 0.05
    // return val

    var newVal = 0
    newVal += lerp(val, 0,    0.4,  0, 0.17 ) // 17
    newVal += lerp(val, 0.4,  0.7,  0, 0.19  ) // 36
    newVal += lerp(val, 0.7,  0.93, 0, 0.23 ) // 60
    newVal += lerp(val, 0.93, 1,    0, 0.4 ) // 100


    return newVal
}

function lerp(x, inMin, inMax, outMin, outMax) {
    if (x < inMin) { return outMin } 
    if (x > inMax) { return outMax } 

    let inRange = inMax - inMin
    let outRange = outMax - outMin

    return outMin + ((x - inMin) / inRange) * outRange
}





async function submitForm(type, amt, member) {
    console.log("Submitting Entry")

    let data = {
        actionType: type,
        actionAmt: amt,
        memberType: member
    }
    console.log(data)

    let response = await postData("/wardTracker/entries/submit", data)
    console.log(response)

    if (response.error) {
        bootbox.alert({
            size: 'small',
            title: 'Error!',
            message: 'There was an error submitting the entry.',
            centerVertical: true
        });
    } else {
        setTimeout(() => {
            fetchData()
        }, 1000);
    }
}


function test() {
    cachedData.max = 100
    cachedData.amt = 0

    document.getElementById("rangeCounter").innerHTML = ""

    setInterval(() => {
        cachedData.amt ++
        setProgress()

        if (cachedData.amt == 101) {
            cachedData.amt = -2
        }
    }, 700);
}

async function fetchData() {
    // return
    console.log("Fetching Data")
    cachedData = await getData("/wardTracker/progress")
    setProgress()
    updateEntries()
}
async function onLoad() {

    if (!isAdmin) {
        $('.admin').remove();
    }

    setProgress()

    setTimeout(() => {
        fetchData()
    }, 500);

    setTimeout(() => {
        chatFetchData()
    }, 1000);

    setInterval(() => {
        fetchData()
        chatFetchData()
    }, (25 * 1000) + Math.random() * 5000);
}
onLoad()






function displaySubmitForm() {
    bootbox.dialog({
        title: "Create Entry",
        message: `
            <form id="customForm">
                <div class="form-group">
                    <label for="actionInput">Action Done:</label>
                    <input type="text" class="form-control" id="actionInput" placeholder="" required>
                </div>

                <div style="height:10px"></div>
                
                <div class="form-group">
                    <label for="actionAmt"># of Actions Done: ( 10 Max )</label>
                    <input type="number" class="form-control" id="actionAmt" min="0" max="10" required>
                </div>

                <div style="height:10px"></div>

                <div class="form-group">
                    <label for="group">What group are you from?</label>
                    <select type="number" class="form-control" id="group" required>
                        <option value="empty"> Choose One </option>
                        <option disabled> ────────── </option>

                        <option value="Adult"> Adult </option>
                        <option value="Youth"> Youth </option>
                        <option value="Primary"> Primary </option>
                    </select>
                </div>
            </form>

        `,
        buttons: {
            cancel: {
                label: "Cancel",
                className: "btn-danger"
            },
            submit: {
                label: "Submit",
                className: "btn-success",
                callback: function() {
                    var action = $('#actionInput').val();
                    var amt = $('#actionAmt').val();
                    var group = $('#group').val();

                    submitForm(action, amt, group)
                }
            }
        }
    });
}



var storedEntries = []
async function updateEntries() {
    if (isAdmin) {
        storedEntries = await getData("/wardTracker/admin/entries/list")
    } else {
        storedEntries = await getData("/wardTracker/entries/list")
    }
}

function buildRecents() {
    console.log("Building List")
    
    let container = document.createElement('div')
    container.innerHTML = ""

    let header = createItem({
        actionType: "Action:",
        actionAmt: "#",
        memberType: "Group"
    })
    container.appendChild(header)

    let padding = document.createElement("div")
    padding.style.padding = "10px"
    container.append(padding)

    storedEntries.forEach(e => {
        container.appendChild( createItem(e) )
    });
    
    return container
}

function createItem(entry) {
    let mainDiv = document.createElement('div')
    mainDiv.classList.add("card")
    mainDiv.style.backgroundColor = "#1f1f1f"

    let body = document.createElement("div")
    body.classList.add("card-body")


    let rowContainer = document.createElement("div")
    rowContainer.classList.add("container", "text-center")


    let row = document.createElement("div")
    row.classList.add("row", "align-items-start")


    let action = document.createElement("div")
    action.classList.add("col")
    action.innerText = entry.actionType
    // action.style.whiteSpace = "nowrap"

    let amt = document.createElement("div")
    amt.classList.add("col")
    amt.innerText = entry.actionAmt
    // amt.style.whiteSpace = "nowrap"

    let member = document.createElement("div")
    member.classList.add("col")
    member.innerText = entry.memberType


    row.appendChild(action)
    row.appendChild(amt)
    row.appendChild(member)

    if (isAdmin) {
        if (entry.entryID) {
            let delBTN = document.createElement("button")
            delBTN.innerText = "X"
            delBTN.classList.add("col", "btn", "btn-danger")
            delBTN.style.padding = "5px"
            delBTN.style.width = "2rem"
            delBTN.style.maxWidth = "2rem"
            delBTN.style.borderRadius = "5px"
            delBTN.onclick = async () => {

                console.log("Delete: ", entry.entryID)
                await postData("/wardTracker/admin/entries/delete", {
                    uuid: entry.entryID
                })

                setTimeout(() => {
                    fetchData()
                }, 500);
            }

            row.appendChild(delBTN)
        } else {
            let delTXT = document.createElement("div")
            delTXT.classList.add("col")
            delTXT.style.maxWidth = "6rem"
            delTXT.innerText = "Delete"
            row.appendChild(delTXT)
        }
    }

    rowContainer.appendChild(row)
    body.appendChild(rowContainer)
    mainDiv.appendChild(body)

    return mainDiv
}

function displayRecents() {
    bootbox.dialog({
        title: "5 Recent Entries:",
        message: `
            ${buildRecents().innerHTML}
        `,
        buttons: {
            submit: {
                label: "Close",
                className: "btn-primary",
                callback: function() {
                    
                }
            }
        }
    });
}




// rangeCounter
// totalCounter
var animDelta = 50
function updateCounter(val, counterID) {
    let container = document.getElementById(counterID)
    
    if (Number(container.getAttribute("prevVal")) == val) { return 0 } // Do nothing if the number did not change
    
    container.setAttribute("prevVal", val) // Store new numver
    container.classList.add("flex", "hstack") // setup hstack


    let numArray = Array.from(String(val), Number) // Split number into array
    
    for (let i = 0; i < numArray.length; i++) {
        setTimeout(() => {
            
            let numberID = "num-" + counterID + "-" + i
            let number = document.getElementById(numberID)

            if (!number) { // Create number if it does not exist
                createNumber(numArray[i], numberID, container.id)
                return
            }

            // Don't update number if it stays the same
            if (number.getAttribute("prevVal") == String(numArray[i])) {
                return
            }


            updateNumber(numArray[i], numberID)

        }, i * animDelta);
    }

    return (numArray.length) * animDelta
}


function createNumber(startVal, numberID, containerID) {
    let container = document.getElementById(containerID)
    let num = document.createElement('h1')
    num.innerText = startVal
    num.id = numberID
    num.style.width = "0px"
    num.setAttribute("prevVal", startVal)

    container.appendChild(num)

    // fade in animation
    num.classList.add('fade-in', 'numeric-text');

    setTimeout(() => {
        num.classList.add('fade-default');
        num.style.width = "1rem"
    }, 250); 

    setTimeout(() => {
        num.classList.remove('fade-in', 'fade-out', 'fade-default')
    }, 300);
}

function updateNumber(newValue, textID) {
    let text = document.getElementById(textID)

    text.setAttribute("prevVal", newValue)

    text.classList.add('fade-out');
    setTimeout(() => {
        text.textContent = newValue;
        text.classList.remove('fade-out');
        text.classList.add('fade-in');
    }, 150);

    setTimeout(() => {
        text.classList.add('fade-default');
    }, 250); 

    setTimeout(() => {
        text.classList.remove('fade-in', 'fade-out', 'fade-default')
    }, 300);
}