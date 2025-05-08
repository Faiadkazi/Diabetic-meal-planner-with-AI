// === code verification for login ===
function validateLogin() {
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    const dummyEmail = "user@example.com";
    const dummyPassword = "password123";

    if (email === dummyEmail && password === dummyPassword) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = "healthcare.html";
    } else {
        alert("Invalid email or password.");
    }

    return false;
}
function switchSection(sectionId) {
    console.log("Switching to:", sectionId);
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
    }
}

function regenerateMealPlan() {
    const meals = [
        "🍳 Smoothie Bowl | 🥗 Turkey Wrap | 🥘 Veggie Stir-Fry",
        "🍞 Avocado Toast | 🍲 Lentil Soup | 🐟 Grilled Fish & Greens",
        "🥣 Greek Yogurt | 🥙 Quinoa Salad | 🍛 Tofu Curry"
    ];
    const mealText = document.getElementById('meal-plan-text');
    const randomMeal = meals[Math.floor(Math.random() * meals.length)];
    mealText.textContent = randomMeal;
}

document.addEventListener("DOMContentLoaded", () => {
    const chartCanvas = document.getElementById("progressChart");
    if (chartCanvas) {
        const ctx = chartCanvas.getContext("2d");
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4'],
                datasets: [{
                    label: 'Weight Progress',
                    data: [75, 74.5, 74, 73.5],
                    borderColor: 'blue',
                    fill: false
                }]
            }
        });
    }
});
