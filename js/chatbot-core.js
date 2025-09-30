// Global State and History
let userProfile = null;
let dailyLog = {
    date: new Date().toISOString().split('T')[0],
    meals: {
        breakfast: { foods: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
        lunch: { foods: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
        dinner: { foods: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
        snacks: { foods: [], calories: 0, protein: 0, carbs: 0, fat: 0 }
    },
    exercises: [],
    totalCaloriesConsumed: 0,
    totalCaloriesBurned: 0,
    waterIntake: 0,
    steps: 0
};

// Store history for progress tracking
let userHistory = {
    weights: [],
    calories: [],
    exercises: [],
    measurements: []
};

// Enhanced Workout Database
const workouts = {
    'chest': {
        exercises: [
            { name: 'Push-ups', sets: 3, reps: 15, caloriesPerMin: 8, difficulty: 'beginner' },
            { name: 'Bench Press', sets: 3, reps: 10, caloriesPerMin: 10, difficulty: 'intermediate' },
            { name: 'Dips', sets: 3, reps: 12, caloriesPerMin: 9, difficulty: 'intermediate' },
            { name: 'Incline Push-ups', sets: 3, reps: 12, caloriesPerMin: 7, difficulty: 'beginner' },
            { name: 'Diamond Push-ups', sets: 3, reps: 10, caloriesPerMin: 9, difficulty: 'advanced' }
        ],
        tips: [
            'Keep your core tight throughout the movements',
            'Breathe out during the pushing motion',
            'Keep your elbows at 45 degrees during push-ups'
        ]
    },
    'back': {
        exercises: [
            { name: 'Pull-ups', sets: 3, reps: 8, caloriesPerMin: 10, difficulty: 'advanced' },
            { name: 'Rows', sets: 3, reps: 12, caloriesPerMin: 8, difficulty: 'intermediate' },
            { name: 'Lat Pulldowns', sets: 3, reps: 12, caloriesPerMin: 7, difficulty: 'beginner' },
            { name: 'Superman Holds', sets: 3, reps: '20 sec', caloriesPerMin: 4, difficulty: 'beginner' },
            { name: 'Assisted Pull-ups', sets: 3, reps: 10, caloriesPerMin: 8, difficulty: 'intermediate' }
        ],
        tips: [
            'Focus on squeezing your shoulder blades together',
            'Keep your core engaged throughout',
            'Use a full range of motion'
        ]
    },
    'legs': {
        exercises: [
            { name: 'Squats', sets: 3, reps: 12, caloriesPerMin: 9, difficulty: 'beginner' },
            { name: 'Lunges', sets: 3, reps: '10/leg', caloriesPerMin: 8, difficulty: 'beginner' },
            { name: 'Calf Raises', sets: 3, reps: 20, caloriesPerMin: 5, difficulty: 'beginner' },
            { name: 'Jump Squats', sets: 3, reps: 15, caloriesPerMin: 12, difficulty: 'intermediate' },
            { name: 'Bulgarian Split Squats', sets: 3, reps: '12/leg', caloriesPerMin: 10, difficulty: 'advanced' }
        ],
        tips: [
            'Keep your knees aligned with your toes',
            'Push through your heels',
            'Keep your chest up during squats'
        ]
    },
    'arms': {
        exercises: [
            { name: 'Bicep Curls', sets: 3, reps: 12, caloriesPerMin: 6, difficulty: 'beginner' },
            { name: 'Tricep Extensions', sets: 3, reps: 12, caloriesPerMin: 6, difficulty: 'beginner' },
            { name: 'Hammer Curls', sets: 3, reps: 12, caloriesPerMin: 6, difficulty: 'intermediate' },
            { name: 'Diamond Push-ups', sets: 3, reps: 10, caloriesPerMin: 8, difficulty: 'intermediate' },
            { name: 'Chin-ups', sets: 3, reps: 8, caloriesPerMin: 10, difficulty: 'advanced' }
        ],
        tips: [
            'Keep your elbows close to your body',
            'Control the movement both up and down',
            'Avoid swinging your body'
        ]
    },
    'shoulders': {
        exercises: [
            { name: 'Shoulder Press', sets: 3, reps: 10, caloriesPerMin: 8, difficulty: 'intermediate' },
            { name: 'Lateral Raises', sets: 3, reps: 12, caloriesPerMin: 6, difficulty: 'beginner' },
            { name: 'Front Raises', sets: 3, reps: 12, caloriesPerMin: 6, difficulty: 'beginner' },
            { name: 'Pike Push-ups', sets: 3, reps: 10, caloriesPerMin: 9, difficulty: 'advanced' },
            { name: 'Arm Circles', sets: 3, reps: '30 sec', caloriesPerMin: 4, difficulty: 'beginner' }
        ],
        tips: [
            'Keep your core engaged',
            'Avoid arching your back',
            'Control the weight throughout the movement'
        ]
    },
    'core': {
        exercises: [
            { name: 'Crunches', sets: 3, reps: 20, caloriesPerMin: 5, difficulty: 'beginner' },
            { name: 'Plank', sets: 3, reps: '30 sec', caloriesPerMin: 7, difficulty: 'beginner' },
            { name: 'Russian Twists', sets: 3, reps: 20, caloriesPerMin: 8, difficulty: 'intermediate' },
            { name: 'Mountain Climbers', sets: 3, reps: '30 sec', caloriesPerMin: 10, difficulty: 'intermediate' },
            { name: 'Dragon Flags', sets: 3, reps: 8, caloriesPerMin: 12, difficulty: 'advanced' }
        ],
        tips: [
            'Quality over quantity - focus on form',
            'Breathe steadily throughout exercises',
            'Keep your lower back pressed against the ground when appropriate'
        ]
    }
};

// Initialize Application
function initializeApp() {
    setupEventListeners();
    populateFoodList();
    populateExerciseList();
    loadFromLocalStorage();
    sendWelcomeMessage();
}

// Event Listeners Setup
function setupEventListeners() {
    document.getElementById('profile-form')?.addEventListener('submit', handleProfileSubmit);
    document.getElementById('food-form')?.addEventListener('submit', handleFoodSubmit);
    document.getElementById('exercise-form')?.addEventListener('submit', handleExerciseSubmit);
    document.getElementById('user-input')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Chat Functions
function sendMessage() {
    const input = document.getElementById('user-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (message === '') return;
    
    addMessage('user', message);
    processMessage(message.toLowerCase());
    input.value = '';
}

function addMessage(sender, text) {
    const messagesDiv = document.getElementById('chat-messages');
    if (!messagesDiv) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendWelcomeMessage() {
    addMessage('bot', 'Hello! I can help you with workout suggestions, meal tracking, and fitness goals. Try asking about exercises for: chest, back, legs, arms, shoulders, or core!');
}

function processMessage(message) {
    const msg = message.toLowerCase();
    
    // Greeting patterns
    if (msg.match(/\b(hi|hello|hey|good (morning|afternoon|evening))\b/)) {
        const greeting = getTimeBasedGreeting();
        addMessage('bot', `${greeting}! How can I help you today?\n\nYou can ask me about:\n• Workout suggestions for different body parts\n• Meal recommendations and tracking\n• Progress tracking and stats\n• Calorie calculations\n• Exercise tips and form guidance`);
        return;
    }

    // Help request
    if (msg.includes('help')) {
        addMessage('bot', `Here's what I can help you with:

1. Workout Planning:
   • Suggest exercises for specific body parts
   • Create workout routines based on your goals
   • Calculate calories burned during exercises

2. Nutrition Tracking:
   • Track your meals and calories
   • Suggest meal options based on your goals
   • Monitor your macronutrient intake

3. Progress Monitoring:
   • Track your weight changes
   • Monitor your BMI and measurements
   • View your workout history

Try asking things like:
• "Show me some chest exercises for beginners"
• "How many calories in my breakfast?"
• "What exercises burn the most calories?"
• "Show me my progress"
• "Give me meal suggestions for muscle gain"`);
        return;
    }

    // Exercise recommendations
    for (const [bodyPart, data] of Object.entries(workouts)) {
        if (msg.includes(bodyPart)) {
            let difficulty = 'intermediate';
            if (msg.includes('beginner')) difficulty = 'beginner';
            if (msg.includes('advanced')) difficulty = 'advanced';

            const matchingExercises = data.exercises
                .filter(ex => ex.difficulty === difficulty)
                .map(ex => `• ${ex.name}: ${ex.sets}x${ex.reps} (Burns ~${ex.caloriesPerMin * 3} calories/set)`)
                .join('\\n');

            const tips = data.tips.map(tip => `• ${tip}`).join('\\n');

            addMessage('bot', `Here's a ${difficulty} ${bodyPart} workout for you:\\n\\n${matchingExercises}\\n\\nPro Tips:\\n${tips}\\n\\nWould you like me to create a complete workout routine with these exercises?`);
            return;
        }
    }

    // Calorie and nutrition queries
    if (msg.match(/\b(calorie|calories|burn|burned)\b/)) {
        if (msg.includes('burn') || msg.includes('burned')) {
            if (!userProfile) {
                addMessage('bot', 'Please set up your profile first so I can give you accurate calorie calculations! Use the profile form on the left.');
                return;
            }
            
            const topExercises = Object.values(workouts)
                .flatMap(part => part.exercises)
                .sort((a, b) => b.caloriesPerMin - a.caloriesPerMin)
                .slice(0, 5)
                .map(ex => `• ${ex.name}: ~${ex.caloriesPerMin * 3 * ex.sets} calories per workout`);

            addMessage('bot', `Here are the top calorie-burning exercises for you:\\n\\n${topExercises.join('\\n')}\\n\\nBased on your profile, you burn approximately ${calculateTDEE()} calories daily without exercise.`);
            return;
        }
        
        showCalorieStats();
        return;
    }

    // Progress and stats queries
    if (msg.match(/\b(progress|stat|stats|weight|bmi)\b/)) {
        if (!userProfile) {
            addMessage('bot', 'Please fill out your profile first so I can show you your stats! Use the profile form on the left.');
            return;
        }
        
        const stats = getDetailedStats();
        addMessage('bot', stats);
        
        if (userHistory.weights.length > 0) {
            const weightProgress = analyzeWeightProgress();
            addMessage('bot', weightProgress);
        }
        return;
    }

    // Meal planning and suggestions
    if (msg.match(/\b(meal|food|eat|nutrition|diet)\b/)) {
        if (!userProfile) {
            addMessage('bot', 'Please set up your profile first so I can give you personalized meal suggestions!');
            return;
        }
        
        const goalBasedMeals = getMealSuggestions();
        addMessage('bot', goalBasedMeals);
        return;
    }

    // Workout routine request
    if (msg.match(/\b(routine|program|schedule|plan)\b/)) {
        if (!userProfile) {
            addMessage('bot', 'Please set up your profile first so I can create a personalized workout routine for you!');
            return;
        }
        
        const routine = createWorkoutRoutine();
        addMessage('bot', routine);
        return;
    }

    // Default response with suggestion
    const suggestions = [
        'Want to know about specific exercises?',
        'Interested in tracking your meals?',
        'Would you like to see your progress?',
        'Need help with workout planning?',
        'Want to know how many calories you burn?'
    ];
    
    addMessage('bot', `I'm not sure what you're asking. ${suggestions[Math.floor(Math.random() * suggestions.length)]} Just let me know!`);
}

// Profile Functions
function handleProfileSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const genderInput = document.getElementById('gender');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const activityInput = document.getElementById('activity');
    const goalInput = document.getElementById('goal');

    if (!nameInput || !ageInput || !genderInput || !weightInput || 
        !heightInput || !activityInput || !goalInput) return;

    userProfile = {
        name: nameInput.value,
        age: parseInt(ageInput.value),
        gender: genderInput.value,
        weight: parseFloat(weightInput.value),
        height: parseFloat(heightInput.value),
        activity: parseFloat(activityInput.value),
        goal: goalInput.value
    };

    updateStats();
    saveToLocalStorage();
    
    addMessage('bot', `Thanks ${userProfile.name}! I've updated your profile. Your current stats:\n${getStats()}`);
}

// Food Tracking Functions
function handleFoodSubmit(e) {
    e.preventDefault();
    const foodInput = document.getElementById('food');
    const portionInput = document.getElementById('portion');
    const mealTypeInput = document.getElementById('meal-time');

    if (!foodInput || !portionInput || !mealTypeInput) return;

    const food = foodInput.value.toLowerCase();
    const portion = parseFloat(portionInput.value);
    const mealType = mealTypeInput.value;

    if (foodDatabase[food]) {
        addFoodToMeal(food, portion, mealType);
        e.target.reset();
        foodInput.focus();
    } else {
        addMessage('bot', 'Please select a food from the list.');
    }
}

function addFoodToMeal(foodName, portion, mealType) {
    const food = foodDatabase[foodName];
    const scale = portion / 100;
    
    const foodEntry = {
        name: foodName,
        portion: portion,
        calories: Math.round(food.calories * scale),
        protein: Number((food.protein * scale).toFixed(1)),
        carbs: Number((food.carbs * scale).toFixed(1)),
        fat: Number((food.fat * scale).toFixed(1))
    };

    dailyLog.meals[mealType].foods.push(foodEntry);
    updateMealTotals(mealType);
    updateDisplay();
    saveToLocalStorage();
}

// Exercise Functions
function handleExerciseSubmit(e) {
    e.preventDefault();
    const exerciseInput = document.getElementById('exercise');
    const durationInput = document.getElementById('duration');
    const intensityInput = document.getElementById('intensity');

    if (!exerciseInput || !durationInput || !intensityInput) return;

    const exercise = exerciseInput.value.toLowerCase();
    const duration = parseInt(durationInput.value);
    const intensity = intensityInput.value;

    if (exerciseDatabase[exercise]) {
        addExercise(exercise, duration, intensity);
        e.target.reset();
        exerciseInput.focus();
    } else {
        addMessage('bot', 'Please select an exercise from the list.');
    }
}

function addExercise(exerciseName, duration, intensity) {
    if (!userProfile) {
        addMessage('bot', 'Please set up your profile first to track exercises accurately.');
        return;
    }

    const exercise = exerciseDatabase[exerciseName];
    const caloriesBurned = calculateExerciseCalories(exercise.met, duration, userProfile.weight, intensity);
    
    const exerciseEntry = {
        name: exerciseName,
        duration: duration,
        intensity: intensity,
        caloriesBurned: caloriesBurned
    };

    dailyLog.exercises.push(exerciseEntry);
    dailyLog.totalCaloriesBurned += caloriesBurned;

    updateDisplay();
    saveToLocalStorage();
}

// Utility Functions
function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

function calculateExerciseCalories(met, duration, weight, intensity) {
    const intensityMultiplier = { 'low': 0.8, 'moderate': 1, 'high': 1.2 };
    return Math.round((met * 3.5 * weight * duration / 200) * intensityMultiplier[intensity]);
}

function getStats() {
    if (!userProfile) return 'Profile not set up yet.';
    
    const bmi = calculateBMI(userProfile.weight, userProfile.height);
    return `Current Stats:\n` +
           `BMI: ${bmi}\n` +
           `Daily Calories Consumed: ${dailyLog.totalCaloriesConsumed}\n` +
           `Daily Calories Burned: ${dailyLog.totalCaloriesBurned}\n` +
           `Net Calories: ${dailyLog.totalCaloriesConsumed - dailyLog.totalCaloriesBurned}`;
}

// Display Updates
function updateStats() {
    if (!userProfile) return;

    const bmi = calculateBMI(userProfile.weight, userProfile.height);
    const bmiElement = document.getElementById('bmi');
    const bmiCategoryElement = document.getElementById('bmi-category');
    const tdeeElement = document.getElementById('tdee');
    const calorieGoalElement = document.getElementById('calorie-goal');

    if (bmiElement) bmiElement.textContent = bmi;
    if (bmiCategoryElement) bmiCategoryElement.textContent = getBMICategory(bmi);
    if (tdeeElement) tdeeElement.textContent = calculateTDEE();
    if (calorieGoalElement) calorieGoalElement.textContent = calculateCalorieGoal();
}

function updateMealTotals(mealType) {
    const meal = dailyLog.meals[mealType];
    meal.calories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
    meal.protein = meal.foods.reduce((sum, food) => sum + food.protein, 0);
    meal.carbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
    meal.fat = meal.foods.reduce((sum, food) => sum + food.fat, 0);
    
    dailyLog.totalCaloriesConsumed = Object.values(dailyLog.meals)
        .reduce((sum, meal) => sum + meal.calories, 0);
}

function updateDisplay() {
    // Update meals display
    Object.keys(dailyLog.meals).forEach(mealType => {
        const container = document.getElementById(`${mealType}-items`);
        if (container) {
            container.innerHTML = dailyLog.meals[mealType].foods.map(food => `
                <div class="card mb-2">
                    <div class="card-body p-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-0 text-capitalize">${food.name}</h6>
                                <small class="text-muted">${food.portion}g</small>
                            </div>
                            <div class="text-end">
                                <div class="fw-bold">${food.calories} cal</div>
                                <small class="text-muted">
                                    P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fat}g
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // Update meal totals
            const meal = dailyLog.meals[mealType];
            const totalDiv = document.createElement('div');
            totalDiv.className = 'card bg-light mt-2';
            totalDiv.innerHTML = `
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between">
                        <strong>Total:</strong>
                        <div class="text-end">
                            <div>${meal.calories} calories</div>
                            <small class="text-muted">
                                P: ${meal.protein}g | C: ${meal.carbs}g | F: ${meal.fat}g
                            </small>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(totalDiv);
        }
    });

    // Update exercise display
    const exerciseContainer = document.getElementById('exercise-items');
    if (exerciseContainer) {
        exerciseContainer.innerHTML = dailyLog.exercises.map(exercise => `
            <div class="card mb-2">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0 text-capitalize">${exercise.name}</h6>
                            <small class="text-muted">
                                ${exercise.duration} min | ${exercise.intensity} intensity
                            </small>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold text-success">${exercise.caloriesBurned} cal</div>
                            <small class="text-muted">burned</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add total calories burned
        if (dailyLog.exercises.length > 0) {
            const totalDiv = document.createElement('div');
            totalDiv.className = 'card bg-light mt-3';
            totalDiv.innerHTML = `
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <strong>Total Calories Burned:</strong>
                        <div class="text-success fw-bold">${dailyLog.totalCaloriesBurned} cal</div>
                    </div>
                </div>
            `;
            exerciseContainer.appendChild(totalDiv);
        }
    }

    // Update calorie displays
    const calorieGoal = calculateCalorieGoal();
    const remaining = calorieGoal - dailyLog.totalCaloriesConsumed + dailyLog.totalCaloriesBurned;

    document.getElementById('calories-consumed').textContent = dailyLog.totalCaloriesConsumed;
    document.getElementById('calories-burned').textContent = dailyLog.totalCaloriesBurned;
    document.getElementById('calories-remaining').textContent = remaining;
    document.getElementById('calorie-goal').textContent = calorieGoal;

    // Update charts
    updateCharts();
}
}

// Storage Functions
function saveToLocalStorage() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    localStorage.setItem('dailyLog', JSON.stringify(dailyLog));
}

function loadFromLocalStorage() {
    const savedProfile = localStorage.getItem('userProfile');
    const savedLog = localStorage.getItem('dailyLog');

    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        fillProfileForm();
        updateStats();
    }

    if (savedLog) {
        const loadedLog = JSON.parse(savedLog);
        if (loadedLog.date === dailyLog.date) {
            dailyLog = loadedLog;
            updateDisplay();
        }
    }
}

function fillProfileForm() {
    if (!userProfile) return;
    
    Object.entries(userProfile).forEach(([key, value]) => {
        const input = document.getElementById(key);
        if (input) input.value = value;
    });
}

// Enhanced Helper Functions
function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function calculateTDEE() {
    if (!userProfile) return 0;
    // Using the Mifflin-St Jeor Equation for BMR
    const bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + (userProfile.gender === 'male' ? 5 : -161);
    return Math.round(bmr * userProfile.activity);
}

function calculateCalorieGoal() {
    const tdee = calculateTDEE();
    switch(userProfile.goal) {
        case 'lose': return tdee - 500; // 500 calorie deficit for weight loss
        case 'gain': return tdee + 500; // 500 calorie surplus for muscle gain
        default: return tdee;
    }
}

function getDetailedStats() {
    if (!userProfile) return 'Profile not set up yet.';
    
    const bmi = calculateBMI(userProfile.weight, userProfile.height);
    const tdee = calculateTDEE();
    const goal = calculateCalorieGoal();
    const consumed = dailyLog.totalCaloriesConsumed;
    const burned = dailyLog.totalCaloriesBurned;
    const remaining = goal - consumed + burned;

    return `📊 Current Stats:

🏋️ Basic Metrics:
• BMI: ${bmi} (${getBMICategory(bmi)})
• Weight: ${userProfile.weight} kg
• Height: ${userProfile.height} cm

🔥 Calorie Tracking:
• Daily Goal: ${goal} cal
• Consumed: ${consumed} cal
• Burned: ${burned} cal
• Remaining: ${remaining} cal

💪 Activity Level: ${getActivityLevelDescription(userProfile.activity)}
🎯 Current Goal: ${userProfile.goal.charAt(0).toUpperCase() + userProfile.goal.slice(1)}

Want to know more about your progress or get personalized recommendations?`;
}

function getActivityLevelDescription(level) {
    const levels = {
        1.2: 'Sedentary (little or no exercise)',
        1.375: 'Lightly Active (light exercise 1-3 days/week)',
        1.55: 'Moderately Active (moderate exercise 3-5 days/week)',
        1.725: 'Very Active (hard exercise 6-7 days/week)',
        1.9: 'Extra Active (very hard exercise & physical job)'
    };
    return levels[level] || 'Custom';
}

function analyzeWeightProgress() {
    if (userHistory.weights.length < 2) return '';
    
    const latestWeight = userHistory.weights[userHistory.weights.length - 1];
    const previousWeight = userHistory.weights[userHistory.weights.length - 2];
    const difference = latestWeight - previousWeight;
    
    let analysis = '📈 Weight Progress Analysis:\\n';
    analysis += `• Change: ${Math.abs(difference).toFixed(1)} kg ${difference > 0 ? '⬆️' : '⬇️'}\\n`;
    
    if (userProfile.goal === 'lose' && difference < 0) {
        analysis += '• On track with your weight loss goal! Keep it up! 💪';
    } else if (userProfile.goal === 'gain' && difference > 0) {
        analysis += '• Making progress on your muscle gain goal! 💪';
    } else if (Math.abs(difference) < 0.2) {
        analysis += '• Weight maintaining stable 👍';
    } else {
        analysis += '• Consider adjusting your nutrition and exercise plan to align with your goals';
    }
    
    return analysis;
}

function getMealSuggestions() {
    const goal = userProfile.goal;
    const tdee = calculateTDEE();
    
    let suggestions = '🍽️ Personalized Meal Suggestions:\\n\\n';
    
    if (goal === 'lose') {
        suggestions += `For weight loss (${tdee - 500} calories/day):\\n`;
        suggestions += '• Breakfast: Oatmeal with berries and protein powder\\n';
        suggestions += '• Lunch: Grilled chicken salad with olive oil dressing\\n';
        suggestions += '• Dinner: Baked fish with steamed vegetables\\n';
        suggestions += '• Snacks: Greek yogurt, almonds, or apple slices\\n';
    } else if (goal === 'gain') {
        suggestions += `For muscle gain (${tdee + 500} calories/day):\\n`;
        suggestions += '• Breakfast: Eggs, whole grain toast, and protein smoothie\\n';
        suggestions += '• Lunch: Lean beef with brown rice and vegetables\\n';
        suggestions += '• Dinner: Salmon with sweet potato and quinoa\\n';
        suggestions += '• Snacks: Protein bars, mixed nuts, and banana with peanut butter\\n';
    } else {
        suggestions += `For maintenance (${tdee} calories/day):\\n`;
        suggestions += '• Breakfast: Whole grain cereal with milk and fruit\\n';
        suggestions += '• Lunch: Turkey sandwich with avocado\\n';
        suggestions += '• Dinner: Grilled chicken with rice and vegetables\\n';
        suggestions += '• Snacks: Hummus with carrots or protein shake\\n';
    }
    
    suggestions += '\\nWould you like specific portions calculated for your calorie goals?';
    return suggestions;
}

function createWorkoutRoutine() {
    const goal = userProfile.goal;
    const level = determineUserLevel();
    
    let routine = '🏋️‍♂️ Your Personalized Workout Routine:\\n\\n';
    
    if (goal === 'lose') {
        routine += 'Focus: Calorie Burn & Strength Maintenance\\n\\n';
        routine += 'Monday: HIIT & Upper Body\\n';
        routine += 'Wednesday: Cardio & Core\\n';
        routine += 'Friday: Full Body Circuit\\n';
        routine += 'Saturday: Active Recovery (Walking/Swimming)\\n';
    } else if (goal === 'gain') {
        routine += 'Focus: Muscle Building & Strength\\n\\n';
        routine += 'Monday: Chest & Triceps\\n';
        routine += 'Tuesday: Back & Biceps\\n';
        routine += 'Thursday: Legs\\n';
        routine += 'Friday: Shoulders & Core\\n';
    } else {
        routine += 'Focus: Overall Fitness & Balance\\n\\n';
        routine += 'Monday: Upper Body\\n';
        routine += 'Wednesday: Lower Body\\n';
        routine += 'Friday: Full Body & Core\\n';
    }
    
    routine += '\\nWould you like to see the specific exercises for any of these days?';
    return routine;
}

function determineUserLevel() {
    if (!userProfile) return 'beginner';
    
    // Consider activity level and exercise history
    if (userProfile.activity >= 1.725) return 'advanced';
    if (userProfile.activity >= 1.55) return 'intermediate';
    return 'beginner';
}
}

function populateFoodList() {
    const datalist = document.getElementById('food-list');
    if (datalist && typeof foodDatabase !== 'undefined') {
        datalist.innerHTML = Object.keys(foodDatabase)
            .map(food => `<option value="${food}">`)
            .join('');
    }
}

function populateExerciseList() {
    const datalist = document.getElementById('exercise-list');
    if (datalist && typeof exerciseDatabase !== 'undefined') {
        datalist.innerHTML = Object.keys(exerciseDatabase)
            .map(exercise => `<option value="${exercise}">`)
            .join('');
    }
}

// Chart initialization and updates
function initializeCharts() {
    // Calories Chart
    const caloriesCtx = document.getElementById('calories-chart').getContext('2d');
    window.caloriesChart = new Chart(caloriesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Consumed', 'Burned', 'Remaining'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#28a745', '#dc3545', '#007bff']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Weight Progress Chart
    const weightCtx = document.getElementById('weight-chart').getContext('2d');
    window.weightChart = new Chart(weightCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Weight (kg)',
                data: [],
                borderColor: '#007bff',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Calories Trend Chart
    const caloriesTrendCtx = document.getElementById('calories-trend-chart').getContext('2d');
    window.caloriesTrendChart = new Chart(caloriesTrendCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Calories Consumed',
                data: [],
                backgroundColor: '#28a745'
            }, {
                label: 'Calories Burned',
                data: [],
                backgroundColor: '#dc3545'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Macros Chart
    const macrosCtx = document.getElementById('macros-chart').getContext('2d');
    window.macrosChart = new Chart(macrosCtx, {
        type: 'radar',
        data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                label: 'Grams',
                data: [0, 0, 0],
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderColor: '#007bff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Exercise Chart
    const exerciseCtx = document.getElementById('exercise-chart').getContext('2d');
    window.exerciseChart = new Chart(exerciseCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Minutes',
                data: [],
                backgroundColor: '#17a2b8'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateCharts() {
    if (!userProfile) return;

    // Update Calories Chart
    const goal = calculateCalorieGoal();
    const consumed = dailyLog.totalCaloriesConsumed;
    const burned = dailyLog.totalCaloriesBurned;
    const remaining = Math.max(0, goal - consumed + burned);

    window.caloriesChart.data.datasets[0].data = [consumed, burned, remaining];
    window.caloriesChart.update();

    // Update Macros Chart
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.values(dailyLog.meals).forEach(meal => {
        totalProtein += meal.protein;
        totalCarbs += meal.carbs;
        totalFat += meal.fat;
    });

    window.macrosChart.data.datasets[0].data = [totalProtein, totalCarbs, totalFat];
    window.macrosChart.update();

    // Update Weight Chart if new weight is added
    if (userHistory.weights.length > 0) {
        window.weightChart.data.labels = userHistory.weights.map((_, i) => `Day ${i + 1}`);
        window.weightChart.data.datasets[0].data = userHistory.weights;
        window.weightChart.update();
    }

    // Update Exercise Chart
    const exerciseTypes = [...new Set(dailyLog.exercises.map(e => e.name))];
    const exerciseDurations = exerciseTypes.map(type => 
        dailyLog.exercises
            .filter(e => e.name === type)
            .reduce((sum, e) => sum + e.duration, 0)
    );

    window.exerciseChart.data.labels = exerciseTypes;
    window.exerciseChart.data.datasets[0].data = exerciseDurations;
    window.exerciseChart.update();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializeCharts();
});