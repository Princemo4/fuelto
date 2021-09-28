
let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#recorder-video");
let start_button = document.querySelector("#start-record");
let stop_button = document.querySelector("#stop-record");
let save_video = document.querySelector("#save-video");

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
    start_button.disabled = true
    stop_button.disabled = false
    save_video.disabled = true
    // set MIME type of recording as video/webm
    media_recorder = new MediaRecorder(camera_stream, { mimeType: 'video/webm' });
  
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
    
    console.log(video_local)
    // save_video.href = video_local;
    start_button.innerText = 'Delete & Record Again'
    start_button.disabled = false;
    stop_button.disabled = true;
    save_video.disabled = false;
  });
  
  save_video.addEventListener('click', function() {
    console.log('click')
    let formData = new FormData();
  
    formData.append('file', blob_file, 'henry.webm')
    formData.append('full_name', 'Mohamed')
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



