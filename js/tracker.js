// Event Handlers
document.getElementById('profile-form').addEventListener('submit', function(e) {
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
    
    userProfile = formData;
    updateProfile(formData);
    saveToLocalStorage();
});

document.getElementById('food-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const food = document.getElementById('food').value.toLowerCase();
    const portion = parseFloat(document.getElementById('portion').value);
    const mealTime = document.getElementById('meal-time').value;

    if (foodDatabase[food]) {
        const foodEntry = {
            name: food,
            portion: portion,
            mealTime: mealTime,
            calories: Math.round((foodDatabase[food].calories * portion) / 100),
            protein: (foodDatabase[food].protein * portion) / 100,
            carbs: (foodDatabase[food].carbs * portion) / 100,
            fat: (foodDatabase[food].fat * portion) / 100,
            timestamp: new Date().toISOString()
        };

        addFoodEntry(foodEntry);
        this.reset();
        updateUI();
    }
});

document.getElementById('exercise-form').addEventListener('submit', function(e) {
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
        this.reset();
        updateUI();
    }
});

// Data Management Functions
function addFoodEntry(entry) {
    dailyLog.foods.push(entry);
    dailyLog.totalCaloriesConsumed += entry.calories;
    dailyLog.macros.protein += entry.protein;
    dailyLog.macros.carbs += entry.carbs;
    dailyLog.macros.fat += entry.fat;
    saveToLocalStorage();
}

function addExerciseEntry(entry) {
    dailyLog.exercises.push(entry);
    dailyLog.totalCaloriesBurned += entry.caloriesBurned;
    saveToLocalStorage();
}

function updateProfile(profile) {
    const bmi = calculateBMI(profile.weight, profile.height);
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activity);
    const calorieGoal = calculateCalorieGoal(tdee, profile.goal);

    document.getElementById('bmi').textContent = bmi;
    document.getElementById('calorie-goal').textContent = calorieGoal;

    // Update progress tracking
    if (profile.weight) {
        const today = new Date().toISOString().split('T')[0];
        dailyLog.weightLog.push({
            date: today,
            weight: profile.weight
        });
    }
}

// UI Update Functions
function updateUI() {
    updateFoodLog();
    updateExerciseLog();
    updateDailySummary();
    updateProgressChart();
}

function updateProgressChart() {
    // Implementation for chart update using dailyLog.weightLog
    // This would use a charting library like Chart.js
    const progressSection = document.getElementById('progress-section');
    if (dailyLog.weightLog.length > 0) {
        const latest = dailyLog.weightLog[dailyLog.weightLog.length - 1];
        const first = dailyLog.weightLog[0];
        
        document.getElementById('starting-weight').textContent = first.weight + ' kg';
        document.getElementById('current-weight').textContent = latest.weight + ' kg';
        // Add chart implementation here
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
        updateProfile(userProfile);
    }

    if (savedLog) {
        const loadedLog = JSON.parse(savedLog);
        // Only load today's log
        if (loadedLog.date === new Date().toISOString().split('T')[0]) {
            dailyLog = loadedLog;
            updateUI();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    populateFoodList();
    populateExerciseList();
});

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