from itsdangerous import TimedJSONWebSignatureSerializer
import json
from functools import wraps
from config import app_key
from flask import request

def generate_token(username, expires=1209600):
    s = TimedJSONWebSignatureSerializer(app_key, expires_in=expires)
    token = s.dumps({
        'username': username
    }).decode('utf-8')
    return token
    
def verify_token(token):
    s = TimedJSONWebSignatureSerializer(app_key)
    try:
        data = s.loads(token)
    except:
        return None
    return data

def authenticate(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authentication', None)
        if token:
            token = token.encode('ascii', 'ignore')
            username = verify_token(token)
            if username:
                return f(*args, **kwargs)    
        return json.dumps({'error' : 'authentication required'}), 401
    return decorated