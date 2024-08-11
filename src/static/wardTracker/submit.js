
console.log("Submit Page")
var loading = true

setTimeout(() => {
    loadValues()
}, 500);
async function loadValues() {
    let possibleVals = await getData("/wardTracker/entries/acceptableVals")
    console.log(possibleVals)

    possibleVals.actionTypes.forEach(e => {
        let option = document.createElement('option')
        option.innerText = e
        option.value = e
        document.getElementById("inputActionType").appendChild(option)
    });

    document.getElementById("peopleAmtInput").min = possibleVals.actionRange.min
    document.getElementById("peopleAmtInput").max = possibleVals.actionRange.max

    possibleVals.memberTypes.forEach(e => {
        let option = document.createElement('option')
        option.innerText = e
        option.value = e
        document.getElementById("memberTypeInput").appendChild(option)
    });

    loading = false
    document.getElementById("titleText").innerText = "Submit Entry"
    invalidateForm()
}






function invalidateForm() {
    document.getElementById("inputActionType").value = "empty"
    document.getElementById("peopleAmtInput").value = 0
    document.getElementById("memberTypeInput").value = "empty"
}
function validate() {
    
    if (document.getElementById("inputActionType").value == "empty") {
        return true
    }
    if (document.getElementById("peopleAmtInput").value == 0) {
        return true
    }
    if (document.getElementById("memberTypeInput").value == "empty") {
        return true
    }

    return false
}
function checkSubmitButton() {
    document.getElementById("submitBtn").disabled = validate() || loading
}


checkSubmitButton()
document.getElementById("inputActionType").onchange = () => { checkSubmitButton() }
document.getElementById("peopleAmtInput").onchange = () => { checkSubmitButton() }
document.getElementById("memberTypeInput").onchange = () => { checkSubmitButton() }


async function submitForm() {
    console.log("Submitting Entry")

    let data = {
        actionType: document.getElementById("inputActionType").value,
        actionAmt: document.getElementById("peopleAmtInput").value,
        memberType: document.getElementById("memberTypeInput").value
    }
    console.log(data)

    let response = await postData("/wardTracker/entries/submit", data)
    console.log(response)

    if (response.error) {
        bootbox.alert({
            size: 'small',
            title: 'Error!',
            message: 'You have submitted too many entries. Try again in 15 minutes.',
            centerVertical: true
        });
    } else {
        bootbox.alert({
            size: 'small',
            title: 'Success!',
            message: 'Your entry has been submitted. It may take up to 30 seconds for the progress views to update.',
            centerVertical: true
        });

        invalidateForm()
    }
}