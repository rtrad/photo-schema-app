import boto3
from flask import Flask, request, redirect, render_template, jsonify
from flask_cors import CORS
import simplejson as json
import uuid
from datetime import datetime
from passlib.hash import sha256_crypt
from auth import generate_token, verify_token, authenticate
from config import *


boto_session = boto3.Session(aws_access_key_id = AWS_ACCESS_KEY_ID,
       aws_secret_access_key = AWS_SECRET_ACCESS_KEY)

s3 = boto_session.client('s3')

dynamodb = boto_session.resource('dynamodb', region_name='us-west-2')
photos_table = dynamodb.Table(PHOTOS_TABLE)
users_table = dynamodb.Table(USERS_TABLE)


app = Flask(__name__)
CORS(app)


@app.route('/api/photo/<photo_id>', methods = ['GET'])
@authenticate
def get_photo(photo_id):
    try:
        response = photos_table.get_item(
                Key={
                    'photo_id' : photo_id
                }
            )
        key = response['Item']['s3_key']
        url = s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket' : BUCKET_NAME,
                    'Key' : key
                }
            )
        return json.dumps({"url":url}), 200
    except Exception as e:
        return json.dumps({"error" : e}), 500

@app.route('/api/photo', methods = ['POST'])
@authenticate
def add_photo():
    try:
        file = request.files['file']
        
        if not file.filename == '' and _allowed_file(file.filename):
            photo_id = str(uuid.uuid4())
            extension = file.filename.split('.')[-1]
            
            filename = FILE_FORMAT_S3.format(user='null', id=photo_id, extension=extension)
            
            s3.upload_fileobj(file, BUCKET_NAME, filename)
            response = photos_table.put_item(
                    Item={
                        'photo_id' : photo_id,
                        's3_key' : filename,
                        'tags' : {
                            'actions' : [],
                            'objects' : [],
                            'people' : [],
                            'places' : [],
                            'sentiment' : [],
                            'time' : [int((datetime.utcnow() - datetime(1970, 1,1)).total_seconds())]
                        }
                    }
                )
            
            return json.dumps({"photo_id" : photo_id}), 200
    except Exception as e:
        return json.dumps({"error" : e}), 500

@app.route('/api/photos/')
@authenticate
def get_photos():
    try:
        response = photos_table.scan(Limit=30)['Items']
        for photo in response:
            key = photo['s3_key']
            url = s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket' : BUCKET_NAME,
                    'Key' : key
                }
            )
            photo['url'] = url
        return json.dumps(response), 200
    except Exception as e:
       return json.dumps({"error" : e}), 500

    
@app.route('/api/photo/<photo_id>', methods = ['DELETE'])
@authenticate
def delete_photo(photo_id):
    try:
        response = photos_table.delete_item(
                Key={
                    'photo_id' : photo_id
                },
                ReturnValues='ALL_OLD'
            )
        key = response['Attributes']['s3_key']
        response = s3.delete_object(
                Bucket=BUCKET_NAME,
                Key=key
            )
        return '200 OK'
    except Exception as e:
        return json.dumps({"error" : e}), 500
    

    
    
    
@app.route('/api/photo/<photo_id>/tags', methods = ['GET'])
@authenticate
def get_tags(photo_id):
    try:
        response = photos_table.get_item(
                Key={
                    'photo_id' : photo_id
                }
            )
        return json.dumps({"tags" : response['Item']['tags']}), 200
    except Exception as e:
        return json.dumps({"error" : e}), 500

@app.route('/api/photo/<photo_id>/tags', methods = ['POST'])
@authenticate
def post_tags(photo_id):
    return """<html><h1>API Endpoint under construction</h1></html>"""

@app.route('/api/photo/<photo_id>/tags', methods = ['PUT'])
@authenticate
def put_tags(photo_id):
    return """<html><h1>API Endpoint under construction</h1></html>"""

@app.route('/api/photo/<photo_id>/tags', methods = ['DELETE'])
@authenticate
def delete_tags(photo_id):
    return """<html><h1>API Endpoint under construction</h1></html>"""

@app.route('/login', methods = ['POST'])
def login():
    try:
        username = request.form['username']
        password = request.form['password']
        p = users_table.get_item(
                Key={
                    'username' : username
                }
            )['Item']['password']
        if sha256_crypt.verify(password, p):
            return json.dumps({'status' : 'login successful', 'token' : generate_token(username)}), 200
        else:
            return json.dumps({'status' : 'login failed' }), 422
    except Exception as e:
        return json.dumps({"error" : e}), 500
    
@app.route('/register', methods = ['POST'])
def register():
    return

    
@app.route('/')
def index():
    try:
        response = photos_table.scan(Limit=3)['Items']
        for photo in response:
            key = photo['s3_key']
            url = s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket' : BUCKET_NAME,
                    'Key' : key
                }
            )
            photo['url'] = url
        if response:
            return render_template('home.html', photos = response)
        else:
            return render_template('home.html', photos = None)
    except Exception as e:
        print e
        return render_template('home.html', photos=None)

@app.route('/upload')
def upload():
    return render_template('upload_photo.html')

def _allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS





if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)