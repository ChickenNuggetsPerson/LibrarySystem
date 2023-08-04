

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
    window.scrollTo(0,0)
    document.querySelector('.swipe-content').classList.add('swipe-transition');
}
function swipePageDown() {
    document.querySelector('.swipe-content').classList.remove('swipe-transition');
}


async function displayLogo() {
    return new Promise((resolve) => {

        let imgPath = "/static/Loading.mp4"

        let dialog = bootbox.dialog({
            message: `<video id="myVideo" style="width:100%" class="center" src="${imgPath}" autoplay playsinline webkit-playsinline ></video>`,
            closeButton: false,
            centerVertical: true,
            size: 'extra-large',
            buttons: {
                skip: {
                    label: "Skip",
                    className: 'btn-primary',
                    callback: function(){
                        resolve();
                    }
                }
            }
        }).find('.modal-content').css({'background-color': '#444445', 'font-weight' : 'bold', color: '#F00', 'font-size': '2em', 'font-weight' : 'bold'} );

        var myVideo = document.getElementById('myVideo');
        myVideo.addEventListener('ended', function() {
            console.log('GIF animation ended');
            dialog.hide()
            resolve();
        });
    })
}  


async function setNewCacheList(list) {
    localStorage.setItem('cacheList', JSON.stringify(list))
}
