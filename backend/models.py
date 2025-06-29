import hashlib
import hmac

def create_user_table(cur):
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255),
            username VARCHAR(100) UNIQUE,
            password_hash VARCHAR(255)
        )
    ''')

def create_transaction_table(cur):
    cur.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            type ENUM('Income', 'Expense'),
            amount INT,
            category VARCHAR(100),
            description TEXT,
            date DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def check_password(password, hashed):
    return hmac.compare_digest(hash_password(password), hashed)
