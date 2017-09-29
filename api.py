import boto3
from boto3.dynamodb.conditions import Attr
from flask import Flask, request, redirect, render_template
from flask_cors import CORS
import simplejson as json
import uuid
from datetime import datetime
from config import *
import smtplib


user_id = "ryantrad"
table_name = TABLE_NAME_FORMAT#.format(user_id)


boto_session = boto3.Session(aws_access_key_id = AWS_ACCESS_KEY_ID,
       aws_secret_access_key = AWS_SECRET_ACCESS_KEY)

s3 = boto_session.client('s3')

dynamodb = boto_session.resource('dynamodb', region_name='us-west-2')
dynamo_table = dynamodb.Table(table_name)

users_table = dynamodb.Table('users')

app = Flask(__name__)
CORS(app)


@app.route('/api/photo/<photo_id>', methods = ['GET'])
def get_photo(photo_id):
    try:
        response = dynamo_table.get_item(
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
def add_photo():
    try:
        file = request.files['file']
        
        if not file.filename == '' and _allowed_file(file.filename):
            photo_id = str(uuid.uuid4())
            extension = file.filename.split('.')[-1]
            
            filename = FILE_FORMAT_S3.format(user='null', id=photo_id, extension=extension)
            
            s3.upload_fileobj(file, BUCKET_NAME, filename)
            response = dynamo_table.put_item(
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
def get_photos():
    try:
        response = dynamo_table.scan(Limit=30)['Items']
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
def delete_photo(photo_id):
    try:
        response = dynamo_table.delete_item(
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
def get_tags(photo_id):
    try:
        response = dynamo_table.get_item(
                Key={
                    'photo_id' : photo_id
                }
            )
        return json.dumps({"tags" : response['Item']['tags']}), 200
    except Exception as e:
        return json.dumps({"error" : e}), 500

@app.route('/api/photo/<photo_id>/tags', methods = ['POST'])
def post_tags(photo_id):
    return """<html><h1>API Endpoint under construction</h1></html>"""

@app.route('/api/photo/<photo_id>/tags', methods = ['PUT'])
def put_tags(photo_id):
    return """<html><h1>API Endpoint under construction</h1></html>"""

@app.route('/api/photo/<photo_id>/tags', methods = ['DELETE'])
def delete_tags(photo_id):
    return """<html><h1>API Endpoint under construction</h1></html>"""


@app.route('/')
def index():
    try:
        response = dynamo_table.scan(Limit=3)['Items']
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
        print(e)
        return render_template('home.html', photos=None)

@app.route('/upload')
def upload():
    return render_template('upload_photo.html')

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
        print(users)
        for user in users:
            email = user["email"]
            name = user["name"]
            username = user["username"]
            photos = dynamo_table.scan(FilterExpression = Attr("username").eq(username))
            print(photos)
            total = photos["Count"]
            untagged = 0
            for photo in photos["Items"]:
                if len(photo["tags"]) == 0:
                    untagged += 1
            smtpObj.sendmail(SENDER_ADDRESS, email,
                         'Subject: Untagged photos \n' + name
                             + ', you have ' + str(untagged) + " untagged photos out of " + str(total) + " total photos.")
            print("Single email sent")
        smtpObj.quit()
        return "Email sent"
    except Exception as e:
        print(e)
        return "Email not sent" + str(e)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)