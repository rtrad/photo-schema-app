import boto3
from boto3.dynamodb.conditions import Attr, Key
from flask import Flask, request, redirect, render_template, jsonify, g
from flask_cors import CORS
import simplejson as json
import uuid
from datetime import datetime
from passlib.hash import sha256_crypt
from auth import generate_token, verify_token, authenticate
from config import *
import smtplib


boto_session = boto3.Session(aws_access_key_id = AWS_ACCESS_KEY_ID,
       aws_secret_access_key = AWS_SECRET_ACCESS_KEY)

s3 = boto_session.client('s3')

dynamodb = boto_session.resource('dynamodb', region_name='us-west-2')
photos_table = dynamodb.Table(PHOTOS_TABLE)
users_table = dynamodb.Table(USERS_TABLE)

users_table = dynamodb.Table('users')

app = Flask(__name__)
CORS(app)


@app.route('/api/photo/<photo_id>', methods = ['GET'])
@authenticate
def get_photo(photo_id):
    try:
        response = photos_table.query(
                KeyConditionExpression=Key('photo_id').eq(photo_id) & Key('username').eq(g.username)
            )
        key = response['Items'][0]['s3_key']
        url = s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket' : BUCKET_NAME,
                    'Key' : key
                }
            )
        return json.dumps({"url":url}), 200
    except Exception as e:
        return json.dumps({"error" : str(e)}), 500

@app.route('/api/photo', methods = ['POST'])
@authenticate
def add_photo():
    try:
        file = request.files['file']
        
        if not file.filename == '' and _allowed_file(file.filename):
            photo_id = str(uuid.uuid4())
            extension = file.filename.split('.')[-1]
            
            filename = FILE_FORMAT_S3.format(user=g.username, id=photo_id, extension=extension)
            
            s3.upload_fileobj(file, BUCKET_NAME, filename)
            response = photos_table.put_item(
                    Item={
                        'photo_id' : photo_id,
                        's3_key' : filename,
                        'username' : g.username,
                        'tags' : [
                        ]
                    }
                )
            
            return json.dumps({"photo_id" : photo_id}), 200
    except Exception as e:
        return json.dumps({"error" : str(e)}), 500

@app.route('/api/photos/')
@authenticate
def get_photos():
    try:
        response = photos_table.scan(
                FilterExpression=Attr('username').eq(g.username),
                Limit=30
            )
        photos = response['Items']
        for photo in photos:
            key = photo['s3_key']
            url = s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket' : BUCKET_NAME,
                    'Key' : key
                }
            )
            photo['url'] = url
        return json.dumps(photos), 200
    except Exception as e:
       return json.dumps({"error" : str(e)}), 500

    
@app.route('/api/photo/<photo_id>', methods = ['DELETE'])
@authenticate
def delete_photo(photo_id):
    try:
        response = photos_table.delete_item(
                Key={
                    'photo_id' : photo_id,
                    'username' : g.username
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
        return json.dumps({"error" : str(e)}), 500
    
    
@app.route('/api/photo/<photo_id>/tags', methods = ['GET'])
@authenticate
def get_tags(photo_id):
    try:
        response = photos_table.get_item(
                Key={
                    'photo_id' : photo_id,
                    'username' : g.username
                }
            )
        photo = response['Item']
        return json.dumps({"tags" : response['Item']['tags']}), 200
    except Exception as e:
        return json.dumps({"error" : str(e)}), 500


@app.route('/api/photo/<photo_id>/tags', methods = ['PUT'])
@authenticate
def put_tags(photo_id):
    try:
        tag = request.form['tags']
        tag = {'type':'content', 'value':tag}
        response = photos_table.update_item(
                Key={
                    'photo_id' : photo_id,
                    'username' : g.username
                },
                UpdateExpression='SET tags = list_append(tags, :newtags)',
                ExpressionAttributeValues={
                    ':newtags' : [tag]
                },
                ReturnValues='ALL_NEW'
            )
        photo = response['Attributes']
        return json.dumps({"updated" : photo}), 200
    except Exception as e:
        return json.dumps({"error" : str(e)}), 500

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
        return json.dumps({"error" : str(e)}), 500
    
@app.route('/register', methods = ['POST'])
def register():
    try:
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        name = request.form['name']
        
        exists = users_table.query(
                KeyConditionExpression=Key('username').eq(username)
            )['Count'] > 0
        
        if exists:
            return json.dumps({'error' : 'username taken'}), 409
          
        password = sha256_crypt.encrypt(password)
        
        response = users_table.put_item(
                Item={
                    'username' : username,
                    'email' : email,
                    'name' : name,
                    'password' : password
                },
                ConditionExpression='attribute_not_exists(username)'
            )
        return json.dumps({'status' : 'login successful', 'token' : generate_token(username)}), 200
        
        
    except Exception as e:
        print e
        return json.dumps({'error' : str(e)}), 500

    
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
        return render_template('home.html', photos=None)



def _allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/email')
def email():
    try:
        smtpObj = smtplib.SMTP(SMPT_SERVER, SMPT_PORT)
        smtpObj.ehlo()
        smtpObj.starttls()
        smtpObj.login(SENDER_ADDRESS, SENDER_PASSWORD)
        users = users_table.scan()['Items']
        for user in users:
            email = user["email"]
            name = user["name"]
            username = user["username"]
            photos = photos_table.scan(FilterExpression = Attr("username").eq(username))
            total = photos["Count"]
            untagged = 0
            for photo in photos["Items"]:
                if len(photo["tags"]) == 0:
                    untagged += 1
            smtpObj.sendmail(SENDER_ADDRESS, email,
                         'Subject: Untagged photos \n' + name
                             + ', you have ' + str(untagged) + " untagged photos out of " + str(total) + " total photos.")
        smtpObj.quit()
        return "Email sent"
    except Exception as e:
        print(e)
        return "Email not sent" + str(e)





if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)