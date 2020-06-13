
let imageUrls = []
let imageNames = []
let bestOf = 0
let imageLeft = 0;
let imageRight = 1;
let imagesThisRound = [];
let imagesNextRound = [];

let round = 1
let winnerChosen = false;
var db = firebase.firestore();

const url = window.location.search;
const quizId = new URLSearchParams(url).get('q')

if (!quizId) {
    window.location.href = "home.html";
}

var storageRef = firebase.storage().ref();
var spaceRef = storageRef.child('quizImages/' + quizId + '/');
let urlToDocId = {}
let urlToWins = {}
let totalWins = 0;
const increment = firebase.firestore.FieldValue.increment(1);

const ls = window.localStorage;
const rated = JSON.parse(ls.getItem('ratedQuizes'))
// console.log('kokdd')
// console.log(storageRef.child('quizImages/sdf' + quizId + 'sdf/'))
// console.log(storageRef.child('quizImages/' + quizId + '/'))
// console.log('kek')
// console.log(storageRef.child('quizImages/').listAll())

// console.log('lil')
// console.log(storageRef.child('quizImages/' + quizId).listAll())
// console.log('lol')

db.collection("quizes").doc(quizId).get().then((doc) => {
    document.getElementById("quiz-title").innerHTML = doc.data().name;
})

db.collection("quizes").doc(quizId).collection("items").get().then((querySnapshot) => {
    if (!querySnapshot) {
        window.location.href = "home.html";
    }
    querySnapshot.forEach((doc) => {
        const imageUrl = doc.data().url
        const imageName = doc.data().name
        const imageWins = doc.data().wins
        imageUrls.push(imageUrl)
        imageNames.push(imageName)
        urlToDocId[imageUrl] = doc.id
        urlToWins[imageUrl] = imageWins
        totalWins += imageWins;
    });
}).then(() => {
    bestOf = imageUrls.length
    for (let i = 2; i < bestOf; i++) {
        imagesThisRound.push(i)
    }

    imagesPreload = []
    for (var i = 0; i < bestOf; i++) {
        imagesPreload[i] = new Image();
        imagesPreload[i].src = imageUrls[i];
    }

    document.getElementById("image-left").setAttribute("src", imageUrls[imageLeft]);
    document.getElementById("image-right").setAttribute("src", imageUrls[imageRight]);
    document.getElementById("image-name-left").innerHTML = imageNames[imageLeft]
    document.getElementById("image-name-right").innerHTML = imageNames[imageRight]
    document.getElementById("best-of-num").innerHTML = bestOf
    document.getElementById("round-num").innerHTML = round + '/' + bestOf / 2
})


//VIA STORAGE
// spaceRef.listAll().then(function (all) {
//     if (all.items.length === 0) {
//         window.location.href = "home.html";
//     } else {
//         all.items.forEach(item => {
//             storageRef.child(item.fullPath).getDownloadURL().then(function (url) {
//                 imageUrls.push(url)

//                 //improve this:
//                 if (imageUrls.length === all.items.length) {
// bestOf = imageUrls.length
// for (let i = 2; i < bestOf; i++) {
//     imagesThisRound.push(i)
// }

// imagesPreload = []
// for (var i = 0; i < bestOf; i++) {
//     imagesPreload[i] = new Image();
//     imagesPreload[i].src = imageUrls[i];
// }

// document.getElementById("image-left").setAttribute("src", imageUrls[imageLeft]);
// document.getElementById("image-right").setAttribute("src", imageUrls[imageRight]);
// document.getElementById("best-of-num").innerHTML = bestOf
// document.getElementById("round-num").innerHTML = round + '/' + bestOf / 2
//                 }
//             })
//         })
//     }
// })

function onImageClick(pos) {
    if (pos === 'left') {
        document.getElementById("image-left-div").classList.add("chosen");
        document.getElementById("image-right-div").classList.add("notchosen");
    } else {
        document.getElementById("image-right-div").classList.add("chosen");
        document.getElementById("image-left-div").classList.add("notchosen");
    }
    setTimeout(function () {
        document.getElementById("image-left-div").classList.remove("chosen");
        document.getElementById("image-left-div").classList.remove("notchosen");
        document.getElementById("image-right-div").classList.remove("chosen");
        document.getElementById("image-right-div").classList.remove("notchosen");
    }, 0);
    setTimeout(function () {
        round += 1
        document.getElementById("round-num").innerHTML = round + '/' + bestOf / 2
        if (pos === 'left') {
            imagesNextRound.push(imageLeft);
        } else {
            imagesNextRound.push(imageRight);
        }

        if (imagesThisRound.length === 0) {
            if (imagesNextRound.length === 1) {
                document.getElementById("quiz-body").style.display = "none";
                document.getElementById("winner-image").setAttribute("src", imageUrls[imagesNextRound[0]]);
                document.getElementById("quiz-winner").style.display = "block";
                document.getElementById("header-text").innerHTML = 'Winner!'
                document.getElementById("image-name-left").remove()
                document.getElementById("image-name-right").remove()
                db.collection("quizes").doc(quizId).collection("items").doc(urlToDocId[imageUrls[imagesNextRound[0]]]).update({ wins: increment });
                const imageWins = urlToWins[imageUrls[imagesNextRound[0]]]
                const percentage = totalWins ? (imageWins / totalWins * 100).toFixed(2) + '%' : '0' + '%'
                document.getElementById("header-text").innerHTML = 'Winner! ' + percentage + ' have selected the same (' + imageWins + ' out of ' + totalWins + ')'
                if (!rated || !rated.includes(quizId)) {
                    document.getElementById("rate-quiz").style.display = "block";
                    document.getElementById("rate-like").onclick = function () {
                        db.collection("quizes").doc(quizId).update({ likes: increment });
                        document.getElementById("rate-quiz").innerHTML = 'Thanks!'
                        const newRated = rated || []
                        newRated.push(quizId)
                        ls.setItem('ratedQuizes', JSON.stringify(newRated))
                    };

                    document.getElementById("rate-dislike").onclick = function () {
                        db.collection("quizes").doc(quizId).update({ dislikes: increment });
                        document.getElementById("rate-quiz").innerHTML = 'Thanks!'
                    };
                }
                return;
            } else {
                imagesThisRound = [...imagesNextRound]
                imagesNextRound = []
                document.getElementById("best-of-num").innerHTML = imagesThisRound.length
                round = 1
                bestOf = imagesThisRound.length
                document.getElementById("round-num").innerHTML = round + '/' + bestOf / 2
            }
        }

        imageLeftIndex = Math.floor(Math.random() * imagesThisRound.length)
        imageLeft = imagesThisRound.splice(imageLeftIndex, 1)[0]

        imageRightIndex = Math.floor(Math.random() * imagesThisRound.length)
        imageRight = imagesThisRound.splice(imageRightIndex, 1)[0]

        document.getElementById("image-left").setAttribute("src", imageUrls[imageLeft]);
        document.getElementById("image-right").setAttribute("src", imageUrls[imageRight]);
        document.getElementById("image-name-left").innerHTML = imageNames[imageLeft]
        document.getElementById("image-name-right").innerHTML = imageNames[imageRight]
    }, 500);
}

document.onkeydown = checkKey;
function checkKey(e) {
    if (!winnerChosen) {
        e = e || window.event;
        if (e.keyCode == '37') {
            onImageClick('left')
        }
        else if (e.keyCode == '39') {
            onImageClick('right')
        }
    }
}

