from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from datetime import datetime, date
import os
import re
from database import DatabaseManager
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'basket_check_secret_key_2025')

# יצירת חיבור למסד נתונים (Turso)
db = DatabaseManager()

# הגדרות Flask
app.config['TEMPLATES_AUTO_RELOAD'] = True

# הוספת פילטרים ו-tests מותאמים אישית לJinja2
@app.template_filter('regex_match')
def regex_match_filter(text, pattern):
    if text is None:
        return False
    return bool(re.match(pattern, str(text)))

@app.template_test('match')
def regex_match_test(text, pattern):
    if text is None:
        return False
    return bool(re.match(pattern, str(text)))

@app.template_filter('startswith_filter')
def startswith_filter(text, prefix):
    if text is None:
        return False
    return str(text).startswith(prefix)

@app.template_filter('contains')
def contains_filter(text, substring):
    if text is None:
        return False
    return substring in str(text)

# פונקציות עזר
def is_logged_in():
    return 'user_id' in session

def is_manager():
    return session.get('user_type') == 'manager'

def login_required(f):
    def wrapper(*args, **kwargs):
        if not is_logged_in():
            flash('עליך להתחבר כדי לגשת לעמוד זה', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

def manager_required(f):
    def wrapper(*args, **kwargs):
        if not is_logged_in():
            flash('עליך להתחבר כדי לגשת לעמוד זה', 'error')
            return redirect(url_for('login'))
        if not is_manager():
            flash('אין לך הרשאה לגשת לעמוד זה - דרושות הרשאות מנהל', 'error')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# דפי בסיס
@app.route('/')
def index():
    """דף הבית - הצגת משחקים קרובים"""
    try:
        games = db.get_all_games('open')
        
        # הוספת מידע על הרשמות לכל משחק
        for game in games:
            registrations = db.get_game_registrations(game['game_id'])
            game['registrations_count'] = len(registrations)
            player_registrations = [r for r in registrations if r['position_name'].startswith('Team A') or r['position_name'].startswith('Team B')]
            game['available_spots'] = 10 - len(player_registrations)
        
        return render_template('index.html', games=games)
    except Exception as e:
        app.logger.error(f"Error in index: {str(e)}")
        flash('שגיאה בטעינת הנתונים', 'error')
        return render_template('index.html', games=[])

@app.route('/register', methods=['GET', 'POST'])
def register():
    """רישום משתמש חדש"""
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        phone = request.form.get('phone', '')
        
        if len(password) < 6:
            flash('הסיסמה חייבת להכיל לפחות 6 תווים', 'error')
            return render_template('register.html')
        
        user_id = db.create_user(username, email, password, first_name, last_name, phone)
        
        if user_id:
            flash('נרשמת בהצלחה! עכשיו תוכל להתחבר', 'success')
            return redirect(url_for('login'))
        else:
            flash('שם המשתמש או האימייל כבר קיימים במערכת', 'error')
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """התחברות למערכת"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = db.authenticate_user(username, password)
        
        if user:
            session['user_id'] = user['user_id']
            session['username'] = user['username']
            session['user_type'] = user['user_type']
            session['first_name'] = user['first_name']
            
            flash(f'ברוך הבא, {user["first_name"]}!', 'success')
            return redirect(url_for('index'))  
        else:
            flash('שם משתמש או סיסמה שגויים', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """התנתקות מהמערכת"""
    session.clear()
    flash('התנתקת בהצלחה', 'info')
    return redirect(url_for('index'))

# דפי משחקים
@app.route('/games')
def games_list():
    """רשימת כל המשחקים"""
    try:
        games = db.get_all_games('open')
        
        for game in games:
            registrations = db.get_game_registrations(game['game_id'])
            game['registrations'] = registrations
            game['registrations_count'] = len(registrations)
            player_registrations = [r for r in registrations if r['position_name'].startswith('Team A') or r['position_name'].startswith('Team B')]
            game['available_spots'] = 10 - len(player_registrations)
        
        return render_template('games_list.html', games=games)
    except Exception as e:
        app.logger.error(f"Error in games_list: {str(e)}")
        flash('שגיאה בטעינת רשימת המשחקים', 'error')
        return render_template('games_list.html', games=[])

@app.route('/game/<int:game_id>')
def game_detail(game_id):
    """פרטי משחק ספציפי"""
    try:
        game = db.get_game_by_id(game_id)
        if not game:
            flash('המשחק לא נמצא', 'error')
            return redirect(url_for('games_list'))
        
        registrations = db.get_game_registrations(game_id)
        positions = db.get_all_positions()
        
        # ארגון הרשמות לפי תפקידים
        registrations_by_position = {}
        for reg in registrations:
            position_name = reg['position_name']
            if position_name not in registrations_by_position:
                registrations_by_position[position_name] = []
            registrations_by_position[position_name].append(reg)
        
        # בדיקה אם המשתמש הנוכחי נרשם
        user_registered = False
        if is_logged_in():
            user_registration = next((r for r in registrations if r['user_id'] == session['user_id']), None)
            user_registered = user_registration is not None
        
        return render_template('game_detail.html', 
                             game=game, 
                             registrations=registrations,
                             registrations_by_position=registrations_by_position,
                             positions=positions,
                             user_registered=user_registered)
    except Exception as e:
        app.logger.error(f"Error in game_detail: {str(e)}")
        flash(f'שגיאה בטעינת פרטי המשחק: {str(e)}', 'error')
        return redirect(url_for('games_list'))

@app.route('/game/<int:game_id>/register', methods=['POST'])
@login_required
def register_to_game(game_id):
    """הרשמה למשחק"""
    position_id = request.form.get('position_id')
    
    if not position_id:
        flash('חובה לבחור תפקיד', 'error')
        return redirect(url_for('game_detail', game_id=game_id))
    
    try:
        result = db.register_to_game(game_id, session['user_id'], int(position_id))
        
        if result['success']:
            flash(result['message'], 'success')
        else:
            flash(result['message'], 'error')
    except Exception as e:
        flash(f'שגיאה בהרשמה: {str(e)}', 'error')
    
    return redirect(url_for('game_detail', game_id=game_id))

@app.route('/game/<int:game_id>/cancel', methods=['POST'])
@login_required
def cancel_game_registration(game_id):
    """ביטול הרשמה למשחק"""
    success = db.cancel_registration(game_id, session['user_id'])
    
    if success:
        flash('ההרשמה בוטלה בהצלחה', 'success')
    else:
        flash('שגיאה בביטול ההרשמה', 'error')
    
    return redirect(url_for('game_detail', game_id=game_id))

# דפי מנהל
@app.route('/create_game', methods=['GET', 'POST'])
@manager_required
def create_game():
    """יצירת משחק חדש"""
    if request.method == 'POST':
        try:
            title = request.form['title']
            game_date = request.form['game_date']
            game_time = request.form['game_time']
            location = request.form['location']
            max_players = int(request.form.get('max_players', 10))
            description = request.form.get('description', '')
            
            # בדיקה שהתאריך לא בעבר
            game_datetime = datetime.strptime(f"{game_date} {game_time}", "%Y-%m-%d %H:%M")
            if game_datetime < datetime.now():
                flash('לא ניתן ליצור משחק בתאריך שעבר', 'error')
                return render_template('create_game.html')
            
            game_id = db.create_game(title, game_date, game_time, location, 
                                    session['user_id'], description, max_players)
            
            if game_id:
                flash('המשחק נוצר בהצלחה!', 'success')
                return redirect(url_for('game_detail', game_id=game_id))
            else:
                flash('שגיאה ביצירת המשחק', 'error')
                
        except Exception as e:
            flash(f'שגיאה ביצירת המשחק: {str(e)}', 'error')
    
    return render_template('create_game.html')

@app.route('/manage_games')
@manager_required
def manage_games():
    """ניהול משחקים למנהלים"""
    try:
        all_games = db.get_all_games(status=None)
        my_games = [game for game in all_games if game['created_by'] == session['user_id']]
        
        for game in my_games:
            registrations = db.get_game_registrations(game['game_id'])
            game['registrations_count'] = len(registrations)
        
        return render_template('manage_games.html', games=my_games)
    except Exception as e:
        app.logger.error(f"Error in manage_games: {str(e)}")
        flash('שגיאה בטעינת ניהול המשחקים', 'error')
        return render_template('manage_games.html', games=[])

@app.route('/dashboard')
@manager_required
def dashboard():
    """לוח בקרה למנהלים"""
    try:
        # סטטיסטיקות בסיסיות
        all_games = db.get_all_games(status=None)
        my_games = [game for game in all_games if game['created_by'] == session['user_id']]
        
        stats = {
            'total_games': len(my_games),
            'open_games': len([g for g in my_games if g['status'] == 'open']),
            'total_registrations': 0
        }
        
        for game in my_games:
            registrations = db.get_game_registrations(game['game_id'])
            stats['total_registrations'] += len(registrations)
        
        return render_template('dashboard.html', games=my_games[:5], stats=stats)
    except Exception as e:
        app.logger.error(f"Error in dashboard: {str(e)}")
        flash('שגיאה בטעינת לוח הבקרה', 'error')
        return redirect(url_for('index'))

# API endpoints
@app.route('/api/positions')
def api_positions():
    try:
        positions = db.get_all_positions()
        return jsonify(positions)
    except Exception as e:
        app.logger.error(f"Error in api_positions: {str(e)}")
        return jsonify({'error': 'שגיאה בטעינת התפקידים'}), 500

@app.route('/api/game/<int:game_id>/registrations')
def api_game_registrations(game_id):
    try:
        registrations = db.get_game_registrations(game_id)
        return jsonify(registrations)
    except Exception as e:
        app.logger.error(f"Error in api_game_registrations: {str(e)}")
        return jsonify({'error': 'שגיאה בטעינת ההרשמות'}), 500

# Context processors
@app.context_processor
def inject_user():
    return {
        'current_user': {
            'id': session.get('user_id'),
            'username': session.get('username'),
            'first_name': session.get('first_name'),
            'user_type': session.get('user_type'),
            'is_logged_in': is_logged_in(),
            'is_manager': is_manager()
        }
    }

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f"500 Error: {str(error)}")
    return render_template('500.html'), 500

# Template filters
@app.template_filter('datetime')
def datetime_filter(value):
    if isinstance(value, str):
        try:
            value = datetime.strptime(value, '%Y-%m-%d')
        except:
            return value
    return value.strftime('%d/%m/%Y')

@app.template_filter('time')
def time_filter(value):
    if isinstance(value, str):
        try:
            time_obj = datetime.strptime(value, '%H:%M:%S').time()
            return time_obj.strftime('%H:%M')
        except:
            return value
    return value

# צ'אטבוט
@app.route('/chatbot')
def chatbot():
    """דף הצ'אטבוט"""
    return render_template('chatbot.html')

@app.route('/api/chatbot', methods=['POST'])
def chatbot_api():
    """API פנימי לצ'אטבוט שמתחבר ל-Ollama"""
    try:
        import requests
        
        data = request.get_json()
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({'error': 'שאלה ריקה'}), 400
        
        # קריאה ל-FastAPI של Ollama
        ollama_response = requests.post(
            'http://127.0.0.1:8000/chat',
            json={'question': question},
            timeout=30
        )
        
        if ollama_response.status_code == 200:
            return jsonify(ollama_response.json())
        else:
            return jsonify({'error': 'שגיאה בשרת Ollama'}), 500
            
    except requests.exceptions.ConnectionError:
        return jsonify({'error': 'לא ניתן להתחבר לשרת Ollama. ודא שהוא פועל על פורט 8000'}), 500
    except requests.exceptions.Timeout:
        return jsonify({'error': 'תם הזמן הקצוב לתשובה'}), 500
    except Exception as e:
        return jsonify({'error': f'שגיאה: {str(e)}'}), 500

if __name__ == '__main__':
    print("מתחיל אפליקציית Flask עם מסד נתונים Turso...")
    app.run(debug=True, host='0.0.0.0', port=5000)