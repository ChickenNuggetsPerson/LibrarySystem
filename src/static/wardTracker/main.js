let cachedData = {
    amt: 0,
    max: 1,
};

// Sets the display progress to the set amount
// Takes in a range of 0 - 1
function setProgress() {
    try {
        let text = document.getElementById("percentText");
        text.innerText = `${Math.floor((cachedData.amt / cachedData.max) * 1000) / 10
            } %`;
    } catch (err) { }

    try {

        // // check for defaults
        if (cachedData.amt == 0 && cachedData.max == 1) {
            // First Time
            throw new Error("Skipping defaults");
        }

        updateCounter(`${cachedData.amt} / ${cachedData.max}`, "dataCounter")

    } catch (err) { }

    try {
        let prog = getRelativeProgress(cachedData.amt / cachedData.max);
        let img = document.getElementById("progressImg");

        let pixels = 100 * prog;

        img.style.clipPath = `inset(${100 - pixels}% 0 0 0)`;
    } catch (err) { }
}
function getRelativeProgress(val) {
    // val *= 2.99
    // val = Math.pow(Math.E, val) * 0.05
    // val -= 0.05
    // return val

    var newVal = 0;
    newVal += lerp(val, 0, 0.4, 0, 0.17); // 17
    newVal += lerp(val, 0.4, 0.7, 0, 0.19); // 36
    newVal += lerp(val, 0.7, 0.93, 0, 0.23); // 60
    newVal += lerp(val, 0.93, 1, 0, 0.4); // 100

    return newVal;
}

function lerp(x, inMin, inMax, outMin, outMax) {
    if (x < inMin) {
        return outMin;
    }
    if (x > inMax) {
        return outMax;
    }

    let inRange = inMax - inMin;
    let outRange = outMax - outMin;

    return outMin + ((x - inMin) / inRange) * outRange;
}

async function submitForm(type, amt, member) {
    console.log("Submitting Entry");

    let data = {
        actionType: type,
        actionAmt: amt,
        memberType: member,
    };
    console.log(data);

    let response = await postData("/wardTracker/entries/submit", data);
    console.log(response);

    if (response.error) {
        bootbox.alert({
            size: "small",
            title: "Sorry...",
            message: "We are no longer accepting entries",
            centerVertical: true,
        });
    } else {
        setTimeout(() => {
            fetchData();
        }, 1000);
    }
}

function test() {
    cachedData.max = 100;
    cachedData.amt = 0;

    document.getElementById("rangeCounter").innerHTML = "";

    setInterval(() => {
        cachedData.amt++;
        setProgress();

        if (cachedData.amt == 101) {
            cachedData.amt = -2;
        }
    }, 700);
}

async function fetchData() {
    // return
    console.log("Fetching Data");
    cachedData = await getData("/wardTracker/progress");
    setProgress();
    updateEntries();

    setTimeout(() => {
        checkConfetti();
    }, 1000);
}
async function onLoad() {
    if (!isAdmin) {
        $(".admin").remove();
    }

    setProgress();

    setTimeout(() => {
        fetchData();
    }, 500);

    setTimeout(() => {
        chatFetchData();
    }, 1000);

    setInterval(() => {
        fetchData();
        chatFetchData();
    }, 25 * 1000 + Math.random() * 5000);
}
onLoad();

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
                className: "btn-danger",
            },
            submit: {
                label: "Submit",
                className: "btn-success",
                callback: function () {
                    var action = $("#actionInput").val();
                    var amt = $("#actionAmt").val();
                    var group = $("#group").val();

                    submitForm(action, amt, group);
                },
            },
        },
    });
}

var storedEntries = [];
async function updateEntries() {
    if (isAdmin) {
        storedEntries = await getData("/wardTracker/admin/entries/list");
    } else {
        storedEntries = await getData("/wardTracker/entries/list");
    }
}

function buildRecents() {
    console.log("Building List");

    let container = document.createElement("div");
    container.innerHTML = "";

    let header = createItem({
        actionType: "Action:",
        actionAmt: "#",
        memberType: "Group",
    });
    container.appendChild(header);

    let padding = document.createElement("div");
    padding.style.padding = "10px";
    container.append(padding);

    storedEntries.forEach((e) => {
        container.appendChild(createItem(e));
    });

    return container;
}

function createItem(entry) {
    let mainDiv = document.createElement("div");
    mainDiv.classList.add("card");
    mainDiv.style.backgroundColor = "#1f1f1f";

    let body = document.createElement("div");
    body.classList.add("card-body");

    let rowContainer = document.createElement("div");
    rowContainer.classList.add("container", "text-center");

    let row = document.createElement("div");
    row.classList.add("row", "align-items-start");

    let action = document.createElement("div");
    action.classList.add("col");
    action.innerText = entry.actionType;
    // action.style.whiteSpace = "nowrap"

    let amt = document.createElement("div");
    amt.classList.add("col");
    amt.innerText = entry.actionAmt;
    // amt.style.whiteSpace = "nowrap"

    let member = document.createElement("div");
    member.classList.add("col");
    member.innerText = entry.memberType;

    row.appendChild(action);
    row.appendChild(amt);
    row.appendChild(member);

    if (isAdmin) {
        if (entry.entryID) {
            let delBTN = document.createElement("button");
            delBTN.innerText = "X";
            delBTN.classList.add("col", "btn", "btn-danger");
            delBTN.style.padding = "5px";
            delBTN.style.width = "2rem";
            delBTN.style.maxWidth = "2rem";
            delBTN.style.borderRadius = "5px";
            delBTN.onclick = async () => {
                console.log("Delete: ", entry.entryID);
                await postData("/wardTracker/admin/entries/delete", {
                    uuid: entry.entryID,
                });

                setTimeout(() => {
                    fetchData();
                }, 500);
            };

            row.appendChild(delBTN);
        } else {
            let delTXT = document.createElement("div");
            delTXT.classList.add("col");
            delTXT.style.maxWidth = "6rem";
            delTXT.innerText = "Delete";
            row.appendChild(delTXT);
        }
    }

    rowContainer.appendChild(row);
    body.appendChild(rowContainer);
    mainDiv.appendChild(body);

    return mainDiv;
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
                callback: function () { },
            },
        },
    });
}



function checkConfetti() {

    if (cachedData.amt < cachedData.max) { return; }

    var count = 200;
    var defaults = {
        origin: { y: -0.2 },
    };

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
            angle: -90
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}