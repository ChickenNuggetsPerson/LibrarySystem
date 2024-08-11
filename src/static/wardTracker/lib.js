



async function getData(url) {
    return new Promise(resolve => {

        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        const apiUrl = `${baseUrl}${url}`;

        fetch(apiUrl, {
            method: 'GET',
            headers: {}
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json()
        })
        .then(data => {
            resolve(data)
        })

    })
}


async function postData(url, data) {
    return new Promise(resolve => {

        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        const apiUrl = `${baseUrl}${url}`;

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            resolve(data)
        })
        .catch((error) => {
            console.error('Error:', error);
            resolve({error: true})
        });

    })
}