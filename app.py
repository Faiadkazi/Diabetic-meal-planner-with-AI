import sqlite3
from datetime import date, timedelta
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from random import shuffle


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
    prefs = params.get('dietaryPreferences', 'None').lower()
    allergies = params.get('allergies', '')       # e.g. "Gluten, Nuts"
    allergy_list = [a.strip().lower() for a in allergies.split(',') if a.strip()]


    breakfast = ["Oatmeal with berries", "Greek yogurt & nuts", "Avocado toast"]
    lunch     = ["Grilled chicken salad", "Veggie wrap", "Quinoa bowl"]
    dinner    = ["Baked salmon & veggies", "Stir-fry tofu", "Zucchini noodles & meatballs"]

    

    if "vegan" in prefs:
        lunch  = ["Vegan Buddha bowl", "Lentil soup", "Veggie wrap"]
        dinner = ["Tofu stir-fry", "Chickpea curry", "Veggie pasta"]

    def filter_out_allergens(menu):
        filtered = [dish for dish in menu
                    if not any(allergy in dish.lower() for allergy in allergy_list)]
        return filtered or menu  # if everything got filtered, keep at least the original list

    if allergy_list:
        breakfast = filter_out_allergens(breakfast)
        lunch     = filter_out_allergens(lunch)
        dinner    = filter_out_allergens(dinner)

    shuffle(breakfast)
    shuffle(lunch)
    shuffle(dinner)



    plan = []
    today = date.today()
    for i in range(7):
        day = today + timedelta(days=i)
        meals = []
        for m in range(meals_per_day):
            if m == 0:
                meals.append(breakfast[(i+0) % len(breakfast)])
            elif m == 1:
                meals.append(lunch[(i+1) % len(lunch)])
            else:
                meals.append(dinner[(i+m - 2) % len(dinner)])
        plan.append({"day":  day.strftime('%A, %b %d'), "meals": meals})
    return jsonify(plan=plan)

# --- Run the app ---
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
