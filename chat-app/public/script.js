const socket = io();
const date = new Date();

// Get rooms

let roomCount = { 
    "-1": 0
};
socket.on("publicRoom", (id, name) => {
    const room = document.createElement("room");
    room.setAttribute("onclick", `joinRoom(${id})`);
    room.setAttribute("id", `room${id}`);
    room.innerHTML = `
    <img src="https://picsum.photos/20${id}">
    <container>
        <name>${name}</name>
        <sub-title id="sub${id}" count="0"> people online</sub-title>
    </container>
    `;
    leftBar.appendChild(room);
    roomCount[id] = 0;
});

// Join room
let currentRoom = -1;

function joinRoom(room){
    if(room != currentRoom){
        //clear chat
        chat.innerHTML = "";

        //update users in room bar
        inRoom.innerHTML = "";
        inRoom.classList.remove("hidden");
        for(let i = 0; i < users.length; i++){
            if(users[i].room == room){
                newUserInRoom(users[i]);
            }
        }

        //communicate room change to server
        socket.emit("joinRoom", room, false);
        
        //update style
        if(currentRoom != -1){
            document.getElementById(`room${currentRoom}`).classList.remove("active");
        }
        document.getElementById(`room${room}`).classList.add("active");
        currentRoom = room;
    }
}

const inRoom = document.getElementById("in-room");
const online = document.getElementById("online");
let users = [];

// Get users
socket.on("user", (user) => {
    users.push(user);
    const userElement = document.createElement("user");
    userElement.setAttribute("onclick", `chatTo("${user.id}", "${user.name}")`);
    userElement.setAttribute("id", `${user.id}`);
    userElement.setAttribute("room", `${user.room}`);
    userElement.innerHTML = `
    <name>${user.name}</name>
    `;
    online.appendChild(userElement);

    //update count
    roomCount[user.room]++;
    document.getElementById(`sub${user.room}`).setAttribute("count", roomCount[user.room]);
});

// Remove users
socket.on("userLeave", (user) =>{
    online.removeChild(document.getElementById(`${user.id}`)); // fix online tab

    // fix in-room tab
    if(users.find(u => u.id === user.id).room == currentRoom){ // if user left current room
        inRoom.removeChild(document.getElementById(`inroom+${user.id}`));
    }

    roomCount[user.room]--;
    if(document.getElementById(`sub${user.room}`)){
        document.getElementById(`sub${user.room}`).setAttribute("count", roomCount[user.room]);
    }

    users = users.filter(u => u.id !== user.id);
});

// User change
socket.on("userChange", user => {
    document.getElementById(user.id).setAttribute("room", user.room); // fix online tab
    // fix in-room tab
    if(users.find(u => u.id === user.id).room == currentRoom && currentRoom != -1){ // if user left current room
        inRoom.removeChild(document.getElementById(`inroom+${user.id}`));
    }
    if(user.room == currentRoom){
        newUserInRoom(user);
    }

    //update count
    if(users.find(u => u.id === user.id).room != "private"){
        roomCount[users.find(u => u.id === user.id).room]--;
        document.getElementById(`sub${users.find(u => u.id === user.id).room}`).setAttribute("count", roomCount[users.find(u => u.id === user.id).room]);    
    }
    
    if(user.room != "private"){
        roomCount[user.room]++;
        document.getElementById(`sub${user.room}`).setAttribute("count", roomCount[user.room]);
    }

    //fix userlist variable
    users = users.filter(u => u.id !== user.id);
    users.push(user);

});

function newUserInRoom(user){
    const userElement = document.createElement("user");
    userElement.setAttribute("onclick", `chatTo("${user.id}", "${user.name}")`);
    userElement.setAttribute("id", `inroom+${user.id}`);
    userElement.innerHTML = `
    <name>${user.name}</name>
    `;
    inRoom.appendChild(userElement);
}

// New private chat
socket.on("privateRoom", (id, name) => {
    const room = document.createElement("room");
    room.setAttribute("onclick", `joinPrivate("${id}")`);
    room.setAttribute("id", `room${id}`);
    room.classList.add("private");
    room.classList.add("new");
    room.innerHTML = `
    <img src="https://picsum.photos/209">
    <container>
        <name>${name}</name>
    </container>
    `;
    leftBar.appendChild(room);
});

function chatTo(id, name){
    socket.emit("privateMessage", id, name);
}

function joinPrivate(room){
    if(room != currentRoom){
        //clear chat
        chat.innerHTML = "";

        //update users in room bar
        inRoom.innerHTML = "";
        inRoom.classList.add("hidden");
        for(let i = 0; i < users.length; i++){
            if(users[i].room == room){
                newUserInRoom(users[i]);
            }
        }

        //communicate room change to server
        socket.emit("joinRoom", room, true);
        
        //update style
        if(currentRoom != -1){
            document.getElementById(`room${currentRoom}`).classList.remove("active");
        }
        document.getElementById(`room${room}`).classList.add("active");
        document.getElementById(`room${room}`).classList.add("new");
        currentRoom = room;
    }
}

var username = "";
// Login submit
document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault(); // prevent reload
    login();
    username = document.getElementById("username").value;
    socket.emit("join", username);
});

// Message IN/OUT/NEUTRAL
const chat = document.getElementById("chat");

// Message IN
socket.on("messageIn", message => {
    addMessageIn(message);
})

function addMessageIn(message){
    const bubble = document.createElement("bubble");
    bubble.classList.add("in");
    bubble.innerHTML = `
    <name>${message.username}</name>
    <p>
        ${message.text}
    </p>
    <time>${message.time}</time>
    `;
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
}

// Message NEUTRAL
socket.on("messageNeutral", message => {
    console.log(message);
    addMessageNeutral(message);
})

function addMessageNeutral(message){
    const bubble = document.createElement("bubble");
    bubble.classList.add("neutral");
    bubble.innerHTML = `
    <p>
        ${message}
    </p>
    `;
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
}

// Message OUT

// Submit message on enter
var msg = "";
document.getElementById("concept").addEventListener("keypress", submitOnEnter);
function submitOnEnter(event){
    if(event.which === 13){ // if enter
        if(!event.shiftKey){ // shift + enter reserved for newline
            msg = event.target.value.trim();
            event.target.value = "";
            event.target.form.dispatchEvent(new Event("submit", {cancelable: true})); // create submit event, catchable by eventlistener
            event.target.dispatchEvent(new Event("input")); //trigger resize
            event.preventDefault(); // prevent newline
        }
    }
}

// Submit message
document.getElementById("chat-form").addEventListener("submit", (event) => {
    event.preventDefault(); // prevent reload
    if(msg != ""){
        addMessageOut(msg);
        socket.emit("chatMessage", msg);
    }
});

function addMessageOut(message){
    const bubble = document.createElement("bubble");
    bubble.classList.add("out");
    bubble.innerHTML = `
    <p>
        ${message}
    </p>
    <time>${("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2)}</time>
    `;
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
}


// Multi line msg iput
const msgInput = document.getElementById("msgContainer");

// 
document.getElementById("concept").addEventListener("input", () => {
    msgInput.setAttribute("data-value",event.target.value + ".");
});

// main resize on arrival of sidebar
const leftBar = document.getElementById("left-bar");
const rightBar = document.getElementById("right-bar");
const main = document.getElementById("main");
const logIn = document.getElementById("login");
const input = document.getElementById("input");

function login(){
    leftBar.classList.remove("hidden");
    rightBar.classList.remove("hidden");
    main.classList.remove("wide");
    logIn.classList.add("hidden");
    chat.classList.remove("hidden");
    input.classList.remove("hidden");
}