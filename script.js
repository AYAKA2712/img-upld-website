const ws = new WebSocket("wss://sprw-img.onrender.com");

ws.onopen = () => console.log("Connected to server");

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const chatBox = document.getElementById("chat-box");

    if (data.type === "history") {
        chatBox.innerHTML = "";
        data.messages.forEach(msg => addMessage(msg.username, msg.message, msg.image, msg.timestamp));
    } else if (data.type === "chat" || data.type === "image" || data.type === "location") {
        addMessage(data.username, data.message, data.image, data.timestamp);
    }
};

function sendMessage() {
    const username = document.getElementById("username").value;
    const message = document.getElementById("message").value;

    if (username && message) {
        ws.send(JSON.stringify({ type: "chat", username, message }));
        document.getElementById("message").value = "";
    }
}

// Send Image
function sendImage() {
    const username = document.getElementById("username").value;
    const fileInput = document.getElementById("imageInput");

    if (username && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const base64Image = event.target.result;

            ws.send(JSON.stringify({ type: "image", username, image: base64Image }));
            fileInput.value = ""; // Clear file input after sending
        };

        reader.readAsDataURL(file);
    }
}
function shareLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const username = document.getElementById("username").value;
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const locationURL = `https://www.google.com/maps?q=${latitude},${longitude}`;

        ws.send(JSON.stringify({ type: "location", username, message: locationURL }));
    }, () => {
        alert("Unable to retrieve your location.");
    });
}

function addMessage(username, message, image, timestamp) {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");

    messageElement.classList.add("message");
    if (username === document.getElementById("username").value) {
        messageElement.classList.add("user-message");
    } else {
        messageElement.classList.add("other-message");
    }

    const time = timestamp ? new Date(timestamp).toLocaleTimeString() : "";
    let messageContent = `<strong>${username}:</strong> `;

    if (message.includes("https://www.google.com/maps?q=")) {
        messageContent += `<a href="${message}" target="_blank">📍 View Location</a>`;
    } else {
        messageContent += `${message}`;
    }

    if (time) {
        messageContent += ` <span class="timestamp">(${time})</span>`;
    }

    messageElement.innerHTML = messageContent;

    if (image) {
        const imgElement = document.createElement("img");
        imgElement.src = image;
        imgElement.classList.add("chat-image");
        messageElement.appendChild(imgElement);
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}
