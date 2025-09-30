// Enhanced Meal and Exercise Tracking

// Initialize daily tracking data
const initializeDailyLog = () => {
    return {
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
};

let dailyLog = initializeDailyLog();
let userProfile = null;

// Event Handlers
document.getElementById('food-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const food = document.getElementById('food').value.toLowerCase();
    const portion = parseFloat(document.getElementById('portion').value);
    const mealTime = document.getElementById('meal-time').value;

    if (foodDatabase[food]) {
        const scale = portion / 100; // Convert to 100g portions
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
        this.reset();
        updateAllDisplays();
    }
});

// Add food entry to daily log
function addFoodEntry(entry, mealType) {
    dailyLog.meals[mealType].foods.push(entry);
    dailyLog.meals[mealType].calories += entry.calories;
    dailyLog.meals[mealType].protein += entry.protein;
    dailyLog.meals[mealType].carbs += entry.carbs;
    dailyLog.meals[mealType].fat += entry.fat;

    updateTotalNutrients();
    updateMealSummaries();
    saveToLocalStorage();
}

// Update total nutrients
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

// Update meal summaries
function updateMealSummaries() {
    Object.entries(dailyLog.meals).forEach(([mealType, data]) => {
        const summary = document.querySelector(`#${mealType}-summary`);
        if (summary) {
            const spans = summary.querySelectorAll('span');
            spans[0].textContent = data.calories;
            spans[1].textContent = data.protein.toFixed(1);
            spans[2].textContent = data.carbs.toFixed(1);
            spans[3].textContent = data.fat.toFixed(1);
        }
    });
}

// Update progress bars
function updateProgressBars() {
    if (!userProfile?.nutrientGoals) return;

    const goals = userProfile.nutrientGoals;
    const current = dailyLog.macros;

    // Update main progress bars
    updateProgressBar('protein-progress', (current.protein / goals.protein) * 100);
    updateProgressBar('carbs-progress', (current.carbs / goals.carbs) * 100);
    updateProgressBar('fat-progress', (current.fat / goals.fat) * 100);
    updateProgressBar('calorie-progress', (dailyLog.totalCaloriesConsumed / goals.calories) * 100);

    // Update meal distribution
    Object.entries(dailyLog.meals).forEach(([meal, data]) => {
        const percentage = (data.calories / goals.calories) * 100;
        updateProgressBar(`${meal}-progress`, percentage);
    });
}

function updateProgressBar(id, percentage) {
    const bar = document.getElementById(id);
    if (bar) {
        bar.style.width = `${Math.min(percentage, 100)}%`;
    }
}

// Calculate nutrient targets
function calculateNutrientTargets(profile) {
    const tdee = calculateTDEE(
        calculateBMR(profile.weight, profile.height, profile.age, profile.gender),
        profile.activity
    );

    const goalCalories = calculateCalorieGoal(tdee, profile.goal);
    
    // Calculate macro targets
    const proteinPerKg = profile.goal === 'gain' ? 2.2 : 2.0; // Higher protein for muscle gain
    const proteinGrams = profile.weight * proteinPerKg;
    const proteinCalories = proteinGrams * 4;
    
    const fatCalories = goalCalories * 0.25; // 25% of calories from fat
    const fatGrams = fatCalories / 9;
    
    const carbCalories = goalCalories - proteinCalories - fatCalories;
    const carbGrams = carbCalories / 4;

    return {
        calories: goalCalories,
        protein: Math.round(proteinGrams),
        carbs: Math.round(carbGrams),
        fat: Math.round(fatGrams)
    };
}

// Update all displays
function updateAllDisplays() {
    updateMealSummaries();
    updateProgressBars();
    updateTotalDisplay();
}

// Update total display
function updateTotalDisplay() {
    const netCalories = dailyLog.totalCaloriesConsumed - dailyLog.totalCaloriesBurned;
    const calorieGoal = userProfile?.nutrientGoals?.calories || 2000;
    const remaining = calorieGoal - netCalories;

    document.getElementById('calories-consumed').textContent = dailyLog.totalCaloriesConsumed;
    document.getElementById('calories-burned').textContent = dailyLog.totalCaloriesBurned;
    document.getElementById('net-calories').textContent = netCalories;
    document.getElementById('remaining-calories').textContent = remaining;

    // Update macro totals
    document.getElementById('protein').textContent = `${dailyLog.macros.protein.toFixed(1)}g`;
    document.getElementById('carbs').textContent = `${dailyLog.macros.carbs.toFixed(1)}g`;
    document.getElementById('fat').textContent = `${dailyLog.macros.fat.toFixed(1)}g`;
}

// Save and load functions
function saveToLocalStorage() {
    localStorage.setItem('dailyLog', JSON.stringify(dailyLog));
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

function loadFromLocalStorage() {
    const savedLog = localStorage.getItem('dailyLog');
    const savedProfile = localStorage.getItem('userProfile');

    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        if (!userProfile.nutrientGoals) {
            userProfile.nutrientGoals = calculateNutrientTargets(userProfile);
        }
    }

    if (savedLog) {
        const loadedLog = JSON.parse(savedLog);
        if (loadedLog.date === new Date().toISOString().split('T')[0]) {
            dailyLog = loadedLog;
        } else {
            dailyLog = initializeDailyLog();
        }
    }

    updateAllDisplays();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    populateFoodList();
    updateAllDisplays();
});