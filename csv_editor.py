import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import storage
import pandas


cred = credentials.Certificate("admin-sdk.json")
firebase_admin.initialize_app(cred,{
    'databaseURL': 'https://iot-solar-database-default-rtdb.firebaseio.com/',
    'storageBucket':'iot-solar-database.appspot.com'
})

bucket = storage.bucket()


df_g = pandas.read_csv('dataset-solar\Plant_1_Generation_Data.csv')
df_w = pandas.read_csv('dataset-solar\Plant_1_Weather_Sensor_Data.csv')


df_g['DATE'],df_g['TIME']=df_g['DATE_TIME'].str.split(' ',1).str
df_w['DATE'],df_w['TIME']=df_w['DATE_TIME'].str.split(' ',1).str
del df_g['DATE_TIME']
del df_w['DATE_TIME']
df_g = df_g[ ['TIME'] + [ col for col in df_g.columns if col != 'TIME' ] ]
df_w = df_w[ ['TIME'] + [ col for col in df_w.columns if col != 'TIME' ] ]
df_g = df_g[ ['DATE'] + [ col for col in df_g.columns if col != 'DATE' ] ]
df_w = df_w[ ['DATE'] + [ col for col in df_w.columns if col != 'DATE' ] ]


del df_g['DAILY_YIELD']
del df_g['TOTAL_YIELD']


df_g = df_g.groupby(['DATE','TIME'], as_index=False).mean()


import pandas as pd
df_final = pd.merge(df_w, df_g_t, on=['DATE','TIME'])
del pd


json_final = df_final.to_dict('index')


ref = db.reference('Plant_Generation+Sensor_Data/')


ref.set(json_final)


df_final.to_csv(r'dataset-solar\Plant_1_generation+sensor.csv', index = False)