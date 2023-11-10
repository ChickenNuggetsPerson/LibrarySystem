
console.log(book)


document.getElementById("title").innerText = book.title;
try {document.getElementById("cover").src = book.cover.large;} catch(err) {}


let noCover = true;
if (document.getElementById("cover").src != "") {
    document.getElementById("noImage").innerHTML = ""
    noCover = false
}
fetchCategories()

let categoryData = {}
let selectedCategories = []
async function fetchCategories() {
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

async function btnClicked(answer){
    if (answer && !noCover) {
        fetch('/library/addBook', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
        },
            body: JSON.stringify({answerResult: answer, categories: selectedCategories})
        }).then(response => response.json())
        .then(response => {
            window.location.replace("/library");
        })
        return
    }
    if (answer && noCover) {
        var form = document.getElementById('coverSubmitForm');
        const url = form.action;
        try {
            const formData = new FormData(form);

            formData.append("categories", selectedCategories)

            console.log(formData)
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            console.log(response);
            window.location.replace("/library");

        } catch (error) {
            console.error(error);
        }

        return
    }
    fetch('/library/addBook', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
    },
        body: JSON.stringify({answerResult: false})
    }).then(response => response.json())
    .then(response => {
        window.location.replace("/library");
    })
    
}

let selectedCategoriesIndex = []
function updateCatDisplay() {
    const div = document.getElementById("categories")
    div.innerHTML = ""

    for (let i = 0; i < selectedCategoriesIndex.length; i++) {
        let txt = document.createElement("h6")
        txt.innerText = "- " + categoryData[selectedCategoriesIndex[i]].name
        txt.style.color = "yellow"
        div.appendChild(txt)
    }

}

let values = []
function categoriesClicked() {
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
    }

    bootbox.prompt({
        title: 'What Categories Does This Book Belong In?',
        value: values,
        inputType: 'checkbox',
        inputOptions: options,
            callback: function (changed) { 
                if (!changed) { return }
                selectedCategories = [] 
                for (let i = 0; i < changed.length; i++) {
                    selectedCategories.push(categoryData[changed[i]].categoryUUID)
                }        
                selectedCategoriesIndex = changed
                updateCatDisplay()                
            }
        });
}
