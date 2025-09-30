const exerciseDatabase = {
    // Cardio
    'walking': { 
        met: 3.5, 
        description: 'Regular walking at moderate pace',
        targetMuscles: ['legs', 'core'],
        tips: ['Maintain good posture', 'Keep a steady pace', 'Swing arms naturally']
    },
    'running': { 
        met: 8.3, 
        description: 'Running (8 min/mile)',
        targetMuscles: ['legs', 'core', 'cardiovascular'],
        tips: ['Land midfoot', 'Keep upper body relaxed', 'Breathe rhythmically']
    },
    'cycling': { 
        met: 7.5, 
        description: 'Cycling (12-14 mph)',
        targetMuscles: ['legs', 'core', 'cardiovascular'],
        tips: ['Maintain proper seat height', 'Keep cadence steady', 'Engage core']
    },
    'swimming': { 
        met: 6.0, 
        description: 'Swimming laps, freestyle',
        targetMuscles: ['full body', 'cardiovascular'],
        tips: ['Focus on form', 'Breathe bilaterally', 'Keep body streamlined']
    },
    
    // Bodyweight Exercises
    'push-ups': { 
        met: 8.0, 
        description: 'Push-ups, vigorous',
        targetMuscles: ['chest', 'shoulders', 'triceps', 'core'],
        tips: ['Keep body straight', 'Elbows at 45°', 'Full range of motion']
    },
    'pull-ups': { 
        met: 8.0, 
        description: 'Pull-ups',
        targetMuscles: ['back', 'biceps', 'shoulders'],
        tips: ['Start with dead hang', 'Pull shoulders down', 'Control descent']
    },
    'squats': { 
        met: 5.0, 
        description: 'Bodyweight squats',
        targetMuscles: ['quadriceps', 'hamstrings', 'glutes', 'core'],
        tips: ['Keep chest up', 'Knees track toes', 'Hip hinge']
    },
    'planks': { 
        met: 4.0, 
        description: 'Plank holds',
        targetMuscles: ['core', 'shoulders', 'back'],
        tips: ['Keep body straight', 'Engage core', 'Breathe steadily']
    },
    
    // Weight Training
    'bench press': { 
        met: 6.0, 
        description: 'Barbell bench press',
        targetMuscles: ['chest', 'shoulders', 'triceps'],
        tips: ['Keep feet planted', 'Retract shoulder blades', 'Control bar path']
    },
    'deadlift': { 
        met: 6.0, 
        description: 'Conventional deadlift',
        targetMuscles: ['back', 'legs', 'core'],
        tips: ['Hip hinge', 'Keep bar close', 'Brace core']
    },
    'shoulder press': { 
        met: 5.0, 
        description: 'Overhead press',
        targetMuscles: ['shoulders', 'triceps', 'core'],
        tips: ['Stack joints', 'Brace core', 'Full lockout']
    },
    
    // HIIT
    'burpees': { 
        met: 8.0, 
        description: 'Burpee exercise',
        targetMuscles: ['full body', 'cardiovascular'],
        tips: ['Maintain form', 'Control landing', 'Pace yourself']
    },
    'mountain climbers': { 
        met: 7.0, 
        description: 'Mountain climbers',
        targetMuscles: ['core', 'shoulders', 'cardiovascular'],
        tips: ['Keep hips low', 'Alternate legs quickly', 'Maintain plank']
    },
    
    // Flexibility
    'yoga': { 
        met: 3.0, 
        description: 'Basic yoga',
        targetMuscles: ['full body', 'flexibility'],
        tips: ['Focus on breath', 'Stay within limits', 'Hold poses']
    },
    'stretching': { 
        met: 2.5, 
        description: 'Dynamic stretching',
        targetMuscles: ['full body', 'flexibility'],
        tips: ['Warm up first', 'No bouncing', 'Breathe deeply']
    }
};