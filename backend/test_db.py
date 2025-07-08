import pymysql
import db_config

try:
    connection = pymysql.connect(
        host=db_config.MYSQL_HOST,
        user=db_config.MYSQL_USER,
        password=db_config.MYSQL_PASSWORD,
        database=db_config.MYSQL_DB
    )
    print("Database connection successful!")
    
    # Test if we can query the database
    cursor = connection.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"📋 Tables found: {tables}")
    
    cursor.close()
    connection.close()
    
except Exception as e:
    print(f"Database connection failed: {e}")