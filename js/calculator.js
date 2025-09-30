class FitnessCalculator {
    constructor() {
        this.userProfile = null;
    }

    // Calculate BMI
    calculateBMI(weight, height) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return Math.round(bmi * 10) / 10;
    }

    // Get BMI Category
    getBMICategory(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }

    // Calculate Basal Metabolic Rate (BMR)
    calculateBMR(weight, height, age, gender) {
        if (gender.toLowerCase() === 'male') {
            return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
    }

    // Calculate Total Daily Energy Expenditure (TDEE)
    calculateTDEE(bmr, activityLevel) {
        const activityMultipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'very': 1.725,
            'extra': 1.9
        };
        return Math.round(bmr * activityMultipliers[activityLevel]);
    }

    // Calculate Target Calories based on goal
    calculateTargetCalories(tdee, goal) {
        switch(goal) {
            case 'lose':
                return tdee - 500; // 500 calorie deficit for weight loss
            case 'gain':
                return tdee + 500; // 500 calorie surplus for weight gain
            default:
                return tdee; // maintain weight
        }
    }

    // Calculate Macro Nutrients
    calculateMacros(targetCalories, goal) {
        let protein, carbs, fats;
        
        switch(goal) {
            case 'lose':
                protein = (targetCalories * 0.40) / 4; // 40% protein
                carbs = (targetCalories * 0.35) / 4;   // 35% carbs
                fats = (targetCalories * 0.25) / 9;    // 25% fats
                break;
            case 'gain':
                protein = (targetCalories * 0.30) / 4; // 30% protein
                carbs = (targetCalories * 0.50) / 4;   // 50% carbs
                fats = (targetCalories * 0.20) / 9;    // 20% fats
                break;
            default: // maintain
                protein = (targetCalories * 0.30) / 4; // 30% protein
                carbs = (targetCalories * 0.45) / 4;   // 45% carbs
                fats = (targetCalories * 0.25) / 9;    // 25% fats
        }

        return {
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fats: Math.round(fats)
        };
    }

    // Calculate calories burned during exercise
    calculateCaloriesBurned(weight, duration, activity) {
        const metValues = {
            'walking': 3.3,
            'jogging': 7.0,
            'running': 9.8,
            'cycling': 7.5,
            'swimming': 5.8,
            'weight_training': 3.5,
            'hiit': 8.0,
            'yoga': 2.5,
            'aerobics': 6.0
        };

        const met = metValues[activity] || 5.0; // default MET value if activity not found
        return Math.round((met * weight * 3.5 * duration) / (200));
    }

    // Set user profile
    setUserProfile(profile) {
        this.userProfile = profile;
        
        // Calculate key metrics
        const bmi = this.calculateBMI(profile.weight, profile.height);
        const bmr = this.calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
        const tdee = this.calculateTDEE(bmr, profile.activity);
        const targetCalories = this.calculateTargetCalories(tdee, profile.goal);
        const macros = this.calculateMacros(targetCalories, profile.goal);

        return {
            bmi: bmi,
            bmiCategory: this.getBMICategory(bmi),
            bmr: Math.round(bmr),
            tdee: tdee,
            targetCalories: targetCalories,
            macros: macros
        };
    }
}