// Exercise Database
const exerciseDatabase = {
    // Cardio Exercises
    "running": {
        caloriesPerHour: 600,
        type: "cardio",
        intensity: "high",
        muscleGroups: ["legs", "core"],
        description: "Running at moderate pace"
    },
    "cycling": {
        caloriesPerHour: 450,
        type: "cardio",
        intensity: "moderate",
        muscleGroups: ["legs"],
        description: "Cycling at moderate pace"
    },
    "swimming": {
        caloriesPerHour: 500,
        type: "cardio",
        intensity: "moderate",
        muscleGroups: ["full body"],
        description: "Swimming laps"
    },
    "walking": {
        caloriesPerHour: 250,
        type: "cardio",
        intensity: "low",
        muscleGroups: ["legs"],
        description: "Walking at brisk pace"
    },
    "jumping rope": {
        caloriesPerHour: 700,
        type: "cardio",
        intensity: "high",
        muscleGroups: ["legs", "shoulders"],
        description: "Jumping rope continuously"
    },

    // Strength Training - Upper Body
    "push-ups": {
        caloriesPerHour: 400,
        type: "strength",
        intensity: "moderate",
        muscleGroups: ["chest", "shoulders", "triceps"],
        description: "Standard push-ups"
    },
    "pull-ups": {
        caloriesPerHour: 400,
        type: "strength",
        intensity: "high",
        muscleGroups: ["back", "biceps"],
        description: "Standard pull-ups"
    },
    "bench press": {
        caloriesPerHour: 350,
        type: "strength",
        intensity: "high",
        muscleGroups: ["chest", "shoulders", "triceps"],
        description: "Barbell bench press"
    },
    "shoulder press": {
        caloriesPerHour: 300,
        type: "strength",
        intensity: "moderate",
        muscleGroups: ["shoulders", "triceps"],
        description: "Overhead press with dumbbells"
    },

    // Strength Training - Lower Body
    "squats": {
        caloriesPerHour: 450,
        type: "strength",
        intensity: "high",
        muscleGroups: ["legs", "core"],
        description: "Standard bodyweight squats"
    },
    "lunges": {
        caloriesPerHour: 400,
        type: "strength",
        intensity: "moderate",
        muscleGroups: ["legs"],
        description: "Walking lunges"
    },
    "deadlifts": {
        caloriesPerHour: 500,
        type: "strength",
        intensity: "high",
        muscleGroups: ["back", "legs", "core"],
        description: "Barbell deadlifts"
    },

    // Core Exercises
    "planks": {
        caloriesPerHour: 250,
        type: "strength",
        intensity: "moderate",
        muscleGroups: ["core"],
        description: "Standard plank hold"
    },
    "crunches": {
        caloriesPerHour: 200,
        type: "strength",
        intensity: "low",
        muscleGroups: ["core"],
        description: "Standard crunches"
    },

    // Flexibility & Balance
    "yoga": {
        caloriesPerHour: 250,
        type: "flexibility",
        intensity: "low",
        muscleGroups: ["full body"],
        description: "General yoga practice"
    },
    "stretching": {
        caloriesPerHour: 150,
        type: "flexibility",
        intensity: "low",
        muscleGroups: ["full body"],
        description: "Dynamic stretching routine"
    },

    // HIIT
    "burpees": {
        caloriesPerHour: 700,
        type: "cardio",
        intensity: "high",
        muscleGroups: ["full body"],
        description: "Full burpees with push-up"
    },
    "mountain climbers": {
        caloriesPerHour: 600,
        type: "cardio",
        intensity: "high",
        muscleGroups: ["core", "shoulders"],
        description: "Mountain climbers exercise"
    },

    // Sports
    "basketball": {
        caloriesPerHour: 500,
        type: "cardio",
        intensity: "moderate",
        muscleGroups: ["full body"],
        description: "Playing basketball"
    },
    "tennis": {
        caloriesPerHour: 450,
        type: "cardio",
        intensity: "moderate",
        muscleGroups: ["full body"],
        description: "Playing tennis"
    }
};

// Exercise categories for organization and filtering
const exerciseCategories = {
    "cardio": ["running", "cycling", "swimming", "walking", "jumping rope", "burpees", "mountain climbers"],
    "strength_upper": ["push-ups", "pull-ups", "bench press", "shoulder press"],
    "strength_lower": ["squats", "lunges", "deadlifts"],
    "core": ["planks", "crunches"],
    "flexibility": ["yoga", "stretching"],
    "sports": ["basketball", "tennis"]
};

// Intensity multipliers for calorie calculations
const intensityMultipliers = {
    "low": 0.8,
    "moderate": 1.0,
    "high": 1.2
};

// Helper function to get exercise data
function getExerciseData(exerciseName) {
    const normalizedName = exerciseName.toLowerCase().trim();
    return exerciseDatabase[normalizedName] || null;
}

// Helper function to get exercise type
function getExerciseType(exerciseName) {
    const exerciseData = getExerciseData(exerciseName);
    return exerciseData ? exerciseData.type : null;
}

// Helper function to get exercises by category
function getExercisesByCategory(category) {
    return exerciseCategories[category] || [];
}

// Helper function to search exercises
function searchExercises(query) {
    const normalizedQuery = query.toLowerCase().trim();
    return Object.keys(exerciseDatabase).filter(exercise => 
        exercise.includes(normalizedQuery)
    );
}

// Helper function to calculate calories burned
function calculateCaloriesBurned(exerciseName, durationMinutes, intensityLevel) {
    const exerciseData = getExerciseData(exerciseName);
    if (!exerciseData) return null;

    const baseCaloriesPerHour = exerciseData.caloriesPerHour;
    const intensityMultiplier = intensityMultipliers[intensityLevel] || 1;
    const hours = durationMinutes / 60;

    return Math.round(baseCaloriesPerHour * hours * intensityMultiplier);
}

// Helper function to get exercise recommendations based on muscle groups
function getExercisesForMuscleGroup(muscleGroup) {
    return Object.entries(exerciseDatabase)
        .filter(([_, data]) => data.muscleGroups.includes(muscleGroup))
        .map(([name, _]) => name);
}

// Helper function to get a full workout routine
function generateWorkoutRoutine(type, duration, intensity) {
    let exercises = [];
    
    switch(type) {
        case "cardio":
            exercises = getExercisesByCategory("cardio");
            break;
        case "strength":
            exercises = [
                ...getExercisesByCategory("strength_upper"),
                ...getExercisesByCategory("strength_lower")
            ];
            break;
        case "full_body":
            exercises = [
                ...getExercisesByCategory("cardio").slice(0, 2),
                ...getExercisesByCategory("strength_upper").slice(0, 2),
                ...getExercisesByCategory("strength_lower").slice(0, 2),
                ...getExercisesByCategory("core")
            ];
            break;
    }

    return exercises
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map(exercise => ({
            name: exercise,
            duration: Math.round(duration / 5),
            intensity: intensity
        }));
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getExerciseData,
        getExerciseType,
        getExercisesByCategory,
        searchExercises,
        calculateCaloriesBurned,
        getExercisesForMuscleGroup,
        generateWorkoutRoutine
    };
}