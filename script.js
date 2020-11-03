const video = document.getElementById("video")

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo)


let images = {
    "happy": ["happy_0.png", "happy_1.jpg"],
    "sad": ["sad_0.jpeg", "sad_1.jpg", "sad_2.jpg"],
    "surprised": ["suprised_0.jpg"],
    "neutral": ["neutral_0.jpg", "neutral_1.png", "neutral_2.png", "neutral_3.jpg", "neutral_4.png"]
}

function startVideo(){
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err0r) {
                console.log("Something went wrong!");
                console.error(err0r);
            });
    }
}

let oldMood = null;
video.addEventListener('play', () => {
    document.getElementById("loader").style.display = "none";
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        let mood = {name: "", value: 100}
        for(const [key, value] of Object.entries(detections[0].expressions)){
            let diff = 1 - value
            if(diff < mood.value && diff >= 0){
                mood.name = key
                mood.value = diff
            }
        }
        console.log(oldMood == mood.name);
        if(oldMood != mood.name){
            oldMood = mood.name;
            document.getElementById("mood").innerHTML = mood.name;
            document.body.className = mood.name;
            let img = document.getElementById("image");
            img.src = "images/" + images[mood.name][Math.floor(Math.random() * images[mood.name].length)] 
        }
    }, 100)
})
