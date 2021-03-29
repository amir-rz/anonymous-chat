// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormBtn = $messageForm.querySelector("button");
const $geoBtn = document.querySelector("#get-geo");
const $messages = document.querySelector("#messages");
const $userName = `anonymous${Math.floor(Math.random() * 10000000)}`;

// Message template
const messageTemplate = (data, type, className, me, username) => {
  const $username = document.createElement(type);
  const $createdAt = document.createElement("p");
  const $info = document.createElement("div");
  const $messageBox = document.createElement("div");

  const $message = document.createElement(data.isLink ? "a" : type);
  if (type === "a" || data.isLink) {
    $message.setAttribute("href", data.text);
    $message.setAttribute("target", "_blank");
  }

  if (className) {
    $message.className = className;
  }
  // Username
  $username.className = "username";
  $username.textContent = username;

  // Time
  $createdAt.className = "sent-at";
  const date = new Date();
  $createdAt.textContent = `${date.getHours()}:${date.getMinutes()}`;

  // Info (Username , Time)
  $username.value = username;
  $info.className = "info";
  $info.appendChild($createdAt);
  $info.appendChild($username);
  // Message
  $message.textContent = data.text || data;

  // MessageBox
  $messageBox.className = `message-box`;
  if (me) {
    $messageBox.className = `message-box me`;
  }
  $messageBox.appendChild($info);
  $messageBox.appendChild($message);

  return $messageBox;
};

const roomName = JSON.parse(document.getElementById("room-name").textContent);
var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
const chatSocket = new WebSocket(
  ws_scheme + "://" + window.location.host + "/ws/chat/" + roomName + "/"
);

chatSocket.onmessage = function (e) {
  // const data = JSON.parse(e.data);
  const data = JSON.parse(e.data);
  console.log(e);
  const message = data.message;
  console.log(data.username == $userName);
  if (data.username !== $userName) {
    $messages.appendChild(
      messageTemplate(message, "p", "message", false, data.username)
    );
  }
};

chatSocket.onclose = function (e) {
  console.error("Chat socket closed unexpectedly");
};

// Sending message by Enter
$messageFormInput.onkeyup = function (e) {
  if (e.keyCode === 13) {
    $messageFormBtn.click();
  }
};
// Sending message
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = $messageFormInput.value;
  if (message.length > 0) {
    // Logic
    chatSocket.send(
      JSON.stringify({
        message: message,
        username: $userName,
      })
    );
    // UI
    $messages.appendChild(
      messageTemplate(message, "p", "message", true, $userName)
    );
    $messages.scrollTo(0, $messages.scrollHeight);
  }
  // ----
  // ----

  $messageFormInput.value = "";
  $messageFormInput.focus();
  $messages.scrollTo(0, $messages.scrollHeight);
});
