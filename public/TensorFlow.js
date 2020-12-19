import * as tf from '@tensorflow/tfjs';

const dnn_model = await tf.loadLayersModel('https://storage.googleapis.com/iot-solar-database.appspot.com/TF_JS_model/dnn_model.json');
