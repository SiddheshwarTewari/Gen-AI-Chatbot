// API Management Functions

// Function to test API connection
async function testApiConnection(apiKey) {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 5,
            stream: false
        })
    });
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
}

// Function to call DeepSeek API
async function callDeepSeekAPI(userMessage) {
    const startTime = Date.now();
    
    try {
        // Show typing indicator
        const typingIndicator = showTypingIndicator();
        
        // Add user message to conversation history
        conversationHistory.push({ role: "user", content: userMessage });
        
        // Make API request to DeepSeek
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: conversationHistory,
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        
        updateMetrics(responseTime);
        
        // Remove typing indicator
        if (document.getElementById('typingIndicator')) {
            document.getElementById('typingIndicator').remove();
        }
        
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling DeepSeek API:", error);
        const responseTime = Date.now() - startTime;
        updateMetrics(responseTime);
        
        // Remove typing indicator
        if (document.getElementById('typingIndicator')) {
            document.getElementById('typingIndicator').remove();
        }
        
        throw error;
    }
}