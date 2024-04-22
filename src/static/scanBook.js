document.getElementById("manualenter").style.display = "none";
document.getElementById("reader").style.display = "none";
let lastRead = "";

let dialog;
function onScanSuccess(decodedText, decodedResult) {
    console.log(`Code scanned = ${decodedText}`, decodedResult);
    html5QrcodeScanner.clear();
    if (decodedResult == lastRead) {
        return;
    }
    dialog = bootbox.dialog({
        message:
            '<p class="text-center mb-0"><i class="fas fa-spin fa-cog"></i> Fetching Data</p>',
        closeButton: false,
    });

    fetch("/library/scanBook", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ isbnCode: decodedResult }),
    })
        .then((response) => response.json())
        .then((response) => {
            console.log(response);
            dialog.modal("hide");
            if (!response.error) {
                dialog.modal("hide");
                setTimeout(() => {
                    changePage("/addBook");
                }, 2000);
            } else {
                dialog.modal("hide");
                document.getElementById("error").innerText =
                    "Could Not Get Data\nEnter Information Manually";
                dialog.modal("hide");
                document.getElementById("qr-reader").remove();
                document.getElementById("manualenter").style.display = "";
                document.getElementById("buttons").innerHTML = "";
                document.getElementById("recomendTXT").innerText = "";
                dialog.modal("hide");
            }
        });
}
function btnClick(option) {
    if (option == "scan") {
        document.getElementById("manualenter").style.display = "none";
        document.getElementById("reader").style.display = "";
        document.getElementById("buttons").innerHTML = "";
        document.getElementById("recomendTXT").innerText = "";
    }
    if (option == "manual") {
        let chosen = window.prompt("Enter ISBN", "");
        if (chosen != "" && chosen != null) {
            onScanSuccess("", chosen);
        }
    }
    if (option == "noISBN") {
        document.getElementById("qr-reader").remove();
        document.getElementById("manualenter").style.display = "";
        document.getElementById("buttons").innerHTML = "";
        document.getElementById("recomendTXT").innerText = "";
    }
    if (option == "barcodeScanner") {
        connectSerial();
    }
}

var html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", {
    fps: 10,
    qrbox: 250,
    rememberLastUsedCamera: true,
    showTorchButtonIfSupported: true,
    useBarCodeDetectorIfSupported: true,
    showZoomSliderIfSupported: true,
    defaultZoomValueIfSupported: 2,
});
html5QrcodeScanner.render(onScanSuccess);



let port;
async function connectSerial() {
    try {
        const portInfoString = localStorage.getItem("serialPortInfo");
        if (portInfoString) {
            console.log("reading port");
            const portInfo = JSON.parse(portInfoString);
            port = await navigator.serial.requestPort(portInfo);
        } else {
            port = await navigator.serial.requestPort();
            localStorage.setItem("serialPortInfo", JSON.stringify(port));
            console.log("saving port");
        }

        await port.open({ baudRate: 9600 }); // Adjust baudRate according to your barcode scanner settings

        const reader = port.readable.getReader();

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                console.log("Reader closed, exiting.");
                break;
            }
            // Process received data
            processData(value);
        }
    } catch (error) {
        console.error("Serial connection error:", error);
    }
}

function processData(data) {
    // Convert received data to a string (assuming it's UTF-8 encoded)
    const receivedData = new TextDecoder().decode(data);
    // Call your function with the received data
    processBarcode(receivedData);
}

function processBarcode(data) {
    // This is where you handle the received data
    console.log("Received data:", data);
    // You can perform any desired actions with the received data here
    onScanSuccess(data, data)
}
