var book = !{book};
console.log(book)

document.getElementById("title").innerText = 
document.getElementById("title").src = 
document.getElementById("adsf").



function updatePage(bookList) {
    const mainDiv = document.getElementById("displayTable")
    mainDiv.innerHTML = ""

    for (let i = 0; i < bookList.length(); i++) {
        const row = document.createElement('th')
        
        const displayImage = document.createElement('th')
        displayImage.addEventListener
        displayImage.style.

        displayImage.scope = "row"
        displayImage.href = bookList[i].imageLink

        const displayText = document.createElement('td')
        displayText.innerText = bookList[i].title

        row.appendChild(displayImage)
        row.appendChild(displayText)
        mainDiv.appendChild(row)
    }
}


