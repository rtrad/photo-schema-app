import boto3
from flask import Flask, request, redirect, render_template

AWS_ACCESS_KEY_ID = 'AKIAJ2HGDVJI2VVHV4GQ'
AWS_SECRET_ACCESS_KEY = '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'

bucket_name = 'photo-schema-app'
s3 = boto3.client('s3', aws_access_key_id = AWS_ACCESS_KEY_ID,
       aws_secret_access_key = AWS_SECRET_ACCESS_KEY)

app = Flask(__name__)


ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tif', 'gif']
FILE_FORMAT_S3 = '/photos/{user}/{filename}'


@app.route('/api/photo/<photo_id>', methods = ['GET'])
def get_photo(photo_id):
    return """<html><h1>Page under construction</h1></html>"""

@app.route('/api/photo', methods = ['POST'])
def add_photo():
    print request
    file = request.files['file']
    print file
    if not file.filename == '' and _allowed_file(file.filename):
        filename = FILE_FORMAT_S3.format(user='null', filename=file.filename)
        s3.upload_fileobj(file, bucket_name, filename)
        return redirect('/success')
    return redirect('/error')

@app.route('/api/photo/<photo_id>/tags', methods = ['GET'])
def get_tags(photo_id):
    return """<html><h1>Page under construction</h1></html>"""

@app.route('/api/photo/<photo_id>/tags', methods = ['POST'])
def set_tags(photo_id):
    return """<html><h1>Page under construction</h1></html>"""



@app.route('/')
def index():
    return render_template('form.html')


@app.route('/error')
def error():
    return """<html><h1>Encountered an error</h1></html>"""

@app.route('/success')
def success():
    return """<html><h1>File upload successful</h1></html>"""
    

def _allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


if __name__ == '__main__':
    app.run(debug=True)