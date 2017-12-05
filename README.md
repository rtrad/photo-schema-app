# Intrapic: A photo-schema-app
Georgia Tech CS 3312 Fall 2017
Team 7145

## Installation
### PRE-REQUISITES
* You must have Python version 2.7 installed and configured prior to installation (see https://www.python.org/downloads/)
* You must have NodeJS version 3.10 installed and configured with npm prior to installation (see https://nodejs.org/en/download/)
* You must already have an AWS account (see https://aws.amazon.com/free/)
### DOWNLOAD
Download or clone this git repository 
### DEPENDENCIES
* In the root directory, run the following

```pip install -r requirements.txt```

* In frontend/, run the following

```npm install```

### INITIALIZATION and SETUP
* Add your AWS access key and secret key into the config.py file on lines 2 and 3 (see http://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html)
* Set APP_KEY in config.py (line 12) to your own randomly generated, secure string, or you can use `os.random(24)` to generate one in python
* Initialize your AWS environment by running the following in the root directory

```python setup.py```

### RUNNING APPLICATION
* There are two parts to running the application: running the backend and running the frontend
* To run the backend, run the following in the root directory

```python api.py```

* To run the frontend, run the following in frontend/

```npm start```

* Finally, to access the application, open a web browser and head to localhost on port 3000 (http://localhost:3000/)
