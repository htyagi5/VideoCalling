import React,{useState,useCallback, useEffect, use} from "react";
import {useSocket} from "../context/socketProvider";
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
    return(
        <div>
            
            <h1 >Lobby</h1>
            <video className="backVideo" autoPlay loop muted>
  <source src={backVideo} type="video/mp4" />
</video>

            <form onSubmit={handleSubmitForm}>
                <label htmlFor="email">Email ID</label>
                <input type="email"  id="email" value={email} onChange={(e)=>{
                    setEmail(e.target.value);
                }}/>
                <br/>
                <label htmlFor="room">Roomno</label>
                <input type="text"  id="room" value={room} onChange={(e)=>{
                    setRoom(e.target.value);
                }}/>
                <br/>
                <button type="submit" >join</button>
            </form>
        </div>
    )
}

export default LobbyScreen;