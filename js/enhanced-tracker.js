// Enhanced Food and Exercise Tracking with BMI Calculator

// Global State Management
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

// Nutrition Goals Calculator
function calculateNutritionGoals(profile) {
    const bmi = calculateBMI(profile.weight, profile.height);
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activity);
    
    // Calculate protein needs based on goal and body weight
    let proteinPerKg;
    if (profile.goal === 'gain') {
        proteinPerKg = 2.2; // Higher protein for muscle gain
    } else if (profile.goal === 'lose') {
        proteinPerKg = 2.0; // Moderate protein for weight loss
    } else {
        proteinPerKg = 1.8; // Maintenance protein
    }
    
    const proteinGrams = profile.weight * proteinPerKg;
    const proteinCalories = proteinGrams * 4;
    
    // Calculate fat needs (25-30% of total calories)
    const fatCalories = tdee * 0.27; // 27% of calories from fat
    const fatGrams = fatCalories / 9;
    
    // Remaining calories from carbs
    const carbCalories = tdee - (proteinCalories + fatCalories);
    const carbGrams = carbCalories / 4;
    
    return {
        calories: tdee,
        adjustedCalories: calculateCalorieGoal(tdee, profile.goal),
        protein: Math.round(proteinGrams),
        carbs: Math.round(carbGrams),
        fat: Math.round(fatGrams),
        bmi: bmi
    };
}

// BMI Calculator
function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// BMR Calculator using Mifflin-St Jeor Equation
function calculateBMR(weight, height, age, gender) {
    const base = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'male' ? base + 5 : base - 161;
}

// TDEE Calculator
function calculateTDEE(bmr, activityLevel) {
    return Math.round(bmr * parseFloat(activityLevel));
}

// Calorie Goal Calculator
function calculateCalorieGoal(tdee, goal) {
    switch(goal) {
        case 'lose': return tdee - 500; // 500 calorie deficit
        case 'gain': return tdee + 500; // 500 calorie surplus
        default: return tdee;
    }
}

// Event Handlers
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupEventListeners();
    populateFoodList();
    populateExerciseList();
    updateAllDisplays();
});

function setupEventListeners() {
    // Profile Form
    document.getElementById('profile-form').addEventListener('submit', handleProfileSubmit);
    
    // Food Form
    document.getElementById('food-form').addEventListener('submit', handleFoodSubmit);
    
    // Exercise Form
    document.getElementById('exercise-form').addEventListener('submit', handleExerciseSubmit);
    
    // Quick Add Food Buttons
    setupQuickAddButtons();
}

// Food Entry Handling
function handleFoodSubmit(e) {
    e.preventDefault();
    const food = document.getElementById('food').value.toLowerCase();
    const portion = parseFloat(document.getElementById('portion').value);
    const mealType = document.getElementById('meal-time').value;

    if (foodDatabase[food]) {
        addFoodToMeal(food, portion, mealType);
        e.target.reset();
        document.getElementById('food').focus();
    }
}

function addFoodToMeal(foodName, portion, mealType) {
    const food = foodDatabase[foodName];
    const scale = portion / 100; // Convert to 100g portions
    
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

    // Update overall totals
    updateTotalNutrients();
    updateAllDisplays();
    saveToLocalStorage();
}

// Profile Handling
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

    userProfile = formData;
    const goals = calculateNutritionGoals(formData);
    userProfile.nutrientGoals = goals;
    
    // Initialize weight tracking
    if (!userProfile.startingWeight) {
        userProfile.startingWeight = formData.weight;
        userProfile.weightLog = [{
            date: new Date().toISOString().split('T')[0],
            weight: formData.weight
        }];
    }
    
    updateProfile();
    saveToLocalStorage();
}

// Display Updates
function updateAllDisplays() {
    updateMealSummaries();
    updateDailyTotals();
    updateProgress();
    updateBMI();
    updateNutrientGoals();
}

function updateMealSummaries() {
    Object.entries(dailyLog.meals).forEach(([mealType, data]) => {
        const summaryDiv = document.getElementById(`${mealType}-summary`);
        if (summaryDiv) {
            // Update meal totals
            summaryDiv.querySelector('.meal-total').textContent = 
                `Total: ${data.calories} cal | P: ${data.protein.toFixed(1)}g | C: ${data.carbs.toFixed(1)}g | F: ${data.fat.toFixed(1)}g`;
            
            // Update food list
            const foodList = summaryDiv.querySelector('.meal-items');
            if (foodList) {
                foodList.innerHTML = data.foods.map(food => `
                    <div class="food-item">
                        <span>${food.name} (${food.portion}g)</span>
                        <span>${food.calories} cal | P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fat}g</span>
                    </div>
                `).join('');
            }
        }
    });
}

function updateDailyTotals() {
    if (!userProfile?.nutrientGoals) return;

    const goals = userProfile.nutrientGoals;
    document.getElementById('calories-consumed').textContent = dailyLog.totalCaloriesConsumed;
    document.getElementById('calories-burned').textContent = dailyLog.totalCaloriesBurned;
    document.getElementById('net-calories').textContent = 
        dailyLog.totalCaloriesConsumed - dailyLog.totalCaloriesBurned;
    document.getElementById('calories-remaining').textContent = 
        goals.adjustedCalories - (dailyLog.totalCaloriesConsumed - dailyLog.totalCaloriesBurned);

    // Update macros with progress
    updateMacroDisplay('protein', dailyLog.macros.protein, goals.protein);
    updateMacroDisplay('carbs', dailyLog.macros.carbs, goals.carbs);
    updateMacroDisplay('fat', dailyLog.macros.fat, goals.fat);
}

function updateMacroDisplay(macro, current, goal) {
    const element = document.getElementById(macro);
    const progress = (current / goal) * 100;
    element.innerHTML = `
        <div class="macro-label">${macro.charAt(0).toUpperCase() + macro.slice(1)}</div>
        <div class="macro-values">${current.toFixed(1)}g / ${goal}g</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
        </div>
    `;
}

function updateBMI() {
    if (userProfile) {
        const bmi = calculateBMI(userProfile.weight, userProfile.height);
        document.getElementById('bmi').textContent = bmi;
        
        // Update BMI category
        let category;
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 25) category = 'Normal weight';
        else if (bmi < 30) category = 'Overweight';
        else category = 'Obese';
        
        document.getElementById('bmi-category').textContent = category;
    }
}

function updateProgress() {
    if (userProfile?.weightLog?.length) {
        const latest = userProfile.weightLog[userProfile.weightLog.length - 1];
        
        document.getElementById('starting-weight').textContent = 
            `${userProfile.startingWeight.toFixed(1)} kg`;
        document.getElementById('current-weight').textContent = 
            `${latest.weight.toFixed(1)} kg`;
        document.getElementById('weight-goal').textContent = 
            `${userProfile.weightGoal.toFixed(1)} kg`;
            
        // Calculate and display progress
        const totalChange = latest.weight - userProfile.startingWeight;
        const progressElement = document.getElementById('weight-progress');
        if (progressElement) {
            progressElement.textContent = `${Math.abs(totalChange).toFixed(1)} kg ${totalChange > 0 ? 'gained' : 'lost'}`;
        }
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
        fillProfileForm(userProfile);
    }

    if (savedLog) {
        const loadedLog = JSON.parse(savedLog);
        if (loadedLog.date === new Date().toISOString().split('T')[0]) {
            dailyLog = loadedLog;
        }
    }
}

// Utility Functions
function fillProfileForm(profile) {
    Object.entries(profile).forEach(([key, value]) => {
        const input = document.getElementById(key);
        if (input && typeof value !== 'object') {
            input.value = value;
        }
    });
}

// Initialize
setupEventListeners();