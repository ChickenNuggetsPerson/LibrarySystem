function headerBtnClick(parm) {
    if (parm == 'scan') {
        changePage("/scanBook")
    }
    if (parm == 'logout') {
        changePage("/logout")
    }
    if (parm == 'categories') {
      changePage("/categories")
    }
    if (parm == 'settings') {
        bootbox.dialog({
            size: 'medium',
            backdrop: true,
            title: "User Settings",
            message: "Select Something to Edit",
            buttons: {
              remove: {
                label: "Delete Account",
                className: 'btn-danger',
                callback: function(){
                    deleteUser();
                }
              },
              close: {
                label: "Close",
                className: 'btn-info',
                
              }
            }
        });
    }
}

let data = {}
let checkoutData = {}
let categoryData = {}
window.getData = async function() {
    await fetch('/fetchLibrary', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(response => response.json())
    .then(response => {
        if (response.error) {
        console.log(response)  
        } else {
        data = response
        }
    })
    await fetch('/fetchCheckouts', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(response => response.json())
    .then(response => {
        if (response.error) {
        console.log(response)  
        } else {
        checkoutData = response
        }
    })
    await fetch('/fetchCategories', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(response => response.json())
    .then(response => {
        if (response.error) {
        console.log(response)  
        } else {
        categoryData = response
        }
    })
}

function findStringInArray(str, array) {
    for (let i = 0; i < array.length; i++) {
        if (str === array[i]) {
        return { match: true, index: i }; // Found a match with index
        }
    }
    return { match: false, index: -1 }; // No match found with -1 index
}
function findAddedIndexes(originalArray, updatedArray) {
    if (!originalArray) { return [] }
    if (!updatedArray) { return [] }

    const addedIndexes = [];

    for (let i = 0; i < updatedArray.length; i++) {
        const item = updatedArray[i];
        if (!originalArray.includes(item)) {
        addedIndexes.push(i);
        }
    }

    return addedIndexes;
}
function findRemovedIndexes(originalArray, updatedArray) {
    if (!originalArray) { return [] }
    if (!updatedArray) { return [] }

    const removedIndexes = [];

    for (let i = 0; i < originalArray.length; i++) {
    const item = originalArray[i];
    if (!updatedArray.includes(item)) {
    removedIndexes.push(i);
    }
}

return removedIndexes;
}


function processData() {
    let checkoutArray = []
    for (let i = 0; i < checkoutData.length; i++) {
        checkoutArray.push(checkoutData[i].bookUUID)
        checkoutData[i].bookOBJ = JSON.parse(checkoutData[i].bookOBJ)
    }
    for (let i = 0; i < data.length; i++) {
        let result = findStringInArray(data[i].bookUUID, checkoutArray)
        data[i].checkoutMatch = result.index
        data[i].categories = JSON.parse(data[i].categories)
    }


    for (let i = 0; i < categoryData.length; i++) {
        categoryData[i].books = JSON.parse(categoryData[i].books)
    }


    // Get Cache Files
    let fileList = []
    for (let i = 0; i < data.length; i++) {
        fileList.push(data[i].imageLink)
    }
    setNewCacheList(fileList)

    
}
function updatePage() {
    var mainDiv = document.getElementById("yeet")
    mainDiv.innerHTML = ""

    for (let i = 0; i < data.length; i++) {
        const row = document.createElement('tr')

        const displayImage = document.createElement('th')
        const button = document.createElement("button")
        button.style.width = "fit-content"
        button.style.padding = "5px";
        button.style.borderRadius = "5px"
        button.style.backgroundColor = "wheat"

        button.addEventListener("click", function() {
            overlayBook(i) 
        });

        const divImage = document.createElement('img')
        displayImage.scope = "row"
        divImage.style.maxWidth = "100px"
        divImage.src = data[i].imageLink

        displayImage.appendChild(button)
        button.appendChild(divImage)



        const displayText = document.createElement('td')

        const mainTxt = document.createElement('h3')
        mainTxt.color = "white"
        mainTxt.innerText = data[i].title

        const altTxt = document.createElement("h4")
        const otherAltTxt = document.createElement("h5")
        if (data[i].checkoutMatch != -1) {
            altTxt.style.color = "#e05836"
            altTxt.innerText = "\n(Checked Out)"
            otherAltTxt.style.color = "#e05836"
            otherAltTxt.innerText = "Student " + checkoutData[data[i].checkoutMatch].student + " (" + checkoutData[data[i].checkoutMatch].rawReturnDate + ")"
            otherAltTxt.onclick = function() {  
                table.search("Student " + checkoutData[data[i].checkoutMatch].student)
                table.draw()
            }
        }
        displayText.appendChild(mainTxt)
        displayText.appendChild(altTxt)
        displayText.appendChild(otherAltTxt)


        const displayCategory = document.createElement('td')
        for (let x = 0; x < data[i].categories.length; x++) {
            const txt = document.createElement("h6")
            txt.innerText = "- " + data[i].categories[x]
            txt.style.color = "yellow"
            txt.onclick = function() {  
                table.search(data[i].categories[x])
                table.draw()
            }
            if (x == data[i].categories.length - 1) {
                txt.style.paddingBottom = "100%"
            }
            
            displayCategory.appendChild(txt)
        }
        

        row.appendChild(displayImage)
        row.appendChild(displayText)
        row.appendChild(displayCategory)


        mainDiv.appendChild(row)
    }
}

let table;
async function refreshPage() {
    swipePageDown()
    try {
        table.destroy()
    } catch(err) {}

    console.log("Fetching Data")
    await getData()
    console.log("Processing Data")
    processData();
    console.log("Updating Page")
    updatePage();

    table = new DataTable('#myTable', { 
        destroy: true,
        dom: ' <"search"f><"top"l>rt<"bottom"ip><"clear">',
        language: {
            searchPlaceholder: "Search Books",
            search: "",
        },
        aaSorting: [[1, "asc"]]
    });


    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('search')) { 
        table.search(urlParams.get('search'))
        table.draw()
    } else {
        
    }

    showNotifications()
}

function showNotifications() {
    for (let i = 0; i < checkoutData.length; i++) {
        if (new Date() > new Date(checkoutData[i].rawReturnDate)) {
            $.notify('"' + checkoutData[i].bookOBJ.title + '" is due from student ' + checkoutData[i].student, "error");
        }
    }
}


function removeBook(bookID, bookName) {
    console.log("remove book " + bookID)
    fetch('/library/removeBook', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
    },
        body: JSON.stringify({bookID: bookID})
    }).then(response => response.json())
    .then(response => {
        if (!response.error) { 
        bootbox.dialog({
            backdrop: true,
            message: 'Removed ' + bookName,
            buttons: {
            cancel: {
                label: "Close",
                className: 'btn-primary'
            }
            }
        });
        refreshPage()
        } else {
        bootbox.alert('There was an error in the server');
        }
    })
}


function checkout(bookID) {
    console.log("Checkout Book " + bookID)
    fetch('/library/checkoutBook', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
    },
        body: JSON.stringify({bookID: bookID})
    }).then(response => response.json())
    .then(response => {
        if (!response.error) { 
        changePage("/checkout")
        } else {
        bootbox.alert('There was an error in the server');
        }
    })
}
function returnBook(bookID) {
    console.log("Return Book " + bookID)
    fetch('/library/returnBook', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
    },
        body: JSON.stringify({bookID: bookID})
    }).then(response => response.json())
    .then(response => {
        if (!response.error) { 
            $.notify("Returned Book", "success");
            refreshPage();
        } else {
            bootbox.alert('There was an error in the server');
        }
    })
}


function addBookToCat(bookID, catID, bookIndex) {
    fetch('/categories/addBook', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
    },
        body: JSON.stringify({bookID: bookID, catID: catID})
    }).then(response => response.json())
    .then(response => {
        if (!response.error) { 
        
        } else {
        bootbox.alert('There was an error in the server');
        }
    })
}
function removeBookFromCat(bookID, catID, bookIndex) {
    fetch('/categories/removeBook', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
    },
        body: JSON.stringify({bookID: bookID, catID: catID})
    }).then(response => response.json())
    .then(response => {
        if (!response.error) { 
        
        } else {
        bootbox.alert('There was an error in the server');
        }
    })
}


let values = []
function editCategoryMenu(book, bookIndex) {
    values = []
    if (categoryData.length == 0) {
        return bootbox.alert('There are no categories to assign this book to');
    }

    let options = []
    for (let i = 0; i < categoryData.length; i++) {
        options.push({
        text: categoryData[i].name,
        value: `${i}`
        })
        
        if (findStringInArray(book.bookUUID, categoryData[i].books).match) {
        values.push(`${i}`)
        }
    }


    bootbox.prompt({
    title: 'What Categories Does This Book Belong In?',
    value: values,
    inputType: 'checkbox',
    inputOptions: options,
        callback: function (changed) {
            let dialog = bootbox.dialog({
                message: '<p class="text-center mb-0"><i class="fas fa-spin fa-cog"></i> Applying Changes...</p>',
                closeButton: false
            });


            const addedCats = findAddedIndexes(values, changed);
            const removedCats = findRemovedIndexes(values, changed);

            for (let i = 0; i < removedCats.length; i++) {
                console.log("removed " + categoryData[values[removedCats[i]]].name)
                removeBookFromCat(book.bookUUID, categoryData[values[removedCats[i]]].categoryUUID, bookIndex)
            }
            for (let i = 0; i < addedCats.length; i++) {
                console.log("added " + categoryData[changed[addedCats[i]]].name)
                addBookToCat(book.bookUUID, categoryData[changed[addedCats[i]]].categoryUUID, bookIndex)
            }

            setTimeout(async () => {
                refreshPage()
                dialog.modal('hide');   
            }, 1000);
            
            
        }
    });
}

function overlayBook(index) {
    let book = data[index]

    let message = ""
    if (book.checkoutMatch == -1) {
        message = "<strong>Author: </strong>" + book.author + "<br><br><strong>Not Checked Out</strong><br><br><strong>Categories:</strong>"
    } else {
        message = "<strong>Author: </strong>" + book.author + "<br><br><strong>Checked Out to Sutudent: </strong>" + checkoutData[book.checkoutMatch].student + "<br>Return Date: " + checkoutData[book.checkoutMatch].rawReturnDate + "<br><br><strong>Categories:</strong>"
    }
    
    let categories = book.categories
    for (let i = 0; i < categories.length; i++) {
        message += ("<br>- " + categories[i])
    }


    let checkoutLabel;
    let checkoutClassName;

    if (book.checkoutMatch == -1) {
        checkoutLabel = "Checkout"
        checkoutClassName = 'btn-primary'
        function checkoutCallback() { checkout(book.bookUUID) }
    } else {
        checkoutLabel = "Return Book"
        checkoutClassName = 'btn-success'
        function checkoutCallback() { returnBook(book.bookUUID) }
    }

        

    bootbox.dialog({
        size: 'medium',
        backdrop: true,
        title: book.title,
        message: message,
        buttons: {
        remove: {
            label: "Delete",
            className: 'btn-danger',
            callback: function(){
            bootbox.confirm({
                message: 'Are You Sure You Want To Delete?',
                buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
                },
                callback: function (result) {
                    if (result) {
                    removeBook(book.bookUUID, book.title)
                    }
                }
                });
            
            }
        },
        categories: {
            label: "Categories",
            className: 'btn-success',
            callback: function() {
                editCategoryMenu(book, index)
            }
        },
        editBook: {
            label: "Edit",
            className: 'btn-warning',
            callback: function() {
            changePage("/editBook/" + book.bookUUID)
            }
        },
        checkout: {
            label: checkoutLabel,
            className: checkoutClassName,
            callback: checkoutCallback
        },

        }
    });
}


function deleteUser() {

    bootbox.dialog({
        size: 'medium',
        backdrop: true,
        title: "Are you sure you want to delete your account?",
        message: "This can not be undone",
        buttons: {
          remove: {
            label: "Delete",
            className: 'btn-danger',
            callback: function(){
              bootbox.confirm({
                message: 'Are you really sure?',
                buttons: {
                  confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                  },
                  cancel: {
                    label: 'No',
                    className: 'btn-danger'
                  }
                  },
                  callback: function (result) {
                    if (result) {
                        fetch('/user/delete', {
                            method: 'POST',
                            headers: {
                            'Content-Type': 'application/json'
                        },
                            body: JSON.stringify({yeet: "Yeet"})
                        }).then(response => response.json())
                        .then(response => {
                            if (!response.error) { 
                                changePage("/logout")
                            } else {
                                bootbox.alert('There was an error in the server');
                            }
                        })
                    }
                  }
                });
              
            }
          },
          close: {
            label: "Close",
            className: 'btn-info',
            
          }
        }
    });


   
}

