

function changePage(url) {
    swipePageUp()
    setTimeout(() => {
        window.location.replace(url);
    }, 500);
}

window.onload = function() {
    document.querySelector('.swipe-content').classList.remove('swipe-transition');
};



function swipePageUp() {
    document.querySelector('.swipe-content').classList.add('swipe-transition');
}
function swipePageDown() {
    document.querySelector('.swipe-content').classList.remove('swipe-transition');
}


async function displayLogo() {
    return new Promise((resolve) => {

        let imgPath = "/static/Loading.webm"

        let dialog = bootbox.dialog({
            message: `<video id="myVideo" class="center" src="${imgPath}" autoplay></video>`,
            closeButton: false
        }).find('.modal-content').css({'background-color': '#222222', 'font-weight' : 'bold', color: '#F00', 'font-size': '2em', 'font-weight' : 'bold'} );

        var myVideo = document.getElementById('myVideo');
        myVideo.addEventListener('ended', function() {
            console.log('GIF animation ended');
            dialog.hide()
            resolve();
        });
    })
}   