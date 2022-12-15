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
    users = [];
    constructor(id, name){
        this.id = id;
        this.name = name;
    }
}

var rooms = [];
addRoom(0, "YouTube");
addRoom(1, "Netflix");
addRoom(2, "stack<b>overflow</b>");
addRoom(3, "Advent of Code");

// Client/server connections
io.on("connection", socket =>{

    var user = {
        id: socket.id,
        name: "",
        room: -1
    };

    var privateRooms = [];

    // On login
    socket.on("join", username_ => {
        user = userJoin(user.id, username_, -1);

        // To user 
        socket.emit("messageIn", formatMessage("Mchat*", `<br>Hey, ${user.name}!<br>Select a room to start chatting! &#128512; &#128525; &#128151;<br><br>`));
        
        // Show rooms
        for( let i = 0; i < rooms.length; i++){
            socket.emit("publicRoom", rooms[i].id, rooms[i].name, rooms[i].users.length)
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

            if(!prevRoomIsPrivate){
                socket.leave(user.room);

                // Update everyone's userlist
                io.emit("removeUser", user);

                // Remove user from rooms[x]
                const oldRoomIndex = rooms.findIndex( r => r.id === user.room);
                rooms[oldRoomIndex].users = rooms[oldRoomIndex].users.filter( u => u.id !== user.id);
                // Update count
                io.emit("newCount", user.room, rooms[oldRoomIndex].users.length);
            }
        }

        if(private){
            prevRoomIsPrivate = true;
        }else{
            prevRoomIsPrivate = false;
        }

        // Join new room
        user.room = room;
        socket.join(user.room);
        if(!private){
            rooms.find( r => r.id === room).users.push(user);
            io.emit("newCount", user.room, rooms.find( r => r.id === room).users.length);

            // Show users
            const tempUsers = rooms.find( r => r.id === room).users;
            for( let i = 0; i < tempUsers.length; i++){
                socket.emit("user", tempUsers[i]);
            }

            // Show to users
            socket.broadcast.emit("user", user);
        }

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
        if(privateRooms.includes(`${id}&${user.id}`) == false
           && privateRooms.includes(`${user.id}&${id}`) == false
           && id != user.id){ // If not already chatting 
            socket.emit("privateRoom", `${id}&${user.id}`, name);
            io.to(id).emit("privateRoom", `${id}&${user.id}`, user.name);
            privateRooms.push(`${id}&${user.id}`);
            console.log(id, name);
        }
    });

    // On user disconnect, to everyone
    socket.on("disconnect", () => {
        io.to(user.room).emit("messageNeutral", `${user.name} left chat`);

        io.emit("removeUser", user);
    
        // Leave last room
        if(user.room != -1){
            // To room that was left
            socket.broadcast.to(user.room).emit("messageNeutral", `${user.name} left chat`);

            socket.leave(user.room);

            // Remove user from rooms[x]
            if(!prevRoomIsPrivate){
                const oldRoomIndex = rooms.findIndex( r => r.id === user.room);
                rooms[oldRoomIndex].users = rooms[oldRoomIndex].users.filter( u => u.id !== user.id);
            }
        }
        users = users.filter( u => u.id !== user.id);
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

let users = [];

function userJoin(id, name, room){
    const user = {id, name, room};
    console.log("NEW USER", user);
    users.push(user);

    return user;
}

function getUser(id){
    return users.find(user => user.id === id);
}

function addRoom(id, name){
    rooms.push(new room(id, name));
}