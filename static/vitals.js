// static/vitals.js

/**
 * Fetches the current vitals from the server and populates the form inputs.
 */
async function loadVitals() {
    try {
      const res = await fetch('/api/vitals');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      document.getElementById('blood_pressure').value = data.blood_pressure;
      document.getElementById('blood_glucose').value  = data.blood_glucose;
      document.getElementById('body_weight').value    = data.body_weight;
      document.getElementById('fat_percentage').value = data.fat_percentage;
    } catch (err) {
      console.error('Failed to load vitals:', err);
    }
  }
  
  /**
   * Sends the updated vitals to the server via POST and gives feedback.
   */
  async function updateVitals(event) {
    event.preventDefault(); // prevent full page reload
  
    const payload = {
      blood_pressure: document.getElementById('blood_pressure').value,
      blood_glucose:  document.getElementById('blood_glucose').value,
      body_weight:    document.getElementById('body_weight').value,
      fat_percentage: document.getElementById('fat_percentage').value
    };
  
    try {
      const res = await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert('Vitals updated successfully!');
      // Refresh chart with new weight data point
    const newWeight = Number(payload.body_weight);
    const chart = window.weightChart;
    // add new data value
    chart.data.datasets[0].data.push(newWeight);
    // add new label (e.g. Day 5)
    const nextIndex = chart.data.labels.length + 1;
    chart.data.labels.push(`Day ${nextIndex}`);
    chart.update();
    } catch (err) {
      console.error('Error updating vitals:', err);
      alert('Failed to update vitals.');
    }
  }
  
  /**
   * Initialize on page load
   */
  document.addEventListener('DOMContentLoaded', () => {
    loadVitals();
    const form = document.getElementById('vitals-form');
    if (form) {
      form.addEventListener('submit', updateVitals);
    }
  });
  