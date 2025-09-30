const workoutDatabase = {
    'chest': [
        { name: 'Push-ups', description: '3 sets of 15 reps', calories: 100, difficulty: 'beginner' },
        { name: 'Bench Press', description: '4 sets of 10 reps', calories: 150, difficulty: 'intermediate' },
        { name: 'Dumbbell Flyes', description: '3 sets of 12 reps', calories: 120, difficulty: 'intermediate' },
        { name: 'Incline Press', description: '3 sets of 12 reps', calories: 130, difficulty: 'intermediate' },
        { name: 'Decline Push-ups', description: '3 sets of 12 reps', calories: 110, difficulty: 'beginner' }
    ],
    'legs': [
        { name: 'Squats', description: '4 sets of 12 reps', calories: 200, difficulty: 'beginner' },
        { name: 'Lunges', description: '3 sets of 10 reps each leg', calories: 150, difficulty: 'beginner' },
        { name: 'Leg Press', description: '4 sets of 15 reps', calories: 180, difficulty: 'intermediate' },
        { name: 'Calf Raises', description: '3 sets of 20 reps', calories: 80, difficulty: 'beginner' },
        { name: 'Deadlifts', description: '4 sets of 8 reps', calories: 250, difficulty: 'advanced' }
    ],
    'back': [
        { name: 'Pull-ups', description: '3 sets till failure', calories: 150, difficulty: 'intermediate' },
        { name: 'Rows', description: '4 sets of 12 reps', calories: 130, difficulty: 'beginner' },
        { name: 'Lat Pulldowns', description: '3 sets of 12 reps', calories: 120, difficulty: 'beginner' },
        { name: 'Face Pulls', description: '3 sets of 15 reps', calories: 90, difficulty: 'beginner' },
        { name: 'Back Extensions', description: '3 sets of 12 reps', calories: 100, difficulty: 'beginner' }
    ],
    'arms': [
        { name: 'Bicep Curls', description: '3 sets of 12 reps', calories: 90, difficulty: 'beginner' },
        { name: 'Tricep Extensions', description: '3 sets of 15 reps', calories: 90, difficulty: 'beginner' },
        { name: 'Hammer Curls', description: '3 sets of 12 reps', calories: 85, difficulty: 'beginner' },
        { name: 'Diamond Push-ups', description: '3 sets of 12 reps', calories: 100, difficulty: 'intermediate' },
        { name: 'Dips', description: '3 sets of 10 reps', calories: 120, difficulty: 'intermediate' }
    ],
    'shoulders': [
        { name: 'Shoulder Press', description: '4 sets of 10 reps', calories: 130, difficulty: 'intermediate' },
        { name: 'Lateral Raises', description: '3 sets of 12 reps', calories: 90, difficulty: 'beginner' },
        { name: 'Front Raises', description: '3 sets of 12 reps', calories: 90, difficulty: 'beginner' },
        { name: 'Shrugs', description: '3 sets of 15 reps', calories: 80, difficulty: 'beginner' },
        { name: 'Upright Rows', description: '3 sets of 12 reps', calories: 100, difficulty: 'intermediate' }
    ],
    'cardio': [
        { name: 'Running', description: '20-30 minutes', calories: 300, difficulty: 'intermediate' },
        { name: 'Jumping Jacks', description: '3 sets of 50 reps', calories: 150, difficulty: 'beginner' },
        { name: 'Burpees', description: '3 sets of 15 reps', calories: 200, difficulty: 'advanced' },
        { name: 'Jump Rope', description: '15 minutes', calories: 200, difficulty: 'intermediate' },
        { name: 'Mountain Climbers', description: '3 sets of 20 reps', calories: 150, difficulty: 'intermediate' }
    ],
    'core': [
        { name: 'Crunches', description: '3 sets of 20 reps', calories: 80, difficulty: 'beginner' },
        { name: 'Planks', description: '3 sets of 45 seconds', calories: 70, difficulty: 'beginner' },
        { name: 'Russian Twists', description: '3 sets of 20 reps', calories: 100, difficulty: 'intermediate' },
        { name: 'Leg Raises', description: '3 sets of 15 reps', calories: 90, difficulty: 'intermediate' },
        { name: 'Ab Wheel', description: '3 sets of 10 reps', calories: 110, difficulty: 'advanced' }
    ]
};

function getExercisesByDifficulty(bodyPart, difficulty) {
    return workoutDatabase[bodyPart].filter(exercise => exercise.difficulty === difficulty);
}

function calculateTotalCalories(exercises) {
    return exercises.reduce((total, exercise) => total + exercise.calories, 0);
}

function suggestWorkout(bodyPart, difficulty, targetCalories) {
    const exercises = workoutDatabase[bodyPart];
    let workout = [];
    let totalCalories = 0;

    if (difficulty) {
        exercises.filter(ex => ex.difficulty === difficulty).forEach(ex => {
            if (totalCalories < targetCalories) {
                workout.push(ex);
                totalCalories += ex.calories;
            }
        });
    } else {
        exercises.forEach(ex => {
            if (totalCalories < targetCalories) {
                workout.push(ex);
                totalCalories += ex.calories;
            }
        });
    }

    return {
        exercises: workout,
        totalCalories: totalCalories
    };
}