import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.turso_url = os.getenv('TURSO_DATABASE_URL')
        self.turso_token = os.getenv('TURSO_AUTH_TOKEN')
        
        if not self.turso_url or not self.turso_token:
            raise ValueError("חובה לספק TURSO_DATABASE_URL ו-TURSO_AUTH_TOKEN")
        
        # URL שעובד
        self.base_url = self.turso_url.replace('libsql://', 'https://')
        self.working_url = self.base_url  # נשתמש ישירות בURL הבסיסי
        
        print(f"✅ מתחבר ל-Turso: {self.working_url}")
        self._test_connection()
    
    def _test_connection(self):
        """בדוק שהחיבור עובד"""
        try:
            result = self.execute_query("SELECT 1 as test")
            return True
        except Exception as e:
            print(f"❌ שגיאה בחיבור ל-Turso: {e}")
            raise
    
    def execute_query(self, query, params=None):
        """ביצוע שאילתה - טורסו לא תומך בפרמטרים דינמיים באAPI הזה"""
        headers = {
            'Authorization': f'Bearer {self.turso_token}',
            'Content-Type': 'application/json',
            'User-Agent': 'BasketCheck/1.0'
        }
        
        # אם יש פרמטרים, נבנה שאילתה עם ערכים קשיחים
        if params:
            # המרה בטוחה של פרמטרים לשאילתה
            safe_params = []
            for param in params:
                if param is None:
                    safe_params.append("NULL")
                elif isinstance(param, str):
                    # escape single quotes
                    escaped = param.replace("'", "''")
                    safe_params.append(f"'{escaped}'")
                elif isinstance(param, bool):
                    safe_params.append("1" if param else "0")
                else:
                    safe_params.append(str(param))
            
            # החלף ? בערכים הבטוחים
            final_query = query
            for param in safe_params:
                final_query = final_query.replace('?', param, 1)
        else:
            final_query = query
        
        request_data = {
            "statements": [final_query]
        }
        
        try:
            response = requests.post(
                self.working_url,
                headers=headers,
                json=request_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return self._parse_response(data)
            else:
                raise Exception(f"HTTP Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"שגיאה בשאילתה: {e}")
            print(f"השאילתה הסופית: {final_query}")
            raise
    
    def _parse_response(self, data):
        """פרסר תגובה מהשרת"""
        class MockResult:
            def __init__(self):
                self.rows = []
                self.last_insert_rowid = None
        
        result = MockResult()
        
        # טורסו מחזיר פורמט: [{'results': {...}}]
        if isinstance(data, list) and len(data) > 0:
            first_item = data[0]
            if 'results' in first_item:
                results_data = first_item['results']
                
                if 'columns' in results_data and 'rows' in results_data:
                    cols = results_data['columns']
                    rows_data = results_data['rows']
                    
                    for row_data in rows_data:
                        row_dict = {}
                        for i, col in enumerate(cols):
                            if i < len(row_data):
                                row_dict[col] = row_data[i]
                        result.rows.append(row_dict)
                
                # לפעמים יש last_insert_rowid ברמה העליונה
                if 'last_insert_rowid' in results_data:
                    result.last_insert_rowid = results_data['last_insert_rowid']
        
        return result
    
    def get_all_games(self, status=None):
        """קבלת כל המשחקים"""
        try:
            if status:
                query = "SELECT * FROM games WHERE status = ? ORDER BY game_date, game_time"
                result = self.execute_query(query, (status,))
            else:
                query = "SELECT * FROM games ORDER BY game_date, game_time"
                result = self.execute_query(query)
            
            return result.rows if result and result.rows else []
        except Exception as e:
            return []
    
    def get_game_by_id(self, game_id):
        """קבלת משחק לפי ID"""
        try:
            query = "SELECT * FROM games WHERE game_id = ?"
            result = self.execute_query(query, (game_id,))
            
            if result and result.rows:
                return result.rows[0]
            return None
        except Exception as e:
            return None
    
    def get_game_registrations(self, game_id):
        """קבלת הרשמות למשחק"""
        try:
            query = """
            SELECT gr.*, u.first_name, u.last_name, u.username, p.position_name
            FROM game_registrations gr
            JOIN users u ON gr.user_id = u.user_id
            JOIN positions p ON gr.position_id = p.position_id
            WHERE gr.game_id = ? AND gr.status = 'confirmed'
            ORDER BY p.position_name
            """
            result = self.execute_query(query, (game_id,))
            
            return result.rows if result and result.rows else []
        except Exception as e:
            return []
    
    def get_all_positions(self):
        """קבלת כל הפוזיציות"""
        try:
            query = "SELECT * FROM positions ORDER BY position_id"
            result = self.execute_query(query)
            
            return result.rows if result and result.rows else []
        except Exception as e:
            return []
    
    def authenticate_user(self, username, password):
        """אימות משתמש"""
        import hashlib
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        try:
            query = "SELECT * FROM users WHERE username = ? AND password_hash = ? AND is_active = 1"
            result = self.execute_query(query, (username, password_hash))
            
            if result and result.rows:
                return result.rows[0]
            return None
        except Exception as e:
            return None
    
    def get_user_by_username(self, username):
        """קבלת משתמש לפי שם משתמש"""
        try:
            query = "SELECT * FROM users WHERE username = ?"
            result = self.execute_query(query, (username,))
            
            if result and result.rows:
                return result.rows[0]
            return None
        except Exception as e:
            return None
    
    def create_user(self, username, email, password, first_name, last_name, phone=''):
        """יצירת משתמש חדש"""
        import hashlib
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        try:
            query = """
            INSERT INTO users (username, email, password_hash, first_name, last_name, phone, user_type)
            VALUES (?, ?, ?, ?, ?, ?, 'player')
            """
            result = self.execute_query(query, (username, email, password_hash, first_name, last_name, phone))
            if result and result.last_insert_rowid:
                return result.last_insert_rowid
            return None
        except Exception as e:
            return None
    
    def create_game(self, title, game_date, game_time, location, created_by, description='', max_players=10):
        """יצירת משחק חדש"""
        try:
            query = """
            INSERT INTO games (title, game_date, game_time, location, max_players, created_by, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """
            result = self.execute_query(query, (title, game_date, game_time, location, max_players, created_by, description))
            if result and result.last_insert_rowid:
                return result.last_insert_rowid
            return None
        except Exception as e:
            return None
    
    def register_to_game(self, game_id, user_id, position_id):
        """הרשמה למשחק"""
        try:
            # בדוק אם כבר נרשם
            check_query = "SELECT * FROM game_registrations WHERE game_id = ? AND user_id = ?"
            existing = self.execute_query(check_query, (game_id, user_id))
            
            if existing and existing.rows:
                return {'success': False, 'message': 'כבר נרשמת למשחק זה'}
            
            # בדוק אם הפוזיציה תפוסה
            pos_check_query = "SELECT * FROM game_registrations WHERE game_id = ? AND position_id = ? AND status = 'confirmed'"
            pos_taken = self.execute_query(pos_check_query, (game_id, position_id))
            
            if pos_taken and pos_taken.rows:
                return {'success': False, 'message': 'הפוזיציה הזו כבר תפוסה'}
            
            # הרשם
            insert_query = """
            INSERT INTO game_registrations (game_id, user_id, position_id)
            VALUES (?, ?, ?)
            """
            result = self.execute_query(insert_query, (game_id, user_id, position_id))
            if result:
                return {'success': True, 'message': 'נרשמת בהצלחה למשחק!'}
            else:
                return {'success': False, 'message': 'שגיאה בהרשמה'}
                
        except Exception as e:
            return {'success': False, 'message': f'שגיאה: {str(e)}'}
    
    def cancel_registration(self, game_id, user_id):
        """ביטול הרשמה למשחק"""
        try:
            query = "DELETE FROM game_registrations WHERE game_id = ? AND user_id = ?"
            result = self.execute_query(query, (game_id, user_id))
            return True
        except Exception as e:
            return False

if __name__ == "__main__":
    try:
        db = DatabaseManager()
        print("DatabaseManager נוצר בהצלחה!")
        
        # בדיקה בסיסית
        games = db.get_all_games()
        print(f"נמצאו {len(games)} משחקים במסד הנתונים")
        
    except Exception as e:
        print(f"שגיאה: {e}")