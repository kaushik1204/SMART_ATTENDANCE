from flask_bcrypt import Bcrypt
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv('AUTH_MONGO_URI'))
db = client['TeacherAuthDB']
teacher = db['teachers'].find_one({'email': 'udayakumar@gmail.com'})

if teacher:
    bcrypt = Bcrypt()
    pw_hash = teacher['password']
    print(f"Hash from DB: {pw_hash}")
    # Test common passwords just in case
    for test_pw in ['123456', 'password', 'udaya123']:
        match = bcrypt.check_password_hash(pw_hash, test_pw)
        print(f"Match '{test_pw}': {match}")
else:
    print("Teacher not found")
