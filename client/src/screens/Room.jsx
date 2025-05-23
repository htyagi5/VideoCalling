import React,{ useEffect,useCallback,useState, use} from "react";
import ReactPlayer from 'react-player'//make possible to play video
import {useSocket} from "../context/SocketProvider";
import peer from "../services/peer";
import backVideo from './backVideo.mp4';    
const RoomPage=()=>{
    const socket=useSocket();
    const [remoteSocketId,setRemoteSocketId]=useState(null);
    const [myStream,setMyStream]=useState();
    const [remoteStream,setRemoteStream]=useState();
    const handleUserJoined= useCallback(({email,id})=>{
        console.log(`Email:${email} joined the room with id:${id}`);
        setRemoteSocketId(id);
    })

    const [callStarted, setCallStarted] = useState(false);

  const handleCallUser = useCallback(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  const offer = await peer.getOffer();
  setMyStream(stream);
  setTimeout(() => {
    socket.emit('call:user', { to: remoteSocketId, offer });
  }, 1000);
  setCallStarted(true); // 👈 Call has started
}, [remoteSocketId, socket]);


    const handleIncomingCall=useCallback(async({from,offer})=>{
          setRemoteSocketId(from);//jisse hame call aayi hai
         const stream=await navigator.mediaDevices.getUserMedia({
        video:true,
        audio:true
    });
     
    setMyStream(stream);
        console.log("Incoming call",from ,offer);
        const answer= await peer.getAnswer(offer);
        socket.emit("call:accepted",{to:from,answer});
    },[socket]);

   const sendStreams = useCallback(() => {
  for (const track of myStream.getTracks()) {
    peer.peer.addTrack(track, myStream);
  }
  setStreamSent(true);
  setCallStarted(true); // 👈 Call has started
}, [myStream]);

    const handleCallAccepted=useCallback(async({from,answer})=>{
         await peer.setLocalDescription(answer);
         console.log("Call accepted",from,answer);
    sendStreams();
},[sendStreams]);

const handleNegotiationNeeded=useCallback( async()=>{
        const offer=await peer.getOffer();
        socket.emit("peer:nego:needed",{offer,to:remoteSocketId});
    },[remoteSocketId,socket]);

useEffect(()=>{
    peer.peer.addEventListener("negotiationneeded",handleNegotiationNeeded);
    return()=>{
        peer.peer.removeEventListener("negotiationneeded",handleNegotiationNeeded)
    }
},[handleNegotiationNeeded])

const handleNegoNeedIncoming=useCallback(async({from,offer})=>{
    const answer=await peer.getAnswer(offer);
    socket.emit("peer:nego:done",{to:from,answer});
},[socket]);

const handleNegoNeedFinal=useCallback(async({answer})=>{
    await peer.setLocalDescription(answer);
},[]);

const [streamSent, setStreamSent] = useState(false);
useEffect(()=>{ 
    peer.peer.addEventListener("track",async (e)=>{
        const remoteStream=e.streams[0];
        setRemoteStream(remoteStream);
})
},[myStream]);



    useEffect(()=>{
        socket.on("user:joined",handleUserJoined);
         socket.on("incoming:call",handleIncomingCall);
         socket.on("call:accepted",handleCallAccepted);
         socket.on("peer:nego:needed",handleNegoNeedIncoming);
         socket.on("peer:nego:final",handleNegoNeedFinal);
        return ()=>{
            socket.off("user:joined",handleUserJoined)
            socket.off("incoming:call",handleIncomingCall)
            socket.off("call:accepted",handleCallAccepted)
            socket.off("peer:nego:needed",handleNegoNeedIncoming)
            socket.off("peer:nego:final",handleNegoNeedFinal)
        }
    },[socket,handleUserJoined,handleIncomingCall,handleCallAccepted,handleNegoNeedIncoming,handleNegoNeedFinal])

    

    return(
        <div className="CallPage">
            <video className="backVideo" autoPlay loop muted >
              <source src={backVideo} type="video/mp4" />
            </video>
           {!callStarted && (
  <div className="content">
    <h2>{remoteSocketId ? 'Welcome, you are Connected' : 'Empty Room'}</h2>
    {!streamSent && myStream && <button className="btn" onClick={sendStreams}>Send Stream</button>}
    {remoteSocketId && <button className="btn" onClick={handleCallUser}>Call</button>}
  </div>
)}

           <div className="head">
            <h1>MY Stream</h1>
            <h1>Remote Stream</h1>
           </div>
           <div className={`callSpace ${callStarted ? 'active' : ''}`}>
  {myStream && (
    <>
      <div className="sender">
        <ReactPlayer playing muted width="100%" height="100%" url={myStream} />
      </div>
      <div className="receiver">
        <ReactPlayer playing muted width="100%" height="100%" url={remoteStream} />
      </div>
    </>
  )}
</div>

        </div>
    )
}
export default RoomPage;
