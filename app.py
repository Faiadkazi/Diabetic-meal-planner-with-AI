import sqlite3
from datetime import date, timedelta
from flask import Flask, render_template, request, redirect, url_for, session, jsonify

# Create the Flask app and disable strict slashes for flexibility
app = Flask(__name__, template_folder='templates')
app.secret_key = 'replace-with-a-secure-key'
app.url_map.strict_slashes = False
DB = 'vitals.db'

# --- Database initialization ---
def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS vitals (
            id INTEGER PRIMARY KEY CHECK(id=1),
            blood_pressure TEXT,
            blood_glucose TEXT,
            body_weight TEXT,
            fat_percentage TEXT
        )
    ''')
    c.execute('INSERT OR IGNORE INTO vitals(id) VALUES(1)')
    conn.commit()
    conn.close()

# Initialize the database at startup
def setup():
    init_db()
setup()

# --- Health check endpoint ---
@app.route('/ping')
def ping():
    return "🏓 Pong!", 200

# --- Authentication and UI routes ---
@app.route('/', methods=['GET'])
def show_login():
    return render_template('login.html')

@app.route('/login', methods=['GET','POST'])
def do_login():
    if request.method == 'GET':
        return render_template('login.html')  # show the form

    # POST: check creds
    email = request.form.get('email')
    pw    = request.form.get('password')
    print("Login attempt:", email, pw)     # <- DEBUG: watch your terminal for these
    if email == 'user@example.com' and pw == 'password123':
        session['logged_in'] = True
        return redirect(url_for('show_dashboard'))
    # on failure, re-show with an error
    return render_template('login.html', error='Invalid email or password'), 401

@app.route('/logout')
def do_logout():
    session.clear()
    return redirect(url_for('show_login'))

@app.route('/healthcare')
def show_dashboard():
    if not session.get('logged_in'):
        return redirect(url_for('show_login'))
    return render_template('healthcare.html')


# --- Vitals API ---
@app.route('/api/vitals', methods=['GET', 'POST'])
def api_vitals():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    if request.method == 'POST':
        data = request.get_json() or {}
        c.execute('''
            UPDATE vitals
            SET blood_pressure=?, blood_glucose=?, body_weight=?, fat_percentage=?
            WHERE id=1
        ''', (
            data.get('blood_pressure',''),
            data.get('blood_glucose',''),
            data.get('body_weight',''),
            data.get('fat_percentage','')
        ))
        conn.commit()
    c.execute('SELECT blood_pressure, blood_glucose, body_weight, fat_percentage FROM vitals WHERE id=1')
    row = c.fetchone() or ('', '', '', '')
    conn.close()
    return jsonify({
        'blood_pressure': row[0],
        'blood_glucose':  row[1],
        'body_weight':    row[2],
        'fat_percentage': row[3]
    })

# --- AI Meal Plan API ---
@app.route('/api/ai-meals', methods=['POST'])
def ai_meals():
    params = request.get_json() or {}
    meals_per_day       = int(params.get('mealsPerDay', 3))
    goal                = params.get('healthGoal', 'Maintenance')
    dietary_preferences = params.get('dietaryPreferences', '')

    plan = []
    today = date.today()
    for i in range(7):
        day = today + timedelta(days=i)
        meals = [
            f"Meal {j+1}: Sample for {goal} ({dietary_preferences or 'No Prefs'})"
            for j in range(meals_per_day)
        ]
        plan.append({
            'day':   day.strftime('%A, %b %d'),
            'meals': meals
        })
    return jsonify(plan=plan)

# --- Run the app ---
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
