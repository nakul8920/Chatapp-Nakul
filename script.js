// DOM Elements
const loginSection = document.getElementById('loginSection');
const chatSection = document.getElementById('chatSection');
const userInfo = document.getElementById('userInfo');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const connectionInfo = document.getElementById('connectionInfo');

let currentUser = '';
let peer = null;
let conn = null;

// Function to generate a random string for peer ID
function generatePeerId() {
    return 'user-' + Math.random().toString(36).substr(2, 9);
}

// Function to initialize peer connection
function initializePeer() {
    // Create a new peer with random ID
    peer = new Peer(generatePeerId());

    peer.on('open', (id) => {
        connectionInfo.innerHTML = `Your ID: ${id}<br>Share this ID with your friend to chat!`;
    });

    peer.on('connection', (connection) => {
        conn = connection;
        setupConnection();
        connectionInfo.textContent = 'Friend connected!';
    });

    peer.on('error', (err) => {
        connectionInfo.textContent = `Error: ${err.type}`;
    });
}

// Function to connect to another peer
function connectToPeer() {
    const peerId = prompt('Enter your friend\'s ID to connect:');
    if (peerId) {
        conn = peer.connect(peerId);
        setupConnection();
    }
}

// Setup connection handlers
function setupConnection() {
    conn.on('open', () => {
        connectionInfo.textContent = 'Connected to friend!';
    });

    conn.on('data', (data) => {
        displayMessage(data, false);
    });

    conn.on('close', () => {
        connectionInfo.textContent = 'Connection closed';
    });
}

// Function to login
function login() {
    const username = document.getElementById('username').value.trim();
    
    if (username) {
        currentUser = username;
        loginSection.classList.add('hidden');
        chatSection.classList.remove('hidden');
        userInfo.textContent = `Chatting as: ${username}`;
        
        // Initialize peer connection
        initializePeer();
        
        // Add connect button after login
        const connectButton = document.createElement('button');
        connectButton.textContent = 'Connect to Friend';
        connectButton.onclick = connectToPeer;
        document.querySelector('.chat-header').appendChild(connectButton);
    } else {
        alert('Please enter a username!');
    }
}

// Function to send message
function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText && currentUser && conn && conn.open) {
        const message = {
            text: messageText,
            sender: currentUser,
            timestamp: new Date().toISOString()
        };

        conn.send(message);
        displayMessage(message, true);
        messageInput.value = '';
    }
}

// Function to display a message
function displayMessage(message, isSent) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isSent ? 'sent' : 'received');
    
    messageElement.innerHTML = `
        <div class="name">${message.sender}</div>
        <div class="text">${message.text}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Listen for Enter key in message input
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});