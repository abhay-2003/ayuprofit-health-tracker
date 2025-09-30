// Chatbot Core
class FitnessAssistant {
    constructor() {
        this.context = {
            lastMessage: null,
            conversation: [],
            userProfile: null,
            currentTopic: null
        };
        
        // Initialize the chatbot when constructed
        this.initialize();
        
        // Bind event handlers
        this.handleUserMessage = this.handleUserMessage.bind(this);
    }

    initialize() {
        // Set up event listeners for the chat interface
        const chatForm = document.getElementById('chat-form');
        if (chatForm) {
            chatForm.addEventListener('submit', this.handleUserMessage);
        }
    }

    handleUserMessage(event) {
        event.preventDefault();
        const messageInput = document.getElementById('chat-input');
        const message = messageInput.value.trim();
        
        if (message) {
            this.displayMessage('user', message);
            const response = this.processMessage(message);
            this.displayMessage('bot', response);
            messageInput.value = '';
        }
    }

    displayMessage(role, content) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = role === 'user' ? 'message user-message' : 'message bot-message';
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Topics the assistant can handle
        this.topics = {
            nutrition: ['food', 'meal', 'diet', 'eat', 'calorie', 'protein', 'carb', 'fat', 'macro'],
            exercise: ['workout', 'exercise', 'training', 'cardio', 'strength', 'run', 'lift'],
            goals: ['goal', 'target', 'aim', 'plan', 'achieve'],
            progress: ['progress', 'track', 'measure', 'improve', 'result'],
            health: ['health', 'wellness', 'lifestyle', 'habit', 'sleep'],
        };

        // Responses based on topics
        this.responses = {
            greeting: [
                "Hello! I'm your fitness assistant. How can I help you today?",
                "Hi there! Ready to work on your fitness goals?",
                "Welcome! What would you like to know about your fitness journey?"
            ],
            nutrition: {
                general: [
                    "Based on your profile, you should aim for {calories} calories per day.",
                    "Remember to maintain a balance of proteins, carbs, and healthy fats.",
                    "Would you like me to suggest some healthy meal options?"
                ],
                mealPlan: [
                    "Here's a healthy meal plan suggestion for your goals:",
                    "- Breakfast: {breakfast}",
                    "- Lunch: {lunch}",
                    "- Dinner: {dinner}",
                    "- Snacks: {snacks}"
                ]
            },
            exercise: {
                general: [
                    "Regular exercise is key to reaching your fitness goals.",
                    "Would you like a workout plan tailored to your goals?",
                    "Remember to mix cardio and strength training for best results."
                ],
                workoutPlan: [
                    "Here's a workout plan based on your goals:",
                    "{workoutPlan}"
                ]
            },
            goals: {
                general: [
                    "Setting realistic goals is important for success.",
                    "Let's break down your goals into achievable steps.",
                    "Would you like help setting specific fitness targets?"
                ],
                specific: [
                    "For {goal}, here's what we should focus on:",
                    "{recommendations}"
                ]
            },
            progress: {
                general: [
                    "You're making progress! Keep up the good work!",
                    "Let's review your progress and adjust your plan if needed.",
                    "Would you like to set new goals based on your progress?"
                ],
                specific: [
                    "Here's your progress report:",
                    "{progressReport}"
                ]
            },
            health: {
                general: [
                    "Remember that overall health involves nutrition, exercise, and rest.",
                    "Would you like tips for maintaining a healthy lifestyle?",
                    "Let's work on building sustainable healthy habits."
                ],
                tips: [
                    "Here are some health tips:",
                    "{healthTips}"
                ]
            },
            fallback: [
                "I'm not sure I understand. Could you rephrase that?",
                "Could you be more specific about what you'd like to know?",
                "I want to help, but I need more information. What aspect of fitness are you interested in?"
            ]
        };
    }

    // Process user message and generate response
    processMessage(message) {
        // Update context
        this.context.lastMessage = message;
        this.context.conversation.push({ role: 'user', content: message });

        // Determine message type and topic
        const topic = this.determineMessageTopic(message);
        this.context.currentTopic = topic;

        // Generate response based on topic
        let response = this.generateResponse(topic, message);

        // Update conversation history
        this.context.conversation.push({ role: 'assistant', content: response });

        return response;
    }

    // Determine the topic of the message
    determineMessageTopic(message) {
        const normalizedMessage = message.toLowerCase();

        // Check if it's a greeting
        if (this.isGreeting(normalizedMessage)) {
            return 'greeting';
        }

        // Check each topic's keywords
        for (const [topic, keywords] of Object.entries(this.topics)) {
            if (keywords.some(keyword => normalizedMessage.includes(keyword))) {
                return topic;
            }
        }

        return 'unknown';
    }

    // Check if message is a greeting
    isGreeting(message) {
        const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
        return greetings.some(greeting => message.includes(greeting));
    }

    // Generate appropriate response
    generateResponse(topic, message) {
        if (topic === 'greeting') {
            return this.getRandomResponse(this.responses.greeting);
        }

        if (this.responses[topic]) {
            // Get topic-specific response
            const topicResponses = this.responses[topic];

            if (this.isQuestion(message)) {
                // If it's a question, use general responses
                return this.getRandomResponse(topicResponses.general);
            } else {
                // For statements, check if we have specific response templates
                const hasSpecificTemplate = topicResponses.specific && this.canGenerateSpecificResponse(topic, message);
                if (hasSpecificTemplate) {
                    return this.generateSpecificResponse(topic, message);
                }
                // Fallback to general response
                return this.getRandomResponse(topicResponses.general);
            }
        }

        // Fallback response if topic unknown
        return this.getRandomResponse(this.responses.fallback);
    }

    // Check if message is a question
    isQuestion(message) {
        return message.includes('?') || 
               message.toLowerCase().startsWith('what') ||
               message.toLowerCase().startsWith('how') ||
               message.toLowerCase().startsWith('why') ||
               message.toLowerCase().startsWith('can') ||
               message.toLowerCase().startsWith('should');
    }

    // Get random response from array of possibilities
    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Check if we can generate a specific response
    canGenerateSpecificResponse(topic, message) {
        switch(topic) {
            case 'nutrition':
                return message.includes('meal plan') || message.includes('diet plan');
            case 'exercise':
                return message.includes('workout plan') || message.includes('training plan');
            case 'goals':
                return this.context.userProfile && this.context.userProfile.goal;
            case 'progress':
                return this.context.userProfile && this.context.conversation.length > 2;
            case 'health':
                return message.includes('tips') || message.includes('advice');
            default:
                return false;
        }
    }

    // Generate specific response based on topic and context
    generateSpecificResponse(topic, message) {
        let template = this.responses[topic].specific.join('\n');

        switch(topic) {
            case 'nutrition':
                return this.generateNutritionResponse(template);
            case 'exercise':
                return this.generateExerciseResponse(template);
            case 'goals':
                return this.generateGoalsResponse(template);
            case 'progress':
                return this.generateProgressResponse(template);
            case 'health':
                return this.generateHealthResponse(template);
            default:
                return this.getRandomResponse(this.responses[topic].general);
        }
    }

    // Generate nutrition-specific response
    generateNutritionResponse(template) {
        // Example meal plan
        const mealPlan = {
            breakfast: "Oatmeal with fruits and nuts (300 cal)",
            lunch: "Grilled chicken salad with quinoa (400 cal)",
            dinner: "Baked salmon with vegetables (500 cal)",
            snacks: "Greek yogurt with honey, handful of almonds (200 cal)"
        };

        return template
            .replace('{breakfast}', mealPlan.breakfast)
            .replace('{lunch}', mealPlan.lunch)
            .replace('{dinner}', mealPlan.dinner)
            .replace('{snacks}', mealPlan.snacks);
    }

    // Generate exercise-specific response
    generateExerciseResponse(template) {
        // Example workout plan
        const workoutPlan = [
            "1. 20 min cardio warm-up",
            "2. 3 sets of 12 squats",
            "3. 3 sets of 10 push-ups",
            "4. 3 sets of 10 dumbbell rows",
            "5. 15 min cool-down stretches"
        ].join('\n');

        return template.replace('{workoutPlan}', workoutPlan);
    }

    // Generate goals-specific response
    generateGoalsResponse(template) {
        const goal = this.context.userProfile?.goal || 'fitness';
        const recommendations = {
            'lose': [
                "1. Create a caloric deficit",
                "2. Increase cardio activity",
                "3. Maintain protein intake",
                "4. Get adequate rest"
            ],
            'gain': [
                "1. Increase caloric intake",
                "2. Focus on strength training",
                "3. Increase protein intake",
                "4. Allow recovery time"
            ],
            'maintain': [
                "1. Balance calories in/out",
                "2. Mix cardio and strength",
                "3. Maintain current habits",
                "4. Regular progress checks"
            ]
        }[goal] || ["Set specific, measurable goals", "Create a consistent routine", "Track your progress"];

        return template
            .replace('{goal}', goal)
            .replace('{recommendations}', recommendations.join('\n'));
    }

    // Generate progress-specific response
    generateProgressResponse(template) {
        // Example progress report
        const progressReport = [
            "- Workouts completed this week: 3",
            "- Average daily calories: 2000",
            "- Water intake goal met: 5/7 days",
            "- Progress towards goal: On track"
        ].join('\n');

        return template.replace('{progressReport}', progressReport);
    }

    // Generate health-specific response
    generateHealthResponse(template) {
        // Example health tips
        const healthTips = [
            "1. Stay hydrated (8 glasses of water daily)",
            "2. Get 7-8 hours of sleep",
            "3. Take regular movement breaks",
            "4. Practice stress management",
            "5. Maintain a balanced diet"
        ].join('\n');

        return template.replace('{healthTips}', healthTips);
    }

    // Update user profile
    updateUserProfile(profile) {
        this.context.userProfile = profile;
    }

    // Clear conversation history
    clearConversation() {
        this.context.conversation = [];
        this.context.lastMessage = null;
    }
}

// Create and export assistant instance
const fitnessAssistant = new FitnessAssistant();

// Handle sending messages
function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;

    // Add user message to chat
    addMessageToChat('user', message);

    // Get assistant response
    const response = fitnessAssistant.processMessage(message);

    // Add assistant response to chat
    addMessageToChat('assistant', response);

    // Clear input
    userInput.value = '';
}

// Add message to chat display
function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FitnessAssistant,
        fitnessAssistant
    };
}