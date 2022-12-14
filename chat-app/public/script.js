const socket = io();

socket.on("message", message => {
    console.log(message);
})

// main resize on arrival of sidebar
const sideBar = document.getElementById("side-bar")
const main = document.getElementById("main")

function wideMain(){
    sideBar.classList.remove("hidden");
    main.classList.remove("wide");
}

// multi line msg iput
var msg = "";
const msgInput = document.getElementById("msgContainer");
document.getElementById("concept").addEventListener("keypress", submitOnEnter);

// 
document.getElementById("concept").addEventListener("input", () => {
    msgInput.setAttribute("data-value",event.target.value + ".");
});

// Submit message on enter
function submitOnEnter(event){
    if(event.which === 13){ // if enter
        if(!event.shiftKey){ // shift + enter reserved for newline
            msg = event.target.value.trim();
            event.target.value = "";
            event.target.form.dispatchEvent(new Event("submit", {cancelable: true})); // create submit event, catchable by eventlistener
            event.preventDefault(); // prevent newline
        }
    }
}

// Submit message
document.getElementById("chat-form").addEventListener("submit", (event) => {
    event.preventDefault(); // prevent reload
    if(msg != ""){
        socket.emit("chatMessage", msg);
    }
});