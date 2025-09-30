// Initialize Bot State
class FitnessBot {
    constructor() {
        this.calculator = new FitnessCalculator();
        this.workouts = {
            'chest': ['Push-ups: 3x15', 'Bench Press: 3x10', 'Dips: 3x12'],
            'back': ['Pull-ups: 3x8', 'Rows: 3x12', 'Lat Pulldowns: 3x12'],
            'legs': ['Squats: 3x12', 'Lunges: 3x10/leg', 'Calf Raises: 3x20'],
            'arms': ['Bicep Curls: 3x12', 'Tricep Extensions: 3x12', 'Hammer Curls: 3x12'],
            'shoulders': ['Shoulder Press: 3x10', 'Lateral Raises: 3x12', 'Front Raises: 3x12'],
            'core': ['Crunches: 3x20', 'Plank: 3x30sec', 'Russian Twists: 3x20']
        };
    }

    initialize() {
        // Set up event listeners
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Send welcome message
        this.addMessage('bot', 'Hello! I can help you with workout suggestions, meal tracking, and fitness goals. Try asking about exercises for: chest, back, legs, arms, shoulders, or core!');
    }

    sendMessage() {
        const input = document.getElementById('user-input');
        const message = input.value.trim();
        
        if (message === '') return;
        
        this.addMessage('user', message);
        this.processMessage(message.toLowerCase());
        input.value = '';
    }

    addMessage(sender, text) {
        const messagesDiv = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    processMessage(message) {
        // Welcome message
        if (message.includes('hello') || message.includes('hi')) {
            this.addMessage('bot', 'Hello! How can I help you today? You can ask about:\n- Workout suggestions\n- Logging your meals\n- Checking your stats');
            return;
        }

        // Help message
        if (message.includes('help')) {
            this.addMessage('bot', 'I can help you with:\n- Workout suggestions for different body parts\n- Tracking your meals and calories\n- Checking your BMI and stats\n\nTry asking something like:\n- "Show me chest exercises"\n- "What exercises can I do for legs?"\n- "Tell me about my progress"');
            return;
        }

        // Check for workout queries
        for (const [bodyPart, exercises] of Object.entries(this.workouts)) {
            if (message.includes(bodyPart)) {
                this.addMessage('bot', `Here are some ${bodyPart} exercises:\n\n${exercises.join('\n')}`);
                return;
            }
        }

        // If no specific body part is mentioned but asks about workout/exercise
        if (message.includes('workout') || message.includes('exercise')) {
            this.addMessage('bot', 'I can suggest exercises for: chest, back, legs, arms, shoulders, or core. Which would you like to know about?');
            return;
        }

        // Default response
        this.addMessage('bot', "I'm not sure what you're asking. You can ask about workouts, meal tracking, or check your stats!");
    }
}

// Initialize bot
const bot = new FitnessBot();

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Enter key for chat
    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Profile Form Submission
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });

    // Food Log Form Submission
    document.getElementById('food-form').addEventListener('submit', function(e) {
        e.preventDefault();
        logFood();
    });
});

// UI Toggle Functions
function toggleProfile() {
    document.getElementById('profile-section').classList.toggle('active');
    document.getElementById('diet-log').classList.remove('active');
}

function toggleDietLog() {
    document.getElementById('diet-log').classList.toggle('active');
    document.getElementById('profile-section').classList.remove('active');
}

function showStats() {
    if (!userProfile) {
        addMessage('bot', 'Please set up your profile first to see your stats!');
        toggleProfile();
        return;
    }
    
    const stats = calculator.setUserProfile(userProfile);
    const response = `Your Fitness Stats:\n\n` +
        `BMI: ${stats.bmi} (${stats.bmiCategory})\n` +
        `Daily Calorie Need: ${stats.tdee} calories\n` +
        `Target Calories: ${stats.targetCalories} calories\n\n` +
        `Recommended Daily Macros:\n` +
        `- Protein: ${stats.macros.protein}g\n` +
        `- Carbs: ${stats.macros.carbs}g\n` +
        `- Fats: ${stats.macros.fats}g`;
    
    addMessage('bot', response);
}

// Profile Management
function saveProfile() {
    userProfile = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        weight: parseFloat(document.getElementById('weight').value),
        height: parseFloat(document.getElementById('height').value),
        activity: document.getElementById('activity').value,
        goal: document.getElementById('goal').value
    };

    const stats = calculator.setUserProfile(userProfile);
    addMessage('bot', `Thanks ${userProfile.name}! I've calculated your daily needs:\n\n` +
        `Target Calories: ${stats.targetCalories} calories\n` +
        `Protein: ${stats.macros.protein}g\n` +
        `Carbs: ${stats.macros.carbs}g\n` +
        `Fats: ${stats.macros.fats}g\n\n` +
        `What would you like to know about? You can ask about:\n` +
        `- Workout suggestions\n` +
        `- Diet recommendations\n` +
        `- Calorie calculations\n` +
        `- Exercise specific calories burned`);
    
    toggleProfile();
}

// Food Logging
function logFood() {
    const foodName = document.getElementById('food-name').value.toLowerCase();
    const portion = parseFloat(document.getElementById('portion').value);
    const mealTime = document.getElementById('meal-time').value;

    const foodInfo = calculatePortion(foodName, portion);
    if (!foodInfo) {
        addMessage('bot', `Sorry, I don't have information for ${foodName}. Please try another food item.`);
        return;
    }

    dailyLog.foods.push({
        name: foodName,
        portion: portion,
        mealTime: mealTime,
        ...foodInfo
    });

    updateDailySummary();
    document.getElementById('food-form').reset();
    addMessage('bot', `Logged ${portion}g of ${foodName} (${foodInfo.calories} calories)`);
}

function updateDailySummary() {
    dailyLog.totalCalories = dailyLog.foods.reduce((sum, food) => sum + food.calories, 0);
    dailyLog.totalProtein = dailyLog.foods.reduce((sum, food) => sum + food.protein, 0);
    dailyLog.totalCarbs = dailyLog.foods.reduce((sum, food) => sum + food.carbs, 0);
    dailyLog.totalFat = dailyLog.foods.reduce((sum, food) => sum + food.fat, 0);

    document.getElementById('total-calories').textContent = Math.round(dailyLog.totalCalories);
    document.getElementById('total-protein').textContent = Math.round(dailyLog.totalProtein);
    document.getElementById('total-carbs').textContent = Math.round(dailyLog.totalCarbs);
    document.getElementById('total-fat').textContent = Math.round(dailyLog.totalFat);
}

// Chat Functions
function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (message === '') return;
    
    addMessage('user', message);
    processMessage(message.toLowerCase());
    input.value = '';
}

function addMessage(sender, text) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function processMessage(message) {
    // Initial greeting
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        if (!userProfile) {
            addMessage('bot', 'Hello! To get started, please fill out your profile so I can provide personalized recommendations. Click the Profile button above!');
            toggleProfile();
        } else {
            addMessage('bot', `Hello ${userProfile.name}! How can I help you today? You can ask about:\n- Workout recommendations\n- Diet suggestions\n- Calorie tracking\n- Exercise calories burned`);
        }
        return;
    }

    // Help message
    if (message.includes('help') || message.includes('what can you do')) {
        addMessage('bot', 'I can help you with:\n- Workout suggestions for different body parts\n- Calorie and macro tracking\n- Diet recommendations\n- BMI and TDEE calculations\n- Exercise calories burned\n\nWhat would you like to know about?');
        return;
    }

    // Profile check
    if (!userProfile && !message.includes('help')) {
        addMessage('bot', 'Please set up your profile first so I can give you personalized recommendations!');
        toggleProfile();
        return;
    }

    // Workout queries
    if (message.includes('workout') || message.includes('exercise')) {
        let difficulty = 'beginner';
        if (message.includes('advanced')) difficulty = 'advanced';
        else if (message.includes('intermediate')) difficulty = 'intermediate';

        for (const [bodyPart, exercises] of Object.entries(workoutDatabase)) {
            if (message.includes(bodyPart)) {
                const workout = suggestWorkout(bodyPart, difficulty, 300); // 300 calories target
                const response = `Here's a ${difficulty} ${bodyPart} workout:\n\n` +
                    workout.exercises.map(ex => 
                        `${ex.name}:\n- ${ex.description}\n- Calories: ${ex.calories}\n`
                    ).join('\n') +
                    `\nTotal calories: ${workout.totalCalories}`;
                addMessage('bot', response);
                return;
            }
        }

        addMessage('bot', 'I can suggest exercises for: chest, legs, back, arms, shoulders, core, or cardio. Which would you like to know about?');
        return;
    }

    // Diet and food queries
    if (message.includes('food') || message.includes('diet') || message.includes('eat')) {
        if (message.includes('log') || message.includes('track')) {
            toggleDietLog();
            addMessage('bot', 'You can log your food in the diet log section. I\'ll help you track your calories and macros!');
            return;
        }

        const stats = calculator.setUserProfile(userProfile);
        const response = `Based on your profile, here are your daily targets:\n\n` +
            `Calories: ${stats.targetCalories}\n` +
            `Protein: ${stats.macros.protein}g\n` +
            `Carbs: ${stats.macros.carbs}g\n` +
            `Fats: ${stats.macros.fats}g\n\n` +
            `Would you like suggestions for:\n` +
            `- High protein foods\n` +
            `- Healthy carbs\n` +
            `- Healthy fats\n` +
            `- Snack options`;
        addMessage('bot', response);
        return;
    }

    // Calories burned query
    if (message.includes('burn') || message.includes('calories')) {
        const exercises = ['walking', 'jogging', 'running', 'cycling', 'swimming'];
        const burned = calculator.calculateCaloriesBurned(userProfile.weight, 30, 'moderate');
        const response = `Based on your weight of ${userProfile.weight}kg, here's how many calories you can burn in 30 minutes:\n\n` +
            exercises.map(ex => `${ex.charAt(0).toUpperCase() + ex.slice(1)}: ${calculator.calculateCaloriesBurned(userProfile.weight, 30, ex)} calories`).join('\n');
        addMessage('bot', response);
        return;
    }

    // Stats query
    if (message.includes('stats') || message.includes('progress')) {
        showStats();
        return;
    }

    // Default response
    addMessage('bot', "I'm not sure what you're asking. You can ask about workouts, diet recommendations, calorie tracking, or check your stats!");
}
}