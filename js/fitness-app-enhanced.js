// Global state
let state = {
    profile: null,
    meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
    },
    exercises: [],
    waterIntake: 0,
    dailyStats: {
        caloriesConsumed: 0,
        caloriesBurned: 0,
        calorieGoal: 0,
        macros: {
            protein: 0,
            carbs: 0,
            fat: 0
        }
    }
};

// Charts
let weightChart, caloriesTrendChart, macrosChart, exerciseChart;

// Check localStorage availability
function isLocalStorageAvailable() {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    if (!isLocalStorageAvailable()) {
        alert('Local storage is not available. Your data will not be saved between sessions.');
        return;
    }
    initializeCharts();
    initializeCalendar();
    loadProfile();
    setupEventListeners();
    updateUI();
});

// Event Listeners Setup
function setupEventListeners() {
    // Profile form submission
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            saveProfile();
            alert('Profile saved successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('There was an error saving your profile. Please try again.');
        }
    });

    // Goal cards selection
    document.querySelectorAll('.goal-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('goal').value = card.dataset.goal;
        });
    });

    // Food form submission
    document.getElementById('food-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addFood();
    });

    // Exercise form submission
    document.getElementById('exercise-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addExercise();
    });

    // Chat input
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Profile Management
function saveProfile() {
    const profile = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        weight: parseFloat(document.getElementById('weight').value),
        height: parseInt(document.getElementById('height').value),
        activity: parseFloat(document.getElementById('activity').value),
        goal: document.getElementById('goal').value
    };

    state.profile = profile;
    localStorage.setItem('profile', JSON.stringify(profile));
    
    // Calculate and update stats
    calculateBMI();
    calculateCalorieGoal();
    updateUI();
}

function loadProfile() {
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
        state.profile = JSON.parse(savedProfile);
        document.getElementById('name').value = state.profile.name;
        document.getElementById('age').value = state.profile.age;
        document.getElementById('gender').value = state.profile.gender;
        document.getElementById('weight').value = state.profile.weight;
        document.getElementById('height').value = state.profile.height;
        document.getElementById('activity').value = state.profile.activity;
        
        const goalCard = document.querySelector(`.goal-card[data-goal="${state.profile.goal}"]`);
        if (goalCard) {
            goalCard.classList.add('selected');
            document.getElementById('goal').value = state.profile.goal;
        }

        calculateBMI();
        calculateCalorieGoal();
    }
}

// BMI Calculation
function calculateBMI() {
    if (!state.profile) return;

    const height = state.profile.height / 100; // convert cm to m
    const bmi = state.profile.weight / (height * height);
    let category = '';

    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    document.getElementById('bmi').textContent = bmi.toFixed(1);
    document.getElementById('bmi-category').textContent = category;
}

// Calorie Goal Calculation
function calculateCalorieGoal() {
    if (!state.profile) return;

    // Mifflin-St Jeor Formula
    let bmr;
    if (state.profile.gender === 'male') {
        bmr = 10 * state.profile.weight + 6.25 * state.profile.height - 5 * state.profile.age + 5;
    } else {
        bmr = 10 * state.profile.weight + 6.25 * state.profile.height - 5 * state.profile.age - 161;
    }

    // Adjust for activity level
    let tdee = bmr * state.profile.activity;

    // Adjust for goal
    switch(state.profile.goal) {
        case 'lose':
            tdee -= 500; // 500 calorie deficit
            break;
        case 'gain':
            tdee += 500; // 500 calorie surplus
            break;
        // maintain stays at TDEE
    }

    state.dailyStats.calorieGoal = Math.round(tdee);
    updateUI();
}

// Food Management
function addFood() {
    const food = document.getElementById('food').value;
    const portion = parseInt(document.getElementById('portion').value);
    const mealTime = document.getElementById('meal-time').value;

    // Get food data from database (assumes foodDatabase.js is loaded)
    const foodData = getFoodData(food);
    if (!foodData) return;

    const calories = (foodData.calories * portion) / 100;
    const protein = (foodData.protein * portion) / 100;
    const carbs = (foodData.carbs * portion) / 100;
    const fat = (foodData.fat * portion) / 100;

    const meal = {
        food,
        portion,
        calories,
        protein,
        carbs,
        fat,
        timestamp: new Date()
    };

    state.meals[mealTime].push(meal);
    updateMealDisplay(mealTime);
    updateCalorieStats();
    updateMacroStats();
    saveMeals();

    // Reset form
    document.getElementById('food-form').reset();
}

function updateMealDisplay(mealTime) {
    const container = document.getElementById(`${mealTime}-items`);
    container.innerHTML = '';

    state.meals[mealTime].forEach((meal, index) => {
        const card = document.createElement('div');
        card.className = 'meal-card card mb-2';
        card.innerHTML = `
            <div class="card-body py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${meal.food}</h6>
                        <small class="text-muted">${meal.portion}g</small>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">${Math.round(meal.calories)} cal</div>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeMeal('${mealTime}', ${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function removeMeal(mealTime, index) {
    state.meals[mealTime].splice(index, 1);
    updateMealDisplay(mealTime);
    updateCalorieStats();
    updateMacroStats();
    saveMeals();
}

// Exercise Management
function addExercise() {
    const exercise = document.getElementById('exercise').value;
    const duration = parseInt(document.getElementById('duration').value);
    const intensity = document.getElementById('intensity').value;

    // Get exercise data from database (assumes exerciseDatabase.js is loaded)
    const exerciseData = getExerciseData(exercise);
    if (!exerciseData) return;

    // Calculate calories based on intensity
    let intensityMultiplier;
    switch(intensity) {
        case 'low': intensityMultiplier = 0.8; break;
        case 'moderate': intensityMultiplier = 1; break;
        case 'high': intensityMultiplier = 1.2; break;
        default: intensityMultiplier = 1;
    }

    const caloriesBurned = Math.round(exerciseData.caloriesPerHour * (duration / 60) * intensityMultiplier);

    const exerciseEntry = {
        exercise,
        duration,
        intensity,
        caloriesBurned,
        timestamp: new Date()
    };

    state.exercises.push(exerciseEntry);
    updateExerciseDisplay();
    updateCalorieStats();
    saveExercises();

    // Reset form
    document.getElementById('exercise-form').reset();
}

function updateExerciseDisplay() {
    const container = document.getElementById('exercise-items');
    container.innerHTML = '';

    state.exercises.forEach((exercise, index) => {
        const card = document.createElement('div');
        card.className = 'exercise-card card mb-2';
        card.innerHTML = `
            <div class="card-body py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${exercise.exercise}</h6>
                        <small class="text-muted">${exercise.duration} min - ${exercise.intensity}</small>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">-${exercise.caloriesBurned} cal</div>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeExercise(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function removeExercise(index) {
    state.exercises.splice(index, 1);
    updateExerciseDisplay();
    updateCalorieStats();
    saveExercises();
}

// Stats Management
function updateCalorieStats() {
    // Calculate consumed calories
    state.dailyStats.caloriesConsumed = Object.values(state.meals)
        .flat()
        .reduce((total, meal) => total + meal.calories, 0);

    // Calculate burned calories
    state.dailyStats.caloriesBurned = state.exercises
        .reduce((total, exercise) => total + exercise.caloriesBurned, 0);

    updateUI();
}

function updateMacroStats() {
    state.dailyStats.macros = Object.values(state.meals)
        .flat()
        .reduce((totals, meal) => {
            totals.protein += meal.protein;
            totals.carbs += meal.carbs;
            totals.fat += meal.fat;
            return totals;
        }, { protein: 0, carbs: 0, fat: 0 });

    updateUI();
}

// Water Intake Management
function addWater() {
    state.waterIntake = Math.min(state.waterIntake + 1, 8);
    updateUI();
    localStorage.setItem('waterIntake', state.waterIntake.toString());
}

// Chart Initialization
function initializeCharts() {
    // Weight Progress Chart
    const weightCtx = document.getElementById('weight-chart').getContext('2d');
    weightChart = new Chart(weightCtx, {
        type: 'line',
        data: {
            labels: ['1 Week Ago', '6 Days Ago', '5 Days Ago', '4 Days Ago', '3 Days Ago', 'Yesterday', 'Today'],
            datasets: [{
                label: 'Weight (kg)',
                data: [70, 69.8, 69.5, 69.3, 69.1, 68.9, 68.7],
                borderColor: '#007bff',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false }
            }
        }
    });

    // Calories Trend Chart
    const caloriesCtx = document.getElementById('calories-trend-chart').getContext('2d');
    caloriesTrendChart = new Chart(caloriesCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Calories Consumed',
                    data: [2100, 2300, 1950, 2200, 2400, 1800, 2000],
                    backgroundColor: '#28a745'
                },
                {
                    label: 'Calories Burned',
                    data: [2300, 2500, 2100, 2400, 2600, 2000, 2200],
                    backgroundColor: '#dc3545'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Macros Chart
    const macrosCtx = document.getElementById('macros-chart').getContext('2d');
    macrosChart = new Chart(macrosCtx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                data: [25, 50, 25],
                backgroundColor: ['#007bff', '#28a745', '#ffc107']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Exercise Distribution Chart
    const exerciseCtx = document.getElementById('exercise-chart').getContext('2d');
    exerciseChart = new Chart(exerciseCtx, {
        type: 'pie',
        data: {
            labels: ['Cardio', 'Strength', 'Flexibility'],
            datasets: [{
                data: [40, 40, 20],
                backgroundColor: ['#dc3545', '#007bff', '#28a745']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Calendar Initialization
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
            // Sample events
            {
                title: 'Gym Session',
                start: '2023-11-15T10:00:00',
                end: '2023-11-15T11:30:00'
            }
        ],
        eventClick: function(info) {
            // Handle event click
        },
        dateClick: function(info) {
            // Handle date click
        }
    });
    calendar.render();
}

// UI Updates
function updateUI() {
    // Update calorie displays
    document.getElementById('calorie-goal').textContent = state.dailyStats.calorieGoal;
    document.getElementById('calories-consumed').textContent = Math.round(state.dailyStats.caloriesConsumed);
    document.getElementById('calories-burned').textContent = Math.round(state.dailyStats.caloriesBurned);

    // Calculate remaining calories
    const remaining = state.dailyStats.calorieGoal + state.dailyStats.caloriesBurned - state.dailyStats.caloriesConsumed;
    document.getElementById('calories-remaining').textContent = Math.round(remaining);

    // Update progress bar
    const progress = (state.dailyStats.caloriesConsumed / state.dailyStats.calorieGoal) * 100;
    const progressBar = document.getElementById('calories-progress');
    progressBar.style.width = `${Math.min(progress, 100)}%`;
    progressBar.className = `progress-bar ${progress > 100 ? 'bg-danger' : 'bg-success'}`;

    // Update water intake
    document.getElementById('water-intake').textContent = `${state.waterIntake}/8`;
    document.getElementById('water-progress').style.width = `${(state.waterIntake / 8) * 100}%`;

    // Update charts
    updateCharts();
}

function updateCharts() {
    if (!macrosChart) return;

    // Update macros chart
    const macros = state.dailyStats.macros;
    const total = macros.protein + macros.carbs + macros.fat;
    if (total > 0) {
        macrosChart.data.datasets[0].data = [
            (macros.protein / total) * 100,
            (macros.carbs / total) * 100,
            (macros.fat / total) * 100
        ];
        macrosChart.update();
    }

    // Update exercise distribution
    const exerciseTypes = state.exercises.reduce((acc, exercise) => {
        const type = getExerciseType(exercise.exercise);
        acc[type] = (acc[type] || 0) + exercise.caloriesBurned;
        return acc;
    }, {});

    exerciseChart.data.labels = Object.keys(exerciseTypes);
    exerciseChart.data.datasets[0].data = Object.values(exerciseTypes);
    exerciseChart.update();
}

// Helper Functions
function getExerciseType(exercise) {
    // This should be implemented based on your exercise database
    return 'Cardio'; // placeholder
}

// Local Storage
function saveMeals() {
    try {
        localStorage.setItem('meals', JSON.stringify(state.meals));
        console.log('Meals saved successfully');
    } catch (error) {
        console.error('Error saving meals:', error);
    }
}

function saveExercises() {
    try {
        localStorage.setItem('exercises', JSON.stringify(state.exercises));
        console.log('Exercises saved successfully');
    } catch (error) {
        console.error('Error saving exercises:', error);
    }
}

// Save profile with error handling
function saveProfile() {
    try {
        const profile = {
            name: document.getElementById('name').value,
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            weight: parseFloat(document.getElementById('weight').value),
            height: parseInt(document.getElementById('height').value),
            activity: parseFloat(document.getElementById('activity').value),
            goal: document.getElementById('goal').value
        };

        state.profile = profile;
        localStorage.setItem('profile', JSON.stringify(profile));
        console.log('Profile saved successfully');
        
        // Calculate and update stats
        calculateBMI();
        calculateCalorieGoal();
        updateUI();

        // Update AI assistant with new profile
        if (window.fitnessAssistant) {
            fitnessAssistant.updateUserProfile(profile);
        }

        // Show success message
        alert('Profile saved successfully!');
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile. Please try again.');
    }
}

// Load saved data on startup with error handling
function loadSavedData() {
    try {
        // Load meals
        const savedMeals = localStorage.getItem('meals');
        if (savedMeals) {
            state.meals = JSON.parse(savedMeals);
            Object.keys(state.meals).forEach(mealTime => {
                updateMealDisplay(mealTime);
            });
            console.log('Meals loaded successfully');
        }

        // Load exercises
        const savedExercises = localStorage.getItem('exercises');
        if (savedExercises) {
            state.exercises = JSON.parse(savedExercises);
            updateExerciseDisplay();
            console.log('Exercises loaded successfully');
        }

        // Load water intake
        const savedWaterIntake = localStorage.getItem('waterIntake');
        if (savedWaterIntake) {
            state.waterIntake = parseInt(savedWaterIntake);
            console.log('Water intake loaded successfully');
        }

        updateCalorieStats();
        updateMacroStats();
        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading saved data:', error);
        alert('Error loading saved data. Some features might not work properly.');
    }
}

// Auto-save data periodically
setInterval(() => {
    if (state.profile) {
        localStorage.setItem('profile', JSON.stringify(state.profile));
    }
    if (Object.keys(state.meals).some(meal => state.meals[meal].length > 0)) {
        saveMeals();
    }
    if (state.exercises.length > 0) {
        saveExercises();
    }
    localStorage.setItem('waterIntake', state.waterIntake.toString());
}, 30000); // Auto-save every 30 seconds