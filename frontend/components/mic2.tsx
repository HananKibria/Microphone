"use client"; // This is a client component 👈🏽
// @ts-ignore
import OpusMediaRecorder from 'opus-media-recorder';
import React,{useRef,useEffect,useState} from 'react'; 
// import Axios from 'axios';
import axios from 'axios';
// Non-standard options
const workerOptions = {
    encoderWorkerFactory: function () {
      // UMD should be used if you don't use a web worker bundler for this.
      return new Worker('opus/encoderWorker.umd.js')
    },
    OggOpusEncoderWasmPath: 'opus/OggOpusEncoder.wasm',
    WebMOpusEncoderWasmPath: 'opus/WebMOpusEncoder.wasm',
  };


const Mic2=(props:any)=>{

    const countRecord=useRef<number>(0)

    const audioElement=useRef<any>();

    const location = useRef<any>();

    const resID=useRef<any>();
    const partNumber=useRef<any>(0);
    const parts=useRef<any>([]);
    const stream=useRef<any>();
    const fileName=useRef<any>();
    const [endRef,setEndRef]=useState<any>(false);
    const text=useRef<any>("Tap to start Recording")

    // const recorder=useRef<any>();

    useEffect(() => {

        if('geolocation' in navigator) {
         // console.log("sddds");
            // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
            navigator.geolocation.getCurrentPosition((({ coords }) => {
                const { latitude, longitude } = coords;
                console.log(coords)
                location.current={ latitude, longitude };
            }),((err)=>{
              console.log("error getting location")
            }),{maximumAge:60000, timeout:5000, enableHighAccuracy:true})
        }
        window.MediaRecorder = OpusMediaRecorder;
    }, []);
  useEffect(()=>{
    console.log("sdsfds");
    (async()=>{
      console.log(endRef)
      console.log(fileName.current);
      if(endRef===true){
        await fetch(`api/complete/${fileName.current}?uploadId=${resID.current}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(parts.current)
        });
      }
    })();

  },[endRef])
    
   const [record,setRecord]=useState<boolean>(false);
    
   let stopped=useRef<any>(false);
   let recorder=useRef<any>()

   const stopRecording = async() => {
    recorder.current.stop();
    // Remove “recording” icon from browser tab
    recorder.current.addEventListener("stop",async()=>{
      stopped.current=true
    })
    stream.current.getTracks().forEach((i:any) => i.stop());
    text.current="Tap to start recording"
    setRecord(false );

   }
   function getRandomInt(max:any) {
    return Math.floor(Math.random() * max);
  }
 async function startRecording () {

6
    setEndRef(false);
    stopped.current=false;
    partNumber.current=0;
    parts.current=[]
    console.log(location.current);
     fileName.current= `fileRecord-${countRecord.current}-${getRandomInt(100000)}-`
    if(location.current){
      fileName.current=fileName.current+`${location.current.latitude}-${location.current.longitude}`;
    }
    fileName.current=fileName.current+'.ogg'
    countRecord.current=countRecord.current+1;
    console.log(fileName.current);
    resID.current=(await axios.get(`api/create/${fileName.current}`)).data
    console.log(resID.current);
    let options = { mimeType: 'audio/ogg' };
    stream.current=await navigator.mediaDevices.getUserMedia({ audio: true })
    text.current="Tap to stop recording";
    setRecord(true );

    // Start recording
    // @ts-ignore
    recorder.current = new MediaRecorder(stream.current,options);
    recorder.current.start(5*1024*1024);
    // Set record to <audio> when recording will be finished
    recorder.current.addEventListener('dataavailable',async(event:any) => {
      // Get the chunk data
      partNumber.current++;
      let value=partNumber.current;
  const chunk = event.data;

  // Get a pre-signed URL from the backend
  const presignedUrl = await fetch(`api/presign/${fileName.current}?uploadId=${resID.current}&partNumber=${partNumber.current}`).then(res => res.text());
      console.log(presignedUrl);
  // Upload the chunk using Axios or other HTTP client
  // var optionsReq = { headers: { 'x-amz-acl': 'private' } };
  // const axios2 = Axios.create()
  //  delete axios.defaults.headers.put['Content-Type']
  // const res=await axios.put(presignedUrl,chunk)
  const res=await axios.put(presignedUrl, chunk, {
    headers:
    {
      "Content-Type":"audio/ogg",   
     }
  });
  console.log(res);
  //const res = await axios.put(presignedUrl, chunk,optionsReq);

  // Store the part number and ETag for later use
   parts.current.push({
    PartNumber: value,
    ETag: res.headers.etag
  });
  console.log(parts.current)

  // Increment the part number
  if(stopped.current===true){
    setEndRef(true);
  }
    });
}
 
// Recording should be started in user-initiated event like buttons

return(
    <div>
               <button onClick={()=>record?stopRecording():startRecording()} type="button"><svg  fill={`${record?"red":"blue"}`} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg></button>
        <br/>
      <h3>  {text.current}</h3>
    </div>
)
}
export default Mic2;