import boto3
from boto3.dynamodb.conditions import Attr, Key
from flask import Flask, request, redirect, render_template, jsonify, g
from flask_cors import CORS
import simplejson as json
import uuid
from datetime import timedelta
from datetime import datetime
from passlib.hash import sha256_crypt
from auth import generate_token, verify_token, authenticate
from config import *
import smtplib
import threading
import time
import dateutil.parser


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
        response = photos_table.query(
                KeyConditionExpression=Key('photo_id').eq(photo_id) & Key('username').eq(g.username),
                ProjectionExpression='s3_key',
                Limit=1
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
                        'tags' : {'count' : 0, 'content' : []},
                        'upload_time' : int((datetime.utcnow() - datetime(1970, 1,1)).total_seconds())
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
                ProjectionExpression='photo_id, upload_time, tags, s3_key',
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
            del photo['s3_key']
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
                },
                ProjectionExpression='tags'
            )
        photo = response['Item']
        return json.dumps({"tags" : response['Item']['tags']}), 200
    except Exception as e:
        return json.dumps({"error" : str(e)}), 500


@app.route('/api/photo/<photo_id>/tags', methods = ['POST'])
@authenticate
def put_tags(photo_id):
    try:
        data = request.get_json()
        tags = data['tags']

        for type in tags.iterkeys():
            tag = tags[type]
            count = len(tag)
            response = photos_table.update_item(
                    Key={
                        'photo_id' : photo_id,
                        'username' : g.username
                    },
                    UpdateExpression='SET #tag.#type = list_append(#tag.#type, :newtags)  ADD #tag.#count :inc',
                    ExpressionAttributeNames={
                        '#tag' : 'tags',
                        '#type' : type,
                        '#count' : 'count'
                    },
                    ExpressionAttributeValues={
                        ':newtags' : tag,
                        ':inc' : count
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
    try:
        data = request.get_json()
        tags = data['tags']

        for type in tags.iterkeys():
            tag = tags[type]

            response = photos_table.get_item(
                    Key={
                        'photo_id' : photo_id,
                        'username' : g.username
                    },
                    ProjectionExpression='#tag.#type',
                    ExpressionAttributeNames={
                        '#tag' : 'tags',
                        '#type' : type
                    }
                )
            remove_string = 'REMOVE '
            count = 0
            for item in tag:
                if item in response['Item']['tags'][type]:
                    remove_string += ' #tag.#type[{}],'.format(response['Item']['tags'][type].index(item))
                    count -= 1
            remove_string = remove_string[:-1]
            remove_string = '' if count == 0 else remove_string

            response = photos_table.update_item(
                    Key={
                        'photo_id' : photo_id,
                        'username' : g.username
                    },
                    UpdateExpression= remove_string + ' ADD #tag.#count :inc',
                    ExpressionAttributeNames={
                        '#tag' : 'tags',
                        '#type' : type,
                        '#count' : 'count'
                    },
                    ExpressionAttributeValues={
                        ':inc' : count
                    },
                    ReturnValues='ALL_NEW'
                )

        photo = response['Attributes']
        return json.dumps({"updated" : photo}), 200
    except Exception as e:
        return json.dumps({"error" : str(e)}), 500


@app.route('/api/photos/filter', methods = ['POST'])
@authenticate
def filter():
    try:
        query_filter = Attr('username').eq(g.username)

        data = request.get_json()
        filters = data['filters']
        for query in filters:
            new_filter = _format_filter(query['attribute'], query['expression'])
            query_filter = query_filter & new_filter if new_filter else query_filter

        response = photos_table.scan(
                FilterExpression=query_filter,
                ProjectionExpression='photo_id, upload_time, tags, s3_key',
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
            del photo['s3_key']
            
        if not 'from recent' in data or not data['from recent']:
            new_filter = {}
            new_filter['filters'] = filters
            new_filter['time'] = int((datetime.utcnow() - datetime(1970, 1,1)).total_seconds())
            users_table.update_item(
                    Key={
                            'username' : g.username
                    },
                    UpdateExpression='SET searches = list_append(:newfilter, searches)',
                    ExpressionAttributeValues={
                        ':newfilter' : [new_filter]
                    }
                );
        return json.dumps(photos), 200

    except Exception as e:
       return json.dumps({"error" : str(e)}), 500


@app.route('/api/user', methods = ['GET'])
@authenticate
def get_user():
    try:
        response = users_table.get_item(
                Key={
                    'username' : g.username
                },
                ProjectionExpression='username, email, notification'
            )

        user = response['Item']
        return json.dumps({"user" : user}), 200
    except Exception as e:
        return json.dumps({"error" : str(e)}), 500

@app.route('/api/user', methods = ['POST'])
@authenticate
def update_user():
    try:
        data = request.get_json()
        email = data['email'] if 'email' in data else None
        password = data['password'] if 'password' in data else None
        notification = data['notification'] if 'notification' in data else None
        
        update_exp = []
        update_exp_names = {}
        update_exp_values = {}
        if email:
            update_exp.append('#email = :newemail')
            update_exp_names['#email'] = 'email'
            update_exp_values[':newemail'] = email
        if password:
            password = sha256_crypt.encrypt(password)
            update_exp.append('#password = :newpassword')
            update_exp_names['#password'] = 'password'
            update_exp_values[':newpassword'] = password
        if notification:        
            update_exp.append('#notification = :newnotification')
            update_exp_names['#notification'] = 'notification'
            update_exp_values[':newnotification'] = notification
        
        if len(update_exp) > 0:
            response = users_table.update_item(
                        Key={
                            'username' : g.username
                        },
                        UpdateExpression='SET ' + ','.join(update_exp),
                        ExpressionAttributeNames=update_exp_names,
                        ExpressionAttributeValues=update_exp_values
                    )

        return json.dumps({"success" : "user updated"}), 200
    except Exception as e:
       return json.dumps({"error" : str(e)}), 500
       
       
@app.route('/login', methods = ['POST'])
def login():
    try:
        username = request.values.get('username')
        password = request.values.get('password')
        response = users_table.get_item(
                Key={
                    'username' : username
                },
                ProjectionExpression='password',
            )
        p = response['Item']['password']
        if sha256_crypt.verify(password, p):
            return json.dumps({'status' : 'login successful', 'token' : generate_token(username)}), 200
        else:
            return json.dumps({'status' : 'login failed' }), 422
    except Exception as e:
        return json.dumps({"error" : str(e)}), 500

@app.route('/register', methods = ['POST'])
def register():
    try:
        username = request.values.get('username')
        password = request.values.get('password')
        email = request.values.get('email')
        name = request.values.get('name')

        exists = users_table.query(
                KeyConditionExpression=Key('username').eq(username),
                Limit=1
            )['Count'] > 0

        if exists:
            return json.dumps({'error' : 'username taken'}), 409

        password = sha256_crypt.encrypt(password)

        response = users_table.put_item(
                Item={
                    'username' : username,
                    'email' : email,
                    'name' : name,
                    'password' : password,
					'notification' : 7
                },
                ConditionExpression='attribute_not_exists(username)'
            )
        return json.dumps({'status' : 'login successful', 'token' : generate_token(username)}), 200


    except Exception as e:
        print e
        return json.dumps({'error' : str(e)}), 500
        

@app.route('/api/recent_searches', methods = ['GET'])
@authenticate
def get_recent_searches():
    try:
        response = users_table.query(
                KeyConditionExpression=Key('username').eq('admin'),
                Limit=1,
                ProjectionExpression='searches[0], searches[1], searches[2]'
            );
        
        searches = response['Items'][0]['searches'] if 'searches' in response['Items'][0] else []
        return json.dumps({"searches" : searches}), 200

    except Exception as e:
       return json.dumps({"error" : str(e)}), 500

# @app.route('/')
# def index():
    # try:
        # response = photos_table.scan(Limit=3)['Items']
        # for photo in response:
            # key = photo['s3_key']
            # url = s3.generate_presigned_url(
                # ClientMethod='get_object',
                # Params={
                    # 'Bucket' : BUCKET_NAME,
                    # 'Key' : key
                # }
            # )
            # photo['url'] = url
        # if response:
            # return render_template('home.html', photos = response)
        # else:
            # return render_template('home.html', photos = None)
    # except Exception as e:
        # return render_template('home.html', photos=None)


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
            notification = user["notification"]
            lastdate = user["datetime"]
            photos = photos_table.scan(FilterExpression = Attr("username").eq(username))
            total = photos["Count"]
            untagged = 0
            for photo in photos["Items"]:
                if photo["tags"]["count"] == 0:
                    untagged += 1
            if untagged < 0:
                thedate = dateutil.parser.parse(lastdate)
                thedate = thedate + datetime.timedelta(days=int(notification))
                if thedate <= datetime.now():
                    thedate = datetime.now().date()
                    smtpObj.sendmail(SENDER_ADDRESS, email,
                         'Subject: Untagged photos \n' + name
                             + ', you have ' + str(untagged) + " untagged photos out of " + str(total) + " total photos.")
                    response = users_table.update_item(
                        Key={
                            'username': username
                        },
                        UpdateExpression="SET datetime = :thedate",
                        ExpressionAttributeValues={":thedate": str(thedate)}
                    )
        smtpObj.quit()
        return "Email sent"
    except Exception as e:
        return "Email not sent" + str(e)


def _allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _format_filter(attribute, expression):
    conditions = {
        'begins_with' : {
                'function' : lambda att, exp : Attr(att).begins_with(exp['value']),
                'requires' : set(['value'])
            },
        'between' : {
                'function' : lambda att, exp : Attr(att).between(exp['low'], exp['high']),
                'requires' : set(['low', 'high'])
            },
        'contains' : {
                'function' : lambda att, exp : Attr(att).contains(exp['value']),
                'requires' : set(['value'])
            },
        'eq' : {
                'function' : lambda att, exp : Attr(att).eq(exp['value']),
                'requires' : set(['value'])
            },
        'exists' : {
                'function' : lambda att, exp : Attr(att).exists(),
                'requires' : set([])
            },
        'gt' : {
                'function' : lambda att, exp : Attr(att).gt(exp['value']),
                'requires' : set(['value'])
            },
        'gte' : {
                'function' : lambda att, exp : Attr(att).gte(exp['value']),
                'requires' : set(['value'])
            },
        'is_in' : {
                'function' : lambda att, exp : Attr(att).is_in(exp['value']),
                'requires' : set(['value'])
            },
        'lt' : {
                'function' : lambda att, exp : Attr(att).lt(exp['value']),
                'requires' : set(['value'])
            },
        'lte' : {
                'function' : lambda att, exp : Attr(att).lte(exp['value']),
                'requires' : set(['value'])
            },
        'ne' : {
                'function' : lambda att, exp : Attr(att).ne(exp['value']),
                'requires' : set(['value'])
            },
        'not_exists' : {
                'function' : lambda att, exp : Attr(att).not_exists(),
                'requires' : set([])
            }
    }

    if type(expression) is dict:
        if 'operation' in expression and expression['operation'] in conditions:
            if conditions[expression['operation']]['requires'].issubset(expression.keys()):
                return conditions[expression['operation']]['function'](attribute, expression)
    return None

def autoEmail():
    while True:
        email()

threadObj = threading.Thread(target=autoEmail)
threadObj.start()


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
