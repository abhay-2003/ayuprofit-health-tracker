// Fitness Tracker with Enhanced Functionality

// Global State
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
    macros: { protein: 0, carbs: 0, fat: 0 }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing app...');
    try {
        initializeApp();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

function initializeApp() {
    console.log('Setting up event listeners...');
    setupEventListeners();
    populateFoodList();
    populateExerciseList();
    loadFromLocalStorage();
    updateAllDisplays();
}

// Event Listeners Setup
function setupEventListeners() {
    // Set up form event listeners
    const profileForm = document.getElementById('profile-form');
    const foodForm = document.getElementById('food-form');
    const exerciseForm = document.getElementById('exercise-form');
    const userInput = document.getElementById('user-input');

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }

    if (foodForm) {
        foodForm.addEventListener('submit', handleFoodSubmit);
    }

    if (exerciseForm) {
        exerciseForm.addEventListener('submit', handleExerciseSubmit);
    }

    // Set up chat event listeners
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Set up tab event listeners
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}

// Profile Management
function handleProfileSubmit(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        weight: parseFloat(document.getElementById('weight').value),
        height: parseFloat(document.getElementById('height').value),
        activity: parseFloat(document.getElementById('activity').value),
        goal: document.getElementById('goal').value
    };

    // Initialize profile with calculated values
    userProfile = {
        ...formData,
        startingWeight: formData.weight,
        currentWeight: formData.weight,
        weightGoal: calculateWeightGoal(formData.weight, formData.goal),
        nutrientGoals: calculateNutrientGoals(formData)
    };

    updateProfile();
    saveToLocalStorage();
}

// Food Tracking
function handleFoodSubmit(e) {
    e.preventDefault();
    const food = document.getElementById('food').value.toLowerCase();
    const portion = parseFloat(document.getElementById('portion').value);
    const mealType = document.getElementById('meal-time').value;

    console.log('Adding food:', food, portion, mealType);

    if (foodDatabase[food]) {
        addFoodToMeal(food, portion, mealType);
        e.target.reset();
        document.getElementById('food').focus();
    } else {
        console.error('Food not found in database:', food);
        alert('Please select a food from the list');
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
        fat: Number((food.fat * scale).toFixed(1)),
        timestamp: new Date().toISOString()
    };

    // Add to meal log
    dailyLog.meals[mealType].foods.push(foodEntry);
    
    // Update meal totals
    dailyLog.meals[mealType].calories += foodEntry.calories;
    dailyLog.meals[mealType].protein += foodEntry.protein;
    dailyLog.meals[mealType].carbs += foodEntry.carbs;
    dailyLog.meals[mealType].fat += foodEntry.fat;

    updateTotalNutrients();
    updateMealDisplay(mealType);
    updateAllDisplays();
    saveToLocalStorage();
}

// Exercise Tracking
function handleExerciseSubmit(e) {
    e.preventDefault();
    const exercise = document.getElementById('exercise').value.toLowerCase();
    const duration = parseInt(document.getElementById('duration').value);
    const intensity = document.getElementById('intensity').value;

    console.log('Adding exercise:', exercise, duration, intensity);

    if (!userProfile) {
        alert('Please set up your profile first');
        return;
    }

    if (exerciseDatabase[exercise]) {
        addExercise(exercise, duration, intensity);
        e.target.reset();
        document.getElementById('exercise').focus();
    } else {
        console.error('Exercise not found in database:', exercise);
        alert('Please select an exercise from the list');
    }
}

function addExercise(exerciseName, duration, intensity) {
    const exercise = exerciseDatabase[exerciseName];
    const caloriesBurned = calculateExerciseCalories(exercise.met, duration, userProfile.weight, intensity);
    
    const exerciseEntry = {
        name: exerciseName,
        duration: duration,
        intensity: intensity,
        caloriesBurned: caloriesBurned,
        timestamp: new Date().toISOString()
    };

    dailyLog.exercises.push(exerciseEntry);
    dailyLog.totalCaloriesBurned += caloriesBurned;

    updateExerciseDisplay();
    updateAllDisplays();
    saveToLocalStorage();
}

// Calculations
function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

function calculateBMR(weight, height, age, gender) {
    // Mifflin-St Jeor Equation
    const heightInCm = height;
    let bmr = (10 * weight) + (6.25 * heightInCm) - (5 * age);
    return gender === 'male' ? bmr + 5 : bmr - 161;
}

function calculateTDEE(bmr, activityLevel) {
    return Math.round(bmr * activityLevel);
}

function calculateExerciseCalories(met, duration, weight, intensity) {
    const intensityMultiplier = { 'low': 0.8, 'moderate': 1, 'high': 1.2 };
    return Math.round((met * 3.5 * weight * duration / 200) * intensityMultiplier[intensity]);
}

function calculateNutrientGoals(profile) {
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activity);
    
    let goalCalories;
    switch(profile.goal) {
        case 'lose':
            goalCalories = tdee - 500;
            break;
        case 'gain':
            goalCalories = tdee + 500;
            break;
        default:
            goalCalories = tdee;
    }

    // Calculate macros based on goals
    const proteinPerKg = profile.goal === 'gain' ? 2.2 : 2.0;
    const proteinGrams = profile.weight * proteinPerKg;
    const proteinCals = proteinGrams * 4;

    const fatCals = goalCalories * 0.25;
    const fatGrams = Math.round(fatCals / 9);

    const carbsCals = goalCalories - proteinCals - fatCals;
    const carbsGrams = Math.round(carbsCals / 4);

    return {
        calories: goalCalories,
        protein: Math.round(proteinGrams),
        carbs: carbsGrams,
        fat: fatGrams,
        tdee: tdee
    };
}

function calculateWeightGoal(currentWeight, goal) {
    switch(goal) {
        case 'lose':
            return currentWeight - 5;
        case 'gain':
            return currentWeight + 5;
        default:
            return currentWeight;
    }
}

// Display Updates
function updateProfile() {
    if (!userProfile) return;

    const bmi = calculateBMI(userProfile.weight, userProfile.height);
    document.getElementById('bmi').textContent = bmi;
    document.getElementById('bmi-category').textContent = getBMICategory(bmi);
    document.getElementById('tdee').textContent = userProfile.nutrientGoals.tdee;

    updateProgressDisplay();
}

function updateMealDisplay(mealType) {
    console.log(`Updating display for meal: ${mealType}`);
    const meal = dailyLog.meals[mealType];
    
    // Update total text
    const totalElement = document.getElementById(`${mealType}-total`);
    if (totalElement) {
        totalElement.textContent = `${meal.calories} cal | P: ${meal.protein.toFixed(1)}g | C: ${meal.carbs.toFixed(1)}g | F: ${meal.fat.toFixed(1)}g`;
    }

    // Create or update the food items list
    let itemsContainer = document.getElementById(`${mealType}-items`);
    if (!itemsContainer) {
        itemsContainer = document.createElement('div');
        itemsContainer.id = `${mealType}-items`;
        summaryDiv.appendChild(itemsContainer);
    }

    itemsContainer.innerHTML = meal.foods.map(food => `
        <div class="food-item">
            <span>${food.name} (${food.portion}g)</span>
            <span>${food.calories} cal | P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fat}g</span>
        </div>
    `).join('');
}

function updateExerciseDisplay() {
    // Update exercise list
    const exerciseTab = document.getElementById('exercise-tab');
    let container = document.getElementById('exercise-items');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'exercise-items';
        exerciseTab.appendChild(container);
    }

    container.innerHTML = dailyLog.exercises.map(exercise => `
        <div class="log-item">
            <span>${exercise.name} (${exercise.duration} min, ${exercise.intensity})</span>
            <span>${exercise.caloriesBurned} calories</span>
        </div>
    `).join('');

    // Update the calories burned in the daily summary
    const caloriesBurnedElement = document.getElementById('calories-burned');
    if (caloriesBurnedElement) {
        caloriesBurnedElement.textContent = dailyLog.totalCaloriesBurned;
    }

    // Update net calories
    updateNetCalories();
}

function updateProgressDisplay() {
    if (!userProfile) return;

    document.getElementById('starting-weight').textContent = `${userProfile.startingWeight} kg`;
    document.getElementById('current-weight').textContent = `${userProfile.currentWeight} kg`;
    document.getElementById('weight-goal').textContent = `${userProfile.weightGoal} kg`;

    const weightChange = userProfile.currentWeight - userProfile.startingWeight;
    document.getElementById('weight-change').textContent = `${Math.abs(weightChange).toFixed(1)} kg`;
    document.getElementById('progress-status').textContent = 
        weightChange > 0 ? 'Gained' : weightChange < 0 ? 'Lost' : 'No Change';
}

function updateDailySummary() {
    console.log('Updating daily summary...');

    // Update calories
    document.getElementById('calories-consumed')?.textContent = dailyLog.totalCaloriesConsumed;
    document.getElementById('calories-burned')?.textContent = dailyLog.totalCaloriesBurned;
    
    const net = dailyLog.totalCaloriesConsumed - dailyLog.totalCaloriesBurned;
    document.getElementById('net-calories')?.textContent = net;

    // Update macros
    document.getElementById('protein')?.textContent = `${dailyLog.macros.protein.toFixed(1)}g`;
    document.getElementById('carbs')?.textContent = `${dailyLog.macros.carbs.toFixed(1)}g`;
    document.getElementById('fat')?.textContent = `${dailyLog.macros.fat.toFixed(1)}g`;

    // Update remaining calories if we have user profile
    if (userProfile?.nutrientGoals) {
        const remaining = userProfile.nutrientGoals.calories - net;
        document.getElementById('calories-remaining')?.textContent = remaining;

        // Update macro progress bars
        updateMacroProgress('protein');
        updateMacroProgress('carbs');
        updateMacroProgress('fat');
    }

    console.log('Daily summary updated');
}

function updateMacroProgress(macro) {
    const current = dailyLog.macros[macro];
    const goal = userProfile.nutrientGoals[macro];
    const element = document.getElementById(`${macro}-progress`);
    const progress = (current / goal) * 100;

    element.querySelector('.macro-label span:last-child').textContent = 
        `${current.toFixed(1)}g / ${goal}g`;
    element.querySelector('.progress-fill').style.width = `${Math.min(progress, 100)}%`;
}

function updateNetCalories() {
    const netCaloriesElement = document.getElementById('net-calories');
    if (netCaloriesElement) {
        const net = dailyLog.totalCaloriesConsumed - dailyLog.totalCaloriesBurned;
        netCaloriesElement.textContent = net;
    }
}

function updateAllDisplays() {
    console.log('Updating all displays...');
    
    // Update all meal displays
    Object.keys(dailyLog.meals).forEach(meal => {
        console.log('Updating meal display for:', meal);
        updateMealDisplay(meal);
    });

    // Update exercise display
    console.log('Updating exercise display');
    updateExerciseDisplay();

    // Update daily summary
    console.log('Updating daily summary');
    updateDailySummary();

    // Update profile section
    console.log('Updating profile');
    updateProfile();

    // Save to local storage
    saveToLocalStorage();
}

// Utility Functions
function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function updateTotalNutrients() {
    dailyLog.totalCaloriesConsumed = 0;
    dailyLog.macros = { protein: 0, carbs: 0, fat: 0 };

    Object.values(dailyLog.meals).forEach(meal => {
        dailyLog.totalCaloriesConsumed += meal.calories;
        dailyLog.macros.protein += meal.protein;
        dailyLog.macros.carbs += meal.carbs;
        dailyLog.macros.fat += meal.fat;
    });
}

function populateFoodList() {
    const datalist = document.getElementById('food-list');
    datalist.innerHTML = Object.keys(foodDatabase)
        .map(food => `<option value="${food}">`)
        .join('');
}

function populateExerciseList() {
    const datalist = document.getElementById('exercise-list');
    datalist.innerHTML = Object.keys(exerciseDatabase)
        .map(exercise => `<option value="${exercise}">`)
        .join('');
}

// Storage Management
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
    }

    if (savedLog) {
        const loadedLog = JSON.parse(savedLog);
        if (loadedLog.date === new Date().toISOString().split('T')[0]) {
            dailyLog = loadedLog;
        }
    }
}

function fillProfileForm() {
    if (!userProfile) return;
    
    Object.entries(userProfile).forEach(([key, value]) => {
        const input = document.getElementById(key);
        if (input && typeof value !== 'object') {
            input.value = value;
        }
    });
}