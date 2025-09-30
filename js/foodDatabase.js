const foodDatabase = {
    // Proteins
    'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    'egg': { calories: 68, protein: 5.7, carbs: 0.6, fat: 4.8 },
    'salmon': { calories: 208, protein: 22, carbs: 0, fat: 13 },
    'tuna': { calories: 116, protein: 26, carbs: 0, fat: 1 },
    'greek yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },

    // Carbohydrates
    'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
    'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
    'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
    'oatmeal': { calories: 307, protein: 13, carbs: 55, fat: 5.3 },

    // Vegetables
    'broccoli': { calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6 },
    'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
    'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
    'tomato': { calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2 },
    'cucumber': { calories: 8, protein: 0.5, carbs: 1.9, fat: 0.1 },

    // Fruits
    'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
    'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
    'strawberries': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
    'blueberries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },

    // Nuts and Seeds
    'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50 },
    'peanut butter': { calories: 588, protein: 25, carbs: 20, fat: 50 },
    'chia seeds': { calories: 486, protein: 17, carbs: 42, fat: 31 },

    // Dairy
    'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
    'cheese': { calories: 402, protein: 25, carbs: 1.3, fat: 33 },

    // Processed Foods
    'pizza': { calories: 266, protein: 11, carbs: 33, fat: 10 },
    'hamburger': { calories: 354, protein: 20, carbs: 29, fat: 17 },
    'french fries': { calories: 312, protein: 3.4, carbs: 41, fat: 15 },
};

// Function to get food information
function getFoodInfo(foodName) {
    const normalizedFoodName = foodName.toLowerCase().trim();
    return foodDatabase[normalizedFoodName] || null;
}

// Function to calculate calories and nutrients for a portion
function calculatePortion(foodName, grams) {
    const foodInfo = getFoodInfo(foodName);
    if (!foodInfo) return null;

    const factor = grams / 100; // Database values are per 100g
    return {
        calories: Math.round(foodInfo.calories * factor),
        protein: Math.round(foodInfo.protein * factor * 10) / 10,
        carbs: Math.round(foodInfo.carbs * factor * 10) / 10,
        fat: Math.round(foodInfo.fat * factor * 10) / 10
    };
}

// Function to suggest foods based on goals
function suggestFoods(goal, type) {
    const suggestions = {
        'protein': ['chicken breast', 'egg', 'salmon', 'tuna', 'greek yogurt'],
        'carbs': ['rice', 'oatmeal', 'potato', 'pasta', 'bread'],
        'vegetables': ['broccoli', 'spinach', 'carrot', 'tomato', 'cucumber'],
        'healthy fats': ['almonds', 'salmon', 'chia seeds', 'peanut butter'],
        'snacks': ['greek yogurt', 'almonds', 'banana', 'apple']
    };

    return suggestions[type] || [];
}