import boto3
from flask import Flask, request, redirect, render_template, jsonify
import json
import uuid
from datetime import datetime
from config import *


user_id = "ryantrad"
table_name = TABLE_NAME_FORMAT#.format(user_id)


boto_session = boto3.Session(aws_access_key_id = AWS_ACCESS_KEY_ID,
       aws_secret_access_key = AWS_SECRET_ACCESS_KEY)

s3 = boto_session.client('s3')

dynamodb = boto_session.resource('dynamodb', region_name='us-west-2')
dynamo_table = dynamodb.Table(table_name)


app = Flask(__name__)

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
        return jsonify({"url":url})
    except:
        return jsonify({"operation_successful" : False})

@app.route('/api/photo', methods = ['POST'])
def add_photo():
    if 'file' in request.files:
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
            
            return jsonify({"photo_id" : photo_id})
    return jsonify({"operation_successful" : False})

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
        success = True
    except:
        success = False
    return jsonify({"operation_successful" : success})
    

    
    
    
@app.route('/api/photo/<photo_id>/tags', methods = ['GET'])
def get_tags(photo_id):
    try:
        response = dynamo_table.get_item(
                Key={
                    'photo_id' : photo_id
                }
            )
        return jsonify({"tags" : response['Item']['tags']})
    except:
        return jsonify({"operation_successful" : False})

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
        return render_template('home.html', photos = response)
    except Exception as e:
        print e
        return render_template('home.html', photos=[])

@app.route('/upload')
def upload():
    return render_template('upload_photo.html')

def _allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


if __name__ == '__main__':
    app.run(debug=True)