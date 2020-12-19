async function stupid() {
    const dnn_model = await tf.loadLayersModel('dnn_model.json');
    dnn_model.predict(tf.tensor([11.0, 15.0,29.597730,56.443897,1.038991,12816.133928])).print();
}

$(document).ready(function(){
    stupid();
});