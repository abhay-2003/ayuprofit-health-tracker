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
    macros: { protein: 0, carbs: 0, fat: 0 },
    weightLog: []
};

// DOM Elements
const foodForm = document.getElementById('food-form');
const exerciseForm = document.getElementById('exercise-form');
const profileForm = document.getElementById('profile-form');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupEventListeners();
    populateFoodList();
    populateExerciseList();
    updateAllDisplays();
});

function setupEventListeners() {
    // Profile Form
    profileForm.addEventListener('submit', handleProfileSubmit);
    
    // Food Form
    foodForm.addEventListener('submit', handleFoodSubmit);
    
    // Exercise Form
    exerciseForm.addEventListener('submit', handleExerciseSubmit);
    
    // Tab Switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.getAttribute('data-tab')));
    });
}

// Form Handlers
function handleProfileSubmit(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        weight: parseFloat(document.getElementById('weight').value),
        height: parseFloat(document.getElementById('height').value),
        activity: parseFloat(document.getElementById('activity').value),
        goal: document.getElementById('goal').value,
        currentWeight: parseFloat(document.getElementById('weight').value),
        startingWeight: parseFloat(document.getElementById('weight').value),
        weightGoal: document.getElementById('goal').value === 'lose' ? 
            parseFloat(document.getElementById('weight').value) - 5 : 
            parseFloat(document.getElementById('weight').value) + 5
    };

    userProfile = formData;
    updateProfile(formData);
    saveToLocalStorage();
}

function handleFoodSubmit(e) {
    e.preventDefault();
    const food = document.getElementById('food').value.toLowerCase();
    const portion = parseFloat(document.getElementById('portion').value);
    const mealTime = document.getElementById('meal-time').value;

    if (foodDatabase[food]) {
        const scale = portion / 100;
        const foodEntry = {
            name: food,
            portion: portion,
            calories: Math.round(foodDatabase[food].calories * scale),
            protein: Number((foodDatabase[food].protein * scale).toFixed(1)),
            carbs: Number((foodDatabase[food].carbs * scale).toFixed(1)),
            fat: Number((foodDatabase[food].fat * scale).toFixed(1)),
            timestamp: new Date().toISOString()
        };

        addFoodEntry(foodEntry, mealTime);
        e.target.reset();
        document.getElementById('food').focus();
    }
}

function handleExerciseSubmit(e) {
    e.preventDefault();
    const exercise = document.getElementById('exercise').value.toLowerCase();
    const duration = parseInt(document.getElementById('duration').value);
    const intensity = document.getElementById('intensity').value;

    if (exerciseDatabase[exercise]) {
        const caloriesBurned = calculateExerciseCalories(exercise, duration, userProfile.weight, intensity);
        const exerciseEntry = {
            name: exercise,
            duration: duration,
            intensity: intensity,
            caloriesBurned: caloriesBurned,
            timestamp: new Date().toISOString()
        };

        addExerciseEntry(exerciseEntry);
        e.target.reset();
        document.getElementById('exercise').focus();
    }
}

// Data Management
function addFoodEntry(entry, mealType) {
    dailyLog.meals[mealType].foods.push(entry);
    dailyLog.meals[mealType].calories += entry.calories;
    dailyLog.meals[mealType].protein += entry.protein;
    dailyLog.meals[mealType].carbs += entry.carbs;
    dailyLog.meals[mealType].fat += entry.fat;

    updateTotalNutrients();
    updateAllDisplays();
    saveToLocalStorage();
}

function addExerciseEntry(entry) {
    dailyLog.exercises.push(entry);
    dailyLog.totalCaloriesBurned += entry.caloriesBurned;
    updateAllDisplays();
    saveToLocalStorage();
}

// Display Updates
function updateAllDisplays() {
    updateMealSummaries();
    updateExerciseLog();
    updateTotalSummary();
    updateProgressDisplay();
}

function updateMealSummaries() {
    Object.entries(dailyLog.meals).forEach(([mealType, data]) => {
        const summary = document.getElementById(`${mealType}-summary`);
        if (summary) {
            summary.querySelector('p').innerHTML = 
                `Calories: <span>${data.calories}</span> | ` +
                `Protein: <span>${data.protein.toFixed(1)}g</span> | ` +
                `Carbs: <span>${data.carbs.toFixed(1)}g</span> | ` +
                `Fat: <span>${data.fat.toFixed(1)}g</span>`;
        }
    });
}

function updateExerciseLog() {
    const exerciseList = document.getElementById('exercise-log-list');
    if (exerciseList) {
        exerciseList.innerHTML = dailyLog.exercises.map(exercise => `
            <div class="log-item">
                <span>${exercise.name} (${exercise.duration} min, ${exercise.intensity})</span>
                <span>${exercise.caloriesBurned} cal</span>
            </div>
        `).join('');
    }
}

function updateTotalSummary() {
    document.getElementById('calories-consumed').textContent = dailyLog.totalCaloriesConsumed;
    document.getElementById('calories-burned').textContent = dailyLog.totalCaloriesBurned;
    document.getElementById('net-calories').textContent = 
        dailyLog.totalCaloriesConsumed - dailyLog.totalCaloriesBurned;

    document.getElementById('protein').textContent = `${dailyLog.macros.protein.toFixed(1)}g`;
    document.getElementById('carbs').textContent = `${dailyLog.macros.carbs.toFixed(1)}g`;
    document.getElementById('fat').textContent = `${dailyLog.macros.fat.toFixed(1)}g`;
}

function updateProgressDisplay() {
    if (userProfile) {
        document.getElementById('starting-weight').textContent = userProfile.startingWeight;
        document.getElementById('current-weight').textContent = userProfile.currentWeight;
        document.getElementById('weight-goal').textContent = userProfile.weightGoal;
    }
}

// Utility Functions
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
    if (datalist) {
        datalist.innerHTML = Object.keys(foodDatabase)
            .map(food => `<option value="${food}">`)
            .join('');
    }
}

function populateExerciseList() {
    const datalist = document.getElementById('exercise-list');
    if (datalist) {
        datalist.innerHTML = Object.keys(exerciseDatabase)
            .map(exercise => `<option value="${exercise}">`)
            .join('');
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
        if (userProfile) {
            Object.entries(userProfile).forEach(([key, value]) => {
                const input = document.getElementById(key);
                if (input) input.value = value;
            });
        }
    }

    if (savedLog) {
        const loadedLog = JSON.parse(savedLog);
        if (loadedLog.date === new Date().toISOString().split('T')[0]) {
            dailyLog = loadedLog;
        }
    }
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`${tabName}-tab`);
    
    if (selectedBtn) selectedBtn.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
}