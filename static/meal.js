// static/meal.js

document.addEventListener('DOMContentLoaded', () => {
  const form   = document.getElementById('meal-form');
  const output = document.getElementById('meal-plan-output');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Gather form data
    const payload = {
      mealsPerDay:        Number(form.mealsPerDay.value),
      healthGoal:         form.healthGoal.value,
      allergies:          form.allergies.value,
      dietaryPreferences: form.dietaryPreferences.value
    };

    try {
      const res  = await fetch('/api/ai-meals', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { plan } = await res.json();

      // Render the 7-day plan
      output.innerHTML = " ";
      plan.forEach(dayPlan => {
        const card = document.createElement('div');
        card.className = 'day-card';

        const h4 = document.createElement('h4');
        h4.textContent = dayPlan.day;
        card.appendChild(h4);

        const ul = document.createElement('ul');
        dayPlan.meals.forEach(meal => {
          const li = document.createElement('li');
          li.textContent = meal;
          ul.appendChild(li);
        });
        card.appendChild(ul);

        output.appendChild(card);
      });

      
    } catch (err) {
      console.error( err);
      alert('Could not generate meal plan. Try again.');
    }
  });
});
