
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
            let delBTN = document.createElement("button")
            delBTN.innerText = "X"
            delBTN.classList.add("col", "btn", "btn-danger")
            delBTN.style.padding = "5px"
            delBTN.style.width = "2rem"
            delBTN.style.maxWidth = "2rem"
            delBTN.style.borderRadius = "5px"
            delBTN.onclick = async () => {
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