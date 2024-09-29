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



async function fetchData() {
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

    setInterval(() => {
        fetchData()
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
                    <input type="number" class="form-control" id="actionAmt" value="0" min="0" max="10" required>
                </div>

                <div style="height:10px"></div>

                <div class="form-group">
                    <label for="group">What group are you from?</label>
                    <select type="number" class="form-control" id="group" required>
                        <option value="empty"> Choose One </option>
                        <option disabled> ────────── </option>

                        <option value="Adult"> Adult </option>
                        <option value="Youth"> Youth </option>
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
        title: "Recent Entries: ( 5 Max )",
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