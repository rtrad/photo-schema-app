import boto3
from config import *

def setup():
    boto_session = boto3.Session(aws_access_key_id = AWS_ACCESS_KEY_ID,
       aws_secret_access_key = AWS_SECRET_ACCESS_KEY)

    s3 = boto_session.client('s3')
    dynamodb = boto_session.resource('dynamodb', region_name=REGION)
    
    dynamodb.create_table(
            TableName=PHOTOS_TABLE,
            KeySchema=[
                {
                    'AttributeName': 'photo_id',
                    'KeyType': 'HASH'  #Partition key
                },
                {
                    'AttributeName': 'username',
                    'KeyType': 'RANGE'  #Sort key
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'photo_id',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'username',
                    'AttributeType': 'S'
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            })
            
    dynamodb.create_table(
            TableName=USERS_TABLE,
            KeySchema=[
                {
                    'AttributeName': 'username',
                    'KeyType': 'HASH'  #Partition key
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'username',
                    'AttributeType': 'S'
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            })
    
    s3.create_bucket(
            ACL='private',
            Bucket=BUCKET_NAME,
            CreateBucketConfiguration={
                'LocationConstraint': REGION
            })

if __name__ == '__main__':
    setup()
    