from flask import Flask, request, jsonify, session
import pymysql
from flask_cors import CORS
from flask_session import Session
from datetime import datetime
import pytz
from models import create_user_table, create_transaction_table, hash_password, check_password
import db_config

app = Flask(__name__)
app.secret_key = 'supersecretkey'
app.config['SESSION_TYPE'] = 'filesystem'

Session(app)
CORS(app, supports_credentials=True)

def get_db_connection():
    try:
        connection = pymysql.connect(
            host=db_config.MYSQL_HOST,
            user=db_config.MYSQL_USER,
            password=db_config.MYSQL_PASSWORD,
            database=db_config.MYSQL_DB,
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def init_db():
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            create_user_table(cursor)
            create_transaction_table(cursor)
            connection.commit()
            cursor.close()
            connection.close()
            print("Database tables initialized successfully!")
        except Exception as e:
            print(f"Database initialization failed: {e}")
            if connection:
                connection.close()
    else:
        print("Could not connect to database for initialization")

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data['email']
    username = data['username']
    password = hash_password(data['password'])

    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'message': 'Username already exists'}), 400

        cursor.execute("INSERT INTO users (email, username, password_hash) VALUES (%s, %s, %s)",
                      (email, username, password))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Registration successful'})
    except Exception as e:
        print(f"Error in register: {e}")
        connection.close()
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
        user = cursor.fetchone()
        cursor.close()
        connection.close()

        if user and check_password(password, user['password_hash']):
            session['user_id'] = user['id']
            return jsonify({'message': 'Login successful'})
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Error in login: {e}")
        connection.close()
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/logout', methods=['GET'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})

@app.route('/check')
def check_login():
    if 'user_id' in session:
        return jsonify({'message': 'Logged in'})
    return jsonify({'message': 'Not logged in'}), 401

@app.route('/transactions', methods=['GET'])
def get_transactions():
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401

    user_id = session['user_id']
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute('''
            SELECT t.*, u.username, u.email
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            WHERE t.user_id = %s
            ORDER BY t.date DESC
        ''', (user_id,))
        transactions = cursor.fetchall()
        cursor.close()
        connection.close()

        for tx in transactions:
            if isinstance(tx['date'], datetime):
                tx['date'] = tx['date'].astimezone(pytz.timezone('Asia/Jakarta')).isoformat()

        return jsonify(transactions)
    except Exception as e:
        print(f"Error in get_transactions: {e}")
        connection.close()
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/transactions', methods=['POST'])
def add_transaction():
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401

    data = request.json
    user_id = session['user_id']

    jakarta = pytz.timezone('Asia/Jakarta')
    now = datetime.now(jakarta)

    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO transactions (user_id, type, amount, category, description, date)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (
            user_id,
            data['type'],
            int(data['amount']),
            data['category'],
            data.get('description', ''),
            now
        ))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Transaction added'})
    except Exception as e:
        print(f"Error in add_transaction: {e}")
        connection.close()
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/transactions/<int:id>', methods=['PUT'])
def update_transaction(id):
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401

    data = request.json
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute('''
            UPDATE transactions
            SET type=%s, amount=%s, category=%s, description=%s
            WHERE id=%s AND user_id=%s
        ''', (
            data['type'],
            int(data['amount']),
            data['category'],
            data.get('description', ''),
            id,
            session['user_id']
        ))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Transaction updated'})
    except Exception as e:
        print(f"Error in update_transaction: {e}")
        connection.close()
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401

    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute('DELETE FROM transactions WHERE id=%s AND user_id=%s', (id, session['user_id']))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Transaction deleted'})
    except Exception as e:
        print(f"Error in delete_transaction: {e}")
        connection.close()
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/')
def index():
    return "CashTracker Backend is running"

if __name__ == '__main__':
    init_db()  # Initialize database tables
    app.run(debug=True, port=4000)