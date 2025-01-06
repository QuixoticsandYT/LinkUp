const socket = io(); // Initialize socket.io

// Get elements
const userIdDisplay = document.getElementById('userId');
const addFriendInput = document.getElementById('addFriendInput');
const addFriendBtn = document.getElementById('addFriendBtn');
const friendList = document.getElementById('friendList');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const messagesContainer = document.getElementById('messagesContainer');
const chatWithText = document.getElementById('chatWith');

// Variable to store the ID of the friend you're chatting with
let currentFriend = '';

// Display your ID when the server sends it
socket.on('your_id', (id) => {
  userIdDisplay.textContent = `Your ID: ${id}`;
});

// Listen for updates to the friend list
socket.on('friend_list', (friends) => {
  friendList.innerHTML = ''; // Clear current list
  friends.forEach(friend => {
    const li = document.createElement('li');
    li.textContent = friend;
    li.addEventListener('click', () => {
      startChatWithFriend(friend);
    });
    friendList.appendChild(li);
  });
});

// Add friend functionality
addFriendBtn.addEventListener('click', () => {
  const friendId = addFriendInput.value.trim();
  if (friendId) {
    socket.emit('add_friend', friendId);
    addFriendInput.value = ''; // Clear the input field
  }
});

// Send message to the friend
sendMessageBtn.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message && currentFriend) {
    socket.emit('send_message', { to: currentFriend, message });
    messageInput.value = ''; // Clear the message input
  }
});

// Listen for incoming messages and display them
socket.on('receive_message', (messageData) => {
  if (messageData.to === currentFriend || messageData.from === currentFriend) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    if (messageData.from === currentFriend) {
      messageElement.classList.add('from-friend');
    } else {
      messageElement.classList.add('from-me');
    }

    messageElement.innerHTML = `<span class="message-bubble">${messageData.message}</span>`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
  }
});

// Start chat with selected friend
function startChatWithFriend(friendId) {
  currentFriend = friendId;
  chatWithText.textContent = `Chatting with ${friendId}`;
  messagesContainer.innerHTML = ''; // Clear previous chat messages
}

