


// Code for the chat system

var cachedChatData = {
    messages: []
}


async function chatFetchData() {
    console.log("Chat Fetch")

    cachedChatData.messages = await getData("/wardTracker/messages/list")
    // console.log(cachedChatData.messages)

    buildMessageContainer()
}




function buildMessageContainer() {

    console.log("Building List")

    let mainContent = document.getElementById("mainContent")
    mainContent.style.height = "90vh"

    
    let container = document.getElementById("chatContainer")
    container.innerHTML = ""
    container.style.height = "100vh"
    container.style.padding = "20px"
    container.style.backgroundColor = "#1a1a1a"

    let header = document.createElement("div")
    
    let headerTXT = document.createElement("h1")
    headerTXT.innerText = "Message Board:"
    header.appendChild(headerTXT)

    let btnGroup = document.createElement("div")
    btnGroup.role = "group"
    btnGroup.classList.add("btn-group")

    btnGroup.appendChild( 
        createButton("About", "btn-primary", async () => {
            displayInfoMessage()
        }
    ))
    
    btnGroup.appendChild( 
        createButton("Post Message", "btn-success", async () => {
            displayCreateMessage()
        }
    ))
    
    header.appendChild(btnGroup)

    container.append(header)

    let padding = document.createElement("div")
    padding.style.padding = "10px"
    container.append(padding)

    cachedChatData.messages.forEach(e => {
        container.appendChild( 
            createMessage(e)
        )
    });
    
    return container
}



/*

Message

content: "This is cool!"
createdAt: "2024-10-14T17:38:56.516Z"
id: 1
messageID: "79bcb5b9-cb0f-4ddb-9ef0-e9fe14b3cb1a"
replies: "[{\"content\":\"This is a reply!\",\"replyID\":\"f2c75b8b-86e3-43da-8730-1ab204dc6704\",\"replyDate\":\"2024-10-14T17:40:00.214Z\"}]"
updatedAt: "2024-10-14T17:40:00.215Z"

*/

function createButton(text, style, cb) {
    let btn = document.createElement("button")
    btn.innerText = text
    btn.classList.add("btn", style)
    btn.style.padding = "5px"
    btn.style.margin = "5px"
    btn.onclick = cb
    return btn
}

function createMessage(message) {
    let mainDiv = document.createElement('div')
    mainDiv.classList.add("card")
    mainDiv.style.backgroundColor = "#1f1f1f"

    let body = document.createElement("div")
    body.classList.add("card-body")

    let rowContainer = document.createElement("div")
    rowContainer.classList.add("container", "text-center")


    let row = document.createElement("div")
    row.classList.add("row", "align-items-start")


    function buildInnerCol(text) {
        let item = document.createElement("div")
        item.classList.add("col")
        item.innerText = text
        row.appendChild(item)
    }
    
    buildInnerCol(
        getDateText(new Date(message.createdAt))
    )
    buildInnerCol(message.content)


    if (isAdmin) {
        let delBTN = document.createElement("button")
        delBTN.innerText = "X"
        delBTN.classList.add("col", "btn", "btn-danger")
        delBTN.style.padding = "5px"
        delBTN.style.width = "2rem"
        delBTN.style.maxWidth = "2rem"
        delBTN.style.borderRadius = "5px"
        delBTN.onclick = async () => {
            await deleteMessage(message.messageID)
            await chatFetchData()
        }

        row.appendChild(delBTN)
    }

    rowContainer.appendChild(row)
    body.appendChild(rowContainer)
    mainDiv.appendChild(body)

    return mainDiv
}



function getDateText(date) {
    var hr = date.getHours() % 12
    var min = date.getMinutes()
    var AM_PM = date.getHours() >= 12 ? "PM" : "AM"

    if (hr == 0) { hr = 12 }
    if (min < 10) { min = `0${min}`}

    let day = date.getDate()
    let month = date.getMonth() + 1

    return `${month}/${day} - ${hr}:${min} ${AM_PM}`
}



async function postMessage(content) {
    return await postData("/wardTracker/messages/create", {
        messageContent: content
    })
}
async function deleteMessage(id) {
    return await postData("/wardTracker/admin/messages/delete", {
        messageID: id
    })
}

/*

/wardTracker/messages/list
/wardTracker/messages/create

/wardTracker/admin/messages/delete

*/





function displayCreateMessage() {
    bootbox.dialog({
        title: "Post a Message",
        message: `
            <form id="customForm">

                <p>
                    All messages are anonymous. Please do not include any personal information. 
                </p>

                <div style="height:10px"></div>

                <div class="form-group">
                    <label for="messageInput">Message:</label>
                    <textarea type="text" class="form-control" id="messageInput" placeholder="" style="min-height: 40vh;" required> </textarea>
                </div>    
            </form>

        `,
        buttons: {
            cancel: {
                label: "Cancel",
                className: "btn-danger"
            },
            submit: {
                label: "Post",
                className: "btn-success",
                callback: async function() {
                    var action = $('#messageInput').val();

                    let response = await postMessage(action)
                    
                    if (response.error) {
                        bootbox.alert({
                            size: 'small',
                            title: 'Error!',
                            message: 'There was an error submitting the message... You probably have submitted too many items. Try again in 15 minutes. :)',
                            centerVertical: true
                        });
                    } else {
                        await chatFetchData()
                    }
                }
            }
        }
    });
}



function displayInfoMessage() {
    bootbox.dialog({
        title: "Ward Messages",
        message: `
            <p> 
                Share your experiences and progress as you strive to attend the temple! 
            </p>
            <br>

            <p>
                All messages are completely anonymous. Please do not include your name in messages.
            </p>

            <br>
            <p> 
                As you share your stories and thoughts, we kindly remind you to always be mindful of the feelings and perspectives of others. When participating in these discussions, please ensure that your comments reflect love, kindness, and respect for everyone. 
            </p>
        `,
        buttons: {
            cancel: {
                label: "Close",
                className: "btn-primary"
            }
        }
    });
}