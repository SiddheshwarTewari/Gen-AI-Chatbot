// Global variables
let apiKey = '';
let requestCount = 0;
let totalResponseTime = 0;
let conversationHistory = [
    { role: "system", content: "You are a helpful assistant with deep knowledge about AI, machine learning, and technology. Provide detailed and informative responses." }
];

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const apiKeyInput = document.getElementById('apiKeyInput');
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const toggleApiKey = document.getElementById('toggleApiKey');
const apiStatus = document.getElementById('apiStatus');
const apiStatusText = document.getElementById('apiStatusText');
const requestsBar = document.getElementById('requestsBar');
const responseBar = document.getElementById('responseBar');
const resetApp = document.getElementById('resetApp');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initUI();
    setupUIEventListeners();
});