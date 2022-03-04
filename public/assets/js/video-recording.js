
let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#recorder-video");
let start_button = document.querySelector("#start-record");
let stop_button = document.querySelector("#stop-record");
let save_video = document.querySelector("#save-video");
let rocket_placeholder = document.querySelector("#rocket-placeholder");
let video_preview_placeholder = document.querySelector("#video-preview-placeholder");
let video_preview = document.querySelector("#video-preview");

stop_button.disabled = true;
start_button.disabled = true;
save_video.disabled = true;

let camera_stream = null;
let media_recorder = null;
let blobs_recorded = [];
let options = {
  audio: {
    sampleRate: 48000,
    channelCount: 2,
    volume: 1.0,
    echoCancellation: true
  },
  video: true
}
let video_local;
let blob_file;
// let did_camera_start = () => {
//   if (!camera_stream) {
//     alert('Click Start Camera First!')
//     return false
//   }
//   return true
// };

//=== handle older browsers that might implement getUserMedia in some way
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
  navigator.mediaDevices.getUserMedia = function(constraintObj) {
      let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }
          
      return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraintObj, resolve, reject);
      });
  }
}else{
  navigator.mediaDevices.enumerateDevices()
      .then(devices => {
          devices.forEach(device=>{
          console.log(device.kind.toUpperCase(), device.label);
          })
      })
  .catch(err=>{
          console.log(err.name, err.message);
  })
}
//===

async function startCamera() {
  start_button.disabled = false;
  camera_stream = await navigator.mediaDevices.getUserMedia(options);
  if (!camera_stream) {
    alert('Something went wrong with your camera device')
    throw new Error('Something went wrong with your camera device')
  }
  video.srcObject = camera_stream;
  camera_button.removeEventListener('click', ev1)
  camera_button.style.display = 'none'
  video.removeEventListener('click', ev1)

  start_button.addEventListener('click', function() {
    blobs_recorded = []; //clear previous recording
    start_button.innerText = 'RECORDING....'
    start_button.classList = 'btn btn-danger text-white col-lg-6'
    video_preview_placeholder.hidden = true;
    video.hidden = false;
    start_button.disabled = true
    stop_button.disabled = false
    save_video.disabled = true
    // set MIME type of recording as video/webm
    userAgent = navigator.userAgent.toLowerCase()
   if ( (userAgent.indexOf("safari") != -1) && (userAgent.indexOf("chrome") == -1) ) {

    	media_recorder = new MediaRecorder(camera_stream, { mimeType: 'video/mp4' });
    }else {	
    	media_recorder = new MediaRecorder(camera_stream, { mimeType: 'video/webm' });
    }
  
    // event : new recorded video blob available 
    media_recorder.addEventListener('dataavailable', function(e) {
      blobs_recorded.push(e.data);
    });
  
    // start recording with each recorded blob having 1 second video
    media_recorder.start(1000);
  });
  
  stop_button.addEventListener('click', function() {
    media_recorder.stop(); 
    blob_file = new Blob(blobs_recorded, { type: 'video/mp4' })
    video_local = URL.createObjectURL(blob_file);
    
    video_preview.src = video_local;
    video_preview_placeholder.hidden = false;
    video.hidden = true;
    start_button.innerText = 'Delete & Record Again'
    start_button.classList = 'btn btn-danger text-white col-lg-6'
    start_button.disabled = false;
    stop_button.disabled = true;
    save_video.disabled = false;
  });
  
  save_video.addEventListener('click', function() {
    console.log('click')
    let formData = new FormData();
  
    formData.append('file', blob_file, 'henry.webm')
    // formData.append('full_name', 'Mohamed')
    console.log(formData)
    $.ajax({
      url: '/upload',
      method: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      success: (res) => {
        response = JSON.parse(JSON.stringify(res))
        sessionStorage.setItem('fileName', response.fileName)
        window.location = response.go_to + "?fileName=" + response.fileName
      }
    })
  })

}

function ev1() {
  // this function was named so it can be referenced in the 
  // .removeEventListener()
  startCamera();
}
camera_button.addEventListener('click', ev1)

video.addEventListener('click', ev1)



