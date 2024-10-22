
let container = document.getElementById("listContainer")



var data = []





async function fetchData() {
    console.log("Fetching Data")

    var newData = [] 
    if (isAdmin) {
        newData = await getData("/wardTracker/admin/entries/list")
    } else {
        newData = await getData("/wardTracker/entries/list")
    }

    if (arraysEqual(newData, data)) { 
        return 
    }

    data = newData
    console.log(data)
    buildList()
}

function buildList() {
    console.log("Building List")
    container.innerHTML = ""

    let header = createItem({
        actionType: "Action Done",
        actionAmt: "# Performed",
        memberType: "Age"
    })
    container.appendChild(header)

    let padding = document.createElement("div")
    padding.style.padding = "10px"
    container.append(padding)

    data.forEach(e => {
        container.appendChild( createItem(e) )
    });
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

            let editBTN = document.createElement("button")
            editBTN.innerText = "..."
            editBTN.classList.add("col", "btn", "btn-warning")
            editBTN.style.padding = "5px"
            editBTN.style.width = "2rem"
            editBTN.style.maxWidth = "2rem"
            editBTN.style.borderRadius = "5px"
            editBTN.onclick = async () => {

                displayEditForm(entry)
            }

            row.appendChild(editBTN)


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




function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (!objectsEqual(arr1[i], arr2[i])) {
            return false;
        }
    }
    return true;
}

function objectsEqual(obj1, obj2) {
    for (let key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }
    }
    return true;
}





function displayEditForm(entry) {
    console.log(entry)

    function isSelected(input) {
        if (input == entry.memberType) {
            return "selected"
        } else {
            return ""
        }
    }

    bootbox.dialog({
        title: "Create Entry",
        message: `
            <form id="customForm">
                <div class="form-group">
                    <label for="actionInput">Action Done:</label>
                    <input type="text" class="form-control" id="actionInput" placeholder="" value="${entry.actionType}" required>
                </div>

                <div style="height:10px"></div>
                
                <div class="form-group">
                    <label for="actionAmt"># of Actions Done: ( 10 Max )</label>
                    <input type="number" class="form-control" id="actionAmt" min="0" max="10" value="${entry.actionAmt}" required>
                </div>

                <div style="height:10px"></div>

                <div class="form-group">
                    <label for="group">What group are you from?</label>
                    <select type="number" class="form-control" id="group" required>
                        <option value="Adult" ${isSelected("Adult")} > Adult </option>
                        <option value="Youth" ${isSelected("Youth")} > Youth </option>
                        <option value="Primary" ${isSelected("Primary")} > Primary </option>
                    </select>
                </div>
            </form>

        `,
        buttons: {
            cancel: {
                label: "Cancel",
                className: "btn-primary"
            },
            delete: {
                label: "Delete",
                className: "btn-danger",
                callback: async function() {
                    await postData("/wardTracker/admin/entries/delete", {
                        uuid: entry.entryID
                    })
    
                    setTimeout(() => {
                        fetchData()
                    }, 500);
                }
            },
            submit: {
                label: "Submit",
                className: "btn-success",
                callback: async function() {
                    var action = $('#actionInput').val();
                    var amt = $('#actionAmt').val();
                    var group = $('#group').val();

                    await postData("/wardTracker/admin/messages/edit", {
                        uuid: entry.entryID, 
                        actionType: action, 
                        actionAmt: amt, 
                        memberType: group
                    })
    
                    setTimeout(() => {
                        fetchData()
                    }, 500);
                }
            }
        }
    });
}







async function onLoad() {
    buildList()

    setTimeout(() => {
        fetchData()
    }, 750);

    setInterval(() => {
        fetchData()
    }, (27 * 1000) + Math.random() * 5000);
}
onLoad()