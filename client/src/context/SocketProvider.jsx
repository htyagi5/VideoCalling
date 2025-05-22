import {io} from "socket.io-client";

import React,{createContext, useMemo,useContext} from "react";

const SocketContext=createContext(null);

export const useSocket=()=>{
    const socket=useContext(SocketContext);
    return socket;
}
export const SocketProvider=(props)=>{
const socket = useMemo(() => io("https://videocalling-1-0u1k.onrender.com"), []);
    return(
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}
