import React,{useState,useCallback, useEffect, use} from "react";
import {useSocket} from "../context/SocketProvider";
import {useNavigate} from 'react-router-dom'
import backVideo from './backVideo.mp4';


const LobbyScreen=()=>{
    const [email,setEmail]=useState("");
    const [room,setRoom]=useState("");
    const navigate=useNavigate();
    const socket=useSocket();
    console.log(socket);
    const handleSubmitForm=useCallback((e)=>{
        e.preventDefault();
       socket.emit("join:room",{email,room})
    },[email,room,socket]);
     
    const handleJoinRoom=useCallback((data)=>{
        const {email,room}=data;
        navigate(`/room/${room}`);
    },[navigate]);  
    useEffect(()=>{
        socket.on("join:room",handleJoinRoom);
            return ()=>{
                socket.off("join:room",handleJoinRoom)
    }        
    },[socket,handleJoinRoom])
    return (
  <div className="lobby-container">
    <video className="backVideo" autoPlay loop muted>
      <source src={backVideo} type="video/mp4" />
    </video>

    <div className="glass-card">
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="room">Room No</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          required
        />

        <button type="submit" className="btn">Join</button>
      </form>
    </div>
  </div>
);

}

export default LobbyScreen;
