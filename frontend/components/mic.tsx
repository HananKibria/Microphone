"use client"; // This is a client component 👈🏽

import React, {useEffect, useState,useRef} from 'react';
import dynamic from 'next/dynamic';
//import { createFFmpeg } from '@ffmpeg/ffmpeg';
import axios from 'axios';
const ReactMic = dynamic(async()=>(await import('react-mic')).ReactMic, {
  ssr:false,
})
const Mic=(props:any) =>{

  
  const countRecord=useRef<number>(0)
  const mensen = useRef<any>([]);
  const location = useRef<any>();
  const text=useRef<any>("Tab to start Recording")

  useEffect(() => {
      if('geolocation' in navigator) {
          // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
          navigator.geolocation.getCurrentPosition(({ coords }) => {
              const { latitude, longitude } = coords;
              console.log(coords)
              location.current={ latitude, longitude };
          })
      }
  }, []);

  
 const [record,setRecord]=useState<boolean>(false);

 const startRecording = () => {
      setRecord(true );
      text.current="Tap to stop recording";
  }
 
 const stopRecording = () => {
    setRecord(false );
    text.current="Tap to start recording"
  }
 
  const onData= async (recordedBlob:any) =>{
    // console.log(recordedBlob)
      var fd = new FormData();
      let fileName= `fileRecord-${countRecord.current}`
      if(location.current){
        fileName=fileName+`${location.current.latitude}-${location.current.longitude}`;
      }
      fileName=fileName+'.mp3'
      fd.append('recordedBlob', recordedBlob, fileName);
  
      fetch('http://localhost:4000/api/upload', {
        method: 'post',
        body: fd
      });
    }
  

 const onStop=(recordedBlob:any) =>{
    console.log('recordedBlob done: ',countRecord.current);
    countRecord.current=countRecord.current+1
  }
    return (
      <div>
        <ReactMic
          record={record}
          className="sound-wave"
          onStop={onStop}
          onData={onData}
          strokeColor="#000000"
          backgroundColor="#FF4081" />
          <br/>
        <button onClick={()=>record?stopRecording():startRecording()} type="button"><svg  fill={`${record?"red":"blue"}`} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg></button>
        <br/>
      <h3>  {text.current}</h3>
      </div>
    );
}
export default Mic;