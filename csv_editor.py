import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import pandas

cred = credentials.Certificate("admin-sdk.json")
firebase_admin.initialize_app(cred,{
    'databaseURL': 'https://iot-solar-database-default-rtdb.firebaseio.com/'
})

df = pandas.read_csv('dataset-solar/Plant_1_Generation_Data.csv')

