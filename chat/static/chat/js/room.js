// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormBtn = $messageForm.querySelector("button");
const $geoBtn = document.querySelector("#get-geo");
const $messages = document.querySelector("#messages");
// const $userName = `anonymos${Math.random()*10000000}`

// Message template
const messageTemplate = (data, type, className, me = false) => {
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

  // Time
  $createdAt.className = "sent-at";
  const date = new Date();
  $createdAt.textContent = `${date.getHours()}:${date.getMinutes()}`;

  // Info (Username , Time)
  $info.className = "info";
  $info.appendChild($createdAt);

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

const chatSocket = new WebSocket(
  "ws://" + window.location.host + "/ws/chat/" + roomName + "/"
);

chatSocket.onmessage = function (e) {
  // const data = JSON.parse(e.data);
  console.log(e.data);
  const data = JSON.parse(e.data);

  const message = data.message;
  $messages.appendChild(messageTemplate(message, "p", "message", true));
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
      })
    );
    // UI
    $messages.appendChild(messageTemplate(message, "p", "message", false));
    $messages.scrollTo(0, $messages.scrollHeight);
  }

  // ----
  // ----

  $messageFormInput.value = "";
  $messageFormInput.focus();
  $messages.scrollTo(0, $messages.scrollHeight);
});
