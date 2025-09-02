// UI Management Functions

// Function to add a message to the chat
function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
    
    const now = new Date();
    const timeString = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    
    messageDiv.innerHTML = `
        <div>${text}</div>
        <div class="message-timestamp">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to conversation history
    conversationHistory.push({
        role: isUser ? "user" : "assistant",
        content: text
    });
}

// Function to show typing indicator
function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.id = 'typingIndicator';
    typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingIndicator;
}

// Function to update metrics
function updateMetrics(responseTime) {
    requestCount++;
    totalResponseTime += responseTime;
    const avgResponseTime = Math.round(totalResponseTime / requestCount);
    
    document.querySelectorAll('.metric-value')[0].textContent = requestCount;
    document.querySelectorAll('.metric-value')[1].textContent = avgResponseTime + 'ms';
    
    // Update bars
    requestsBar.style.width = Math.min(requestCount * 10, 100) + '%';
    responseBar.style.width = Math.min(avgResponseTime / 20, 100) + '%';
}

// Show error message
function showError(message) {
    // Remove any existing error message
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    document.getElementById('apiConfig').appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Set up event listeners for UI elements
function setupUIEventListeners() {
    // Connect to DeepSeek API
    connectButton.addEventListener('click', function() {
        apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showError("Please enter a valid DeepSeek API key");
            return;
        }
        
        if (!apiKey.startsWith('sk-')) {
            showError("API key should start with 'sk-'");
            return;
        }
        
        // Test the API key with a simple request
        connectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing Connection...';
        
        testApiConnection(apiKey)
            .then(() => {
                // API key is valid
                apiStatus.textContent = "API Connected";
                apiStatusText.textContent = "API Connected";
                apiStatusText.parentElement.className = "api-status connected";
                apiStatusText.parentElement.innerHTML = '<i class="fas fa-check-circle"></i> API Connected';
                
                // Enable chat input
                messageInput.disabled = false;
                messageInput.placeholder = "Type your message here...";
                sendButton.disabled = false;
                
                // Show disconnect button
                disconnectButton.style.display = 'block';
                connectButton.style.display = 'none';
                
                // Clear API key input for security
                apiKeyInput.value = '';
                apiKeyInput.disabled = true;
                
                // Add connected message
                addMessage("DeepSeek API connected successfully! How can I assist you today?", false);
            })
            .catch(error => {
                showError("Failed to connect to DeepSeek API. Please check your API key.");
                console.error("API connection error:", error);
            })
            .finally(() => {
                connectButton.innerHTML = '<i class="fas fa-plug"></i> Connect to DeepSeek';
            });
    });
    
    // Disconnect from DeepSeek API
    disconnectButton.addEventListener('click', function() {
        // Clear API key
        apiKey = '';
        
        // Reset UI
        apiStatus.textContent = "API Not Connected";
        apiStatusText.textContent = "API Not Connected";
        apiStatusText.parentElement.className = "api-status disconnected";
        apiStatusText.parentElement.innerHTML = '<i class="fas fa-times-circle"></i> API Not Connected';
        
        // Disable chat input
        messageInput.disabled = true;
        messageInput.placeholder = "Enter your DeepSeek API key first";
        sendButton.disabled = true;
        
        // Show connect button
        disconnectButton.style.display = 'none';
        connectButton.style.display = 'block';
        
        // Enable API key input
        apiKeyInput.disabled = false;
        apiKeyInput.value = '';
        
        // Add disconnected message
        addMessage("Disconnected from DeepSeek API. Your API key has been cleared from memory.", false);
    });
    
    // Toggle API key visibility
    toggleApiKey.addEventListener('click', function() {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleApiKey.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            apiKeyInput.type = 'password';
            toggleApiKey.innerHTML = '<i class="fas fa-eye"></i>';
        }
    });
    
    // Reset the entire application
    resetApp.addEventListener('click', function() {
        if (confirm("Reset the application? This will clear all conversation history and API key.")) {
            window.location.reload();
        }
    });
    
    // Event listener for send button
    sendButton.addEventListener('click', async function() {
        const message = messageInput.value.trim();
        
        if (message) {
            // Add user message
            addMessage(message, true);
            messageInput.value = '';
            
            try {
                // Get and add AI response
                const response = await callDeepSeekAPI(message);
                addMessage(response, false);
            } catch (error) {
                addMessage("Sorry, I encountered an error processing your request. Please check your API key and try again.", false);
                console.error("API Error:", error);
            }
        }
    });
    
    // Allow sending message with Enter key
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
}

// Initialize UI elements
function initUI() {
    // Set initial timestamp
    const now = new Date();
    const timeString = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    document.getElementById('initialTimestamp').textContent = timeString;
    
    // Clear any potentially stored API keys on page load
    if (localStorage.getItem('deepseekApiKey')) {
        localStorage.removeItem('deepseekApiKey');
    }
    
    // Clear any session storage as well
    if (sessionStorage.getItem('deepseekApiKey')) {
        sessionStorage.removeItem('deepseekApiKey');
    }
    
    // Warn user before leaving the page
    window.addEventListener('beforeunload', function(e) {
        if (apiKey) {
            const message = 'Your API key will be cleared when you leave this page.';
            e.returnValue = message;
            return message;
        }
    });
    
    // Animate metric bars on page load
    document.querySelectorAll('.metric-fill').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
}