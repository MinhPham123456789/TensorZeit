const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');


// Store the resulting model in the global scope of our app.
var model = undefined;
var previousSegmentationComplete = true;


// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will 
// define in the next step.
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}


// Enable the live webcam view and start classification.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }
  
  // Hide the button once clicked.
  event.target.classList.add('removed');  
  
  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    // video.addEventListener('loadeddata', predictWebcam);
    video.addEventListener('loadeddata', predictWebcam);
    
    
  });
}

// cocoSsd.load().then(function (loadedModel) {
//     model = loadedModel;
//     // Show demo section now model is ready to use.
//     demosSection.classList.remove('invisible');
// });

bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2
}).then(function(loadedModel){
    model = loadedModel;
    console.log("Show model:", model);
    demosSection.classList.remove('invisible');
});


function predictWebcam() {
  // Now let's start classifying a frame in the stream.
    if (previousSegmentationComplete){
        previousSegmentationComplete = false;
        model.segmentPerson(video).then(function (segmentation) {
            // console.log(segmentation);
            drawCanvas(segmentation);
            previousSegmentationComplete = true;  
            
            // Call this function again to keep predicting when the browser is ready.
            window.requestAnimationFrame(predictWebcam);
        });
    }
    
}

function drawCanvas(segmentation) {
    const canvas = document.getElementById('bodyPixCanvas');
    const ctx = canvas.getContext('2d');
    console.log(segmentation.data.reduce((a,b)=>a + b,0))
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    console.log(data.length, segmentation.data.length);
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (segmentation.data[n] === 1) {
        data[i] = 255;     // red
        data[i + 1] = 255; // green
        data[i + 2] = 255; // blue
        data[i + 3] = 255; // alpha
      } else {
        data[i] = 0;    
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }
      n++;
    }
    ctx.putImageData(imageData, 0, 0, 0, 0, 640, 480);
}

  