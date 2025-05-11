// static/vitals.js

/**
 * Fetches the current vitals from the server and populates the form inputs.
 */
document.addEventListener('DOMContentLoaded', () => {
  // grab the canvas context
  const ctx = document.getElementById('weightChart').getContext('2d');

  // create a multi-line Chart.js instance
  window.weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Body Weight (kg)',
          data: [],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Blood Glucose (mg/dL)',
          data: [],
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Fat Percentage (%)',
          data: [],
          borderColor: '#f1c40f',
          backgroundColor: 'rgba(241, 196, 15, 0.2)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
loadVitals();

  // hook up the form’s submit to our update function
  const form = document.getElementById('vitals-form');
  if (form) {
    form.addEventListener('submit', updateVitals);
  }
});
async function loadVitals() {
    try {
      const res = await fetch('/api/vitals');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      document.getElementById('blood_pressure').value = data.blood_pressure;
      document.getElementById('blood_glucose').value  = data.blood_glucose;
      document.getElementById('body_weight').value    = data.body_weight;
      document.getElementById('fat_percentage').value = data.fat_percentage;

      const chart = window.weightChart;
      chart.data.labels.push('Today');
      chart.data.datasets[0].data.push(Number(data.body_weight));
      chart.data.datasets[1].data.push(Number(data.blood_glucose));
      chart.data.datasets[2].data.push(Number(data.fat_percentage));
      chart.update();
    } catch (err) {
      console.error('Failed to load vitals:', err);
    }
  }

  async function updateVitals(event) {
  event.preventDefault();

  // 1) Gather payload
  const payload = {
    blood_pressure: document.getElementById('blood_pressure').value,
    blood_glucose:  document.getElementById('blood_glucose').value,
    body_weight:    document.getElementById('body_weight').value,
    fat_percentage: document.getElementById('fat_percentage').value
  };

  // 2) Send to server
  let res;
  try {
    res = await fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error('Server error:', txt);
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    console.error('❌ Failed to save vitals:', err);
    alert('Failed to update vitals on the server.');
    return;
  }

  // 3) If you have a chart, update it (but don’t let chart errors kill your flow)
  try {
    const chart = window.weightChart;
    
    if (chart) {
      const next = chart.data.labels.length + 1;
      chart.data.labels.push(`Day ${next}`);
      chart.data.datasets[0].data.push(Number(payload.body_weight));
      chart.data.datasets[1].data.push(Number(payload.blood_glucose));
      chart.data.datasets[2].data.push(Number(payload.fat_percentage));
      chart.update();
    }
  } catch (err) {
    console.error('⚠️ Chart update failed:', err);
    // we’ll still show success because server call succeeded
  }

  // 4) Finally, let the user know it worked
  alert('Vitals updated successfully!');
}

  
  /**
   * Sends the updated vitals to the server via POST and gives feedback.
   */
  /**async function updateVitals(event) {
    event.preventDefault();

  // 1) Gather payload
  const payload = {
    blood_pressure: document.getElementById('blood_pressure').value,
    blood_glucose:  document.getElementById('blood_glucose').value,
    body_weight:    document.getElementById('body_weight').value,
    fat_percentage: document.getElementById('fat_percentage').value
  };
  
  console.log('[vitals.js] Sending payload →', payload);


  // 2) POST to server, handle only fetch-related errors here
  let res, text;
  try {
    res = await fetch('/api/vitals', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    console.log('[vitals.js] HTTP status:', res.status);
    text = await res.text();
    console.log('[vitals.js] Raw response:', text);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error('[vitals.js] POST failed:', err);
    alert('Failed to update vitals on the server.');
    return;
  }


  // 3) If we reach here, the POST succeeded—now update the chart
  try {
    const chart = window.weightChart;
    const nextIndex = chart.data.labels.length + 1;

    chart.data.labels.push(`Day ${nextIndex}`);
    chart.data.datasets[0].data.push(Number(payload.body_weight));
    chart.data.datasets[1].data.push(Number(payload.blood_glucose));
    chart.data.datasets[2].data.push(Number(payload.fat_percentage));
    chart.update();
  } catch (err) {
    console.error('Error updating chart:', err);
    // no alert here; chart failure shouldn't negate the server success
  }

  // 4) Only now show success
  alert('Vitals updated successfully!');
}
*/

  
  document.addEventListener('DOMContentLoaded', () => {
    loadVitals();
    const form = document.getElementById('vitals-form');
    if (form) {
      form.addEventListener('submit', updateVitals);
    }
  });
  

     /**  const newWeight = Number(payload.body_weight);
    const chart = window.weightChart;
    // add new data value
    chart.data.datasets[0].data.push(newWeight);
    // add new label (e.g. Day 5)
    const nextIndex = chart.data.labels.length + 1;
    chart.data.labels.push(`Day ${nextIndex}`);
    chart.update();*/

    /** event.preventDefault(); // prevent full page reload
  
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
      const chart = window.weightChart;
      const nextIndex = chart.data.labels.length + 1;
      chart.data.labels.push(`Day ${nextIndex}`);
      chart.data.datasets[0].data.push(Number(payload.body_weight));
      chart.data.datasets[1].data.push(Number(payload.blood_glucose));
      chart.data.datasets[2].data.push(Number(payload.fat_percentage));
      chart.update();

    } catch (err) {
      console.error('Error updating vitals:', err);
      alert('Failed to update vitals.');
    }
  }
   */