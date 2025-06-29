from flask import Flask, request, jsonify, session
import pymysql
pymysql.install_as_MySQLdb()
from flask_cors import CORS
from flask_session import Session
import MySQLdb.cursors
from flask_mysqldb import MySQL
from datetime import datetime
import pytz
from models import create_user_table, create_transaction_table, hash_password, check_password
import db_config

app = Flask(__name__)
app.secret_key = 'supersecretkey'
app.config['SESSION_TYPE'] = 'filesystem'

app.config['MYSQL_HOST'] = db_config.MYSQL_HOST
app.config['MYSQL_USER'] = db_config.MYSQL_USER
app.config['MYSQL_PASSWORD'] = db_config.MYSQL_PASSWORD
app.config['MYSQL_DB'] = db_config.MYSQL_DB

mysql = MySQL(app)
Session(app)
CORS(app, supports_credentials=True)

with app.app_context():
    print("MySQL connection test:", mysql.connection)
    cur = mysql.connection.cursor()
    create_user_table(cur)
    create_transaction_table(cur)
    mysql.connection.commit()
    cur.close()

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data['email']
    username = data['username']
    password = hash_password(data['password'])

    cur = mysql.connection.cursor()
    cur.execute("SELECT id FROM users WHERE username=%s", (username,))
    if cur.fetchone():
        return jsonify({'message': 'Username already exists'}), 400

    cur.execute("INSERT INTO users (email, username, password_hash) VALUES (%s, %s, %s)",
                (email, username, password))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Registration successful'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cur.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cur.fetchone()
    cur.close()

    if user and check_password(password, user['password_hash']):
        session['user_id'] = user['id']
        return jsonify({'message': 'Login successful'})
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

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
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cur.execute('''
        SELECT t.*, u.username, u.email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE t.user_id = %s
        ORDER BY t.date DESC
    ''', (user_id,))
    transactions = cur.fetchall()
    cur.close()

    for tx in transactions:
        if isinstance(tx['date'], datetime):
            tx['date'] = tx['date'].astimezone(pytz.timezone('Asia/Jakarta')).isoformat()

    return jsonify(transactions)

@app.route('/transactions', methods=['POST'])
def add_transaction():
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401

    data = request.json
    user_id = session['user_id']

    jakarta = pytz.timezone('Asia/Jakarta')
    now = datetime.now(jakarta)

    cur = mysql.connection.cursor()
    cur.execute('''
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
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Transaction added'})

if __name__ == '__main__':
    app.run(debug=True, port=4000)
