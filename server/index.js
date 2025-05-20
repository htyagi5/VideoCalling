const  {Server}=require('socket.io');

const io=new Server(4000,{
    cors:true,
}
);
const emailtoSocketIdMap=new Map()
const socketIdtoemailMap=new Map();
io.on('connection',(socket)=>{
    console.log('socket connected:',socket.id);
    socket.on("join:room",(data)=>{
       const{email,room}=data;
       emailtoSocketIdMap.set(email,socket.id);
       socketIdtoemailMap.set(socket.id,email);
       io.to(room).emit('user:joined',{email,id:socket.id})
         socket.join(room);   
       io.to(socket.id).emit('join:room',data)  
    })
    socket.on('call:user',({to,offer})=>{
        io.to(to).emit("incoming:call",{from:socket.id,offer});
    })
    socket.on("call:accepted",({to,answer})=>{
        io.to(to).emit("call:accepted",{from:socket.id,answer});
    })
    socket.on("peer:nego:needed",({to,offer})=>{
        io.to(to).emit("peer:nego:needed",{from:socket.id,offer});
    })

    socket.on("peer:nego:done",({to,answer})=>{
        io.to(to).emit("peer:nego:final",{from:socket.id,answer});
    })
})

