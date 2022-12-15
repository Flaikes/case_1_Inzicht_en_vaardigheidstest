const socket = io();
const date = new Date();

// Get rooms
socket.on("publicRoom", (id, name, count) => {
    const room = document.createElement("room");
    room.setAttribute("onclick", `joinRoom(${id})`);
    room.setAttribute("id", `room${id}`);
    room.innerHTML = `
    <img src="https://picsum.photos/20${id}">
    <container>
        <name>${name}</name>
        <sub-title id="sub${id}" count="${count}"> people online</sub-title>
    </container>
    `;
    leftBar.appendChild(room);
});

// Join room
var currentRoom = -1;

function joinRoom(room){
    if(room != currentRoom){
        //clear chat
        chat.innerHTML = "";
        rightBar.innerHTML = "";
        rightBar.classList.remove("hidden");
        main.classList.remove("halfWide");

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

// Get users
socket.on("user", (user) => {
    if(user.room ==  currentRoom){
        const userElement = document.createElement("user");
        userElement.setAttribute("onclick", `chatTo("${user.id}", "${user.name}")`);
        userElement.setAttribute("id", `${user.id}`);
        userElement.classList.add("in");
        userElement.innerHTML = `
        <name>${user.name}</name>
        `;
        rightBar.appendChild(userElement);
    }
});

// Remove users
socket.on("removeUser", (user) =>{
    if(currentRoom != -1){
        if(user.room == currentRoom){
            rightBar.removeChild(document.getElementById(user.id));
        }
    }
});

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
        rightBar.classList.add("hidden");
        main.classList.add("halfWide");

        //communicate room change to server
        socket.emit("joinRoom", room, true);
        
        //update style

        if(currentRoom != -1){
            document.getElementById(`room${currentRoom}`).classList.remove("active");
        }
        document.getElementById(`room${room}`).classList.add("active");
        document.getElementById(`room${room}`).classList.remove("new");
        currentRoom = room;
    }
}

// Update user count
socket.on("newCount", (id, count) => {
    console.log("newCount", count, id);
    document.getElementById(`sub${id}`).setAttribute("count", count);
});

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