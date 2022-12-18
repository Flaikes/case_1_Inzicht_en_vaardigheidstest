const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

// Rooms
class room{
    constructor(id, name){
        this.id = id;
        this.name = name;
    }
}

const rooms = [];
let roomIdIncr = 0;
addRoom("YouTube");
addRoom("Netflix");
addRoom("stack<b>overflow</b>");
addRoom("Advent of Code");
const privateRooms = [];

let users = [];

// Client/server connections
io.on("connection", socket =>{

    var user = {
        id: socket.id,
        name: "",
        room: -1
    };

    // On login
    socket.on("join", username_ => {
        user = userJoin(user.id, username_, -1);

        // To user welcome instruction
        socket.emit("messageIn", formatMessage("Mchat*", `<br>Hey, ${user.name}!<br>Select a room to start chatting! &#128512; &#128525; &#128151;<br><br>`));
        
        // Show rooms
        for( let i = 0; i < rooms.length; i++){
            socket.emit("publicRoom", rooms[i].id, rooms[i].name)
        }

        // Show users
        for( let i = 0; i < users.length; i++){
            socket.emit("user", users[i]);
        }

        // Show self to users
        socket.broadcast.emit("user", user);
    })

    // On join room
    var prevRoomIsPrivate = false;
    socket.on("joinRoom", (room, private) => {

        // Leave previous room
        if(user.room != -1){
            // To room that was left
            socket.broadcast.to(user.room).emit("messageNeutral", `${user.name} left chat`);

            socket.leave(user.room);
        }

        // To everyone show change
        if(private){ 
            user.room = "private"; 
            io.emit("userChange", user);
        }else{
            user.room = room;
            io.emit("userChange", user);
        }
        
        // Join new room
        socket.join(user.room);

        // To everyone but that user
        socket.broadcast.to(user.room).emit("messageNeutral", `${user.name} joined chat`); 
        
        // To the user
        socket.emit("messageNeutral", `Welcome ${user.name}!`);
    });

    // On chatmessage
    socket.on("chatMessage", message => {
        socket.broadcast.to(user.room).emit("messageIn", formatMessage(user.name, message));
    });

    // On private message
    socket.on("privateMessage", (id, name) => {

        if(privateRooms.includes(`${id}&${user.id}`) == false       // If not already chatting
           && privateRooms.includes(`${user.id}&${id}`) == false    // 
           && id != user.id){                                       // and not trying to message self

            socket.emit("privateRoom", `${id}&${user.id}`, name);
            io.to(id).emit("privateRoom", `${id}&${user.id}`, user.name);
            privateRooms.push(`${id}&${user.id}`);
            console.log(id, name);
        }
    });

    // On user disconnect
    socket.on("disconnect", () => {

        // To room
        io.to(user.room).emit("messageNeutral", `${user.name} left chat`);

        io.emit("userLeave", user);
    
        userLeave(user.id);
    });
})

const PORT = 3000 || process.env.PORT;

let date = new Date();
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

function formatMessage(username, text){
    return{
        username,
        text,
        time: ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2)
    } 
}

function userJoin(id, name, room){
    const user = {id, name, room};
    console.log("NEW USER", user);
    users.push(user);

    return user;
}

function userLeave(id){
    users = users.filter(user => user.id !== id);
}

function addRoom(name){
    rooms.push(new room(roomIdIncr, name));
    roomIdIncr++;
}