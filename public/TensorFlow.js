//TENSORFLOW----------------------------------------------------------->

document.addEventListener("DOMContentLoaded", initial);

function initial(){
  tfvis.visor();
  tfvis.visor().close();
  plot_html();
}

async function getData() {

  const DataResponse = await fetch('https://storage.googleapis.com/iot-solar-database.appspot.com/solar_dataset/Dataset_json.json');
  const Data = await DataResponse.json();  
  
  return Data;
}

async function loadModel() {
  const model = await tf.loadLayersModel('JSmodel.json');
  model.predict(tf.tensor2d([-0.1,0.2,0.3],[1,3])).print();
  console.log('lol;');
  return model;
}

function createModel() {
  // Create a sequential model
  const model = tf.sequential(); 
  
  // Add a single input layer
  model.add(tf.layers.dense({inputShape: [3], units: 20, activation:'relu', kernel_initializer:'he_uniform', useBias: true}));

  // adding extra layers
  
  // Add an output layer
  model.add(tf.layers.dense({units: 2, useBias: true}));

  return model;
}

function convertToTensor(data) {
  // Wrapping these calculations in a tidy will dispose any 
  // intermediate tensors.
  
  return tf.tidy(() => {
    // Step 1. Shuffle the data    
    tf.util.shuffle(data);

    // Step 2. Convert data to Tensor
    const inputs_I  = data.map(d => d.IRRADIATION)
    const inputs_AT = data.map(d => d.AMBIENT_TEMPERATURE)
    const inputs_MT = data.map(d => d.MODULE_TEMPERATURE)
    var inputs = [];
    for(i=0;i<inputs_I.length;i++){
      inputs[inputs.length]=inputs_I[i];
      inputs[inputs.length]=inputs_AT[i];
      inputs[inputs.length]=inputs_MT[i];
    }

    const labels_AC = data.map(d => d.AC_POWER);
    const labels_DC = data.map(d => d.DC_POWER);

    var labels = [];
    for(i=0;i<labels_AC.length;i++){
      labels[labels.length]=labels_AC[i];
      labels[labels.length]=labels_DC[i];
    }

    const inputTensor = tf.tensor2d(inputs, [inputs.length/3, 3]);
    const labelTensor = tf.tensor2d(labels, [labels.length/2, 2]);

    //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();  
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));
    return {
      inputs: normalizedInputs,
      labels: normalizedLabels,
      // Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
      labelMax,
      labelMin,
    }
  });  
}

async function trainModel(model, inputs, labels) {
  // Prepare the model for training.  
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ['mse'],
  });
  
  const batchSize = 32;
  const epochs = 50;
  var es = tf.callbacks.earlyStopping({monitor: 'loss'})
  var plot_loss = tfvis.show.fitCallbacks(
      { name: 'Training Performance', tab:'Model Training' },
      ['loss', 'mse'], 
      { height: 200, callbacks: ['onEpochEnd'] }
    );
  
  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: plot_loss,es
  });
}

function testModel(model, inputData, normalizationData) {
  const {inputMax, inputMin, labelMin, labelMax} = normalizationData;  
  
  // Generate predictions for a uniform range of numbers between 0 and 1;
  // We un-normalize the data by doing the inverse of the min-max scaling 
  // that we did earlier.
  const [xs, preds] = tf.tidy(() => {

    const inputs_I  = inputData.map(d => d.IRRADIATION)
    const inputs_AT = inputData.map(d => d.AMBIENT_TEMPERATURE)
    const inputs_MT = inputData.map(d => d.MODULE_TEMPERATURE)
    var inputs = [];
    for(i=0;i<inputs_I.length;i++){
      if(inputs_I[i]>0){
        inputs[inputs.length]=inputs_I[i];
        inputs[inputs.length]=inputs_AT[i];
        inputs[inputs.length]=inputs_MT[i];
      }
    }   
    
    const inputTensor = tf.tensor2d(inputs, [inputs.length/3, 3]);
    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const xs = normalizedInputs;
    //const xs = tf.linspace(0, 1, 100);      
    const preds = model.predict(xs);      
    
    const unNormXs = xs
      .mul(inputMax.sub(inputMin))
      .add(inputMin);
    
    const unNormPreds = preds
      .mul(labelMax.sub(labelMin))
      .add(labelMin);
    
    // Un-normalize the data
    return [unNormXs.dataSync(), unNormPreds.dataSync()];
  });

  var xs_arr = Array.from(xs);
  var preds_arr = Array.from(preds);
  var irr_arr = [];
  var at_arr = [];
  var mt_arr = [];
  var ac_arr = [];
  var dc_arr = [];

  for(i=0;i<preds_arr.length;i++){
    if(i%2==0){
      ac_arr[ac_arr.length] = preds_arr[i];
    }else{
      dc_arr[dc_arr.length] = preds_arr[i];
    }
  }

  for(i=0;i<xs_arr.length;i++){
    irr_arr[irr_arr.length] = xs_arr[i];
    i++;
    at_arr[at_arr.length] = xs_arr[i];
    i++;
    mt_arr[mt_arr.length] = xs_arr[i];
  }

  var o = [];
  for(i=0;i<irr_arr.length;i++){
    var x = {
      'IRRADIATION':irr_arr[i],
      'AMBIENT_TEMPERATURE':at_arr[i],
      'MODULE_TEMPERATURE':mt_arr[i],
      'AC_POWER':ac_arr[i],
      'DC_POWER':dc_arr[i]
    };
    o.push(x);
  }

  const predictedPoints = o.map(d => {
    return {x: d.IRRADIATION, y: d.AC_POWER,};
  });
  
  const originalPoints = inputData.map(d => ({
    x: d.IRRADIATION, y: d.AC_POWER,
  }));

  const predictedPoints1 = o.map(d => {
    return {x: d.IRRADIATION, y: d.DC_POWER,};
  });
  
  const originalPoints1 = inputData.map(d => ({
    x: d.IRRADIATION, y: d.DC_POWER,
  }));
  
  
  tfvis.render.scatterplot(
    {name: 'Irradiation vs AC Power',tab:'Result Charts'}, 
    {values: [originalPoints, predictedPoints], series: ['original', 'predicted']}, 
    {
      xLabel: 'Irradiation',
      yLabel: 'AC Power',
      height: 300
    }
  );

  tfvis.render.scatterplot(
    {name: 'Irradiation vs DC Power',tab:'Result Charts'}, 
    {values: [originalPoints1, predictedPoints1], series: ['original', 'predicted']}, 
    {
      xLabel: 'Irradiation',
      yLabel: 'DC POWER',
      height: 300
    }
  );
}

async function plot_html(){
  const data = await getData();

  const values = data.map(d => ({
    x: d.IRRADIATION,
    y: d.AC_POWER,
  }));

  tfvis.render.scatterplot(
    document.getElementById('IrrvAC'),
    {values: values}, 
    {
      xLabel: 'IRRADIATION',
      yLabel: 'AC Power',
      height: 300
    }
  );

  const values1 = data.map(d => ({
    x: d.AMBIENT_TEMPERATURE,
    y: d.AC_POWER,
  }));

  tfvis.render.scatterplot(
    document.getElementById('AtempvAC'),
    {values: values1}, 
    {
      xLabel: 'Ambient Temperature',
      yLabel: 'AC Power',
      height: 300
    }
  );

  const values2 = data.map(d => ({
    x: d.MODULE_TEMPERATURE,
    y: d.AC_POWER,
  }));

  tfvis.render.scatterplot(
    document.getElementById('MtempvAC'),
    {values: values2}, 
    {
      xLabel: 'Module Temperature',
      yLabel: 'AC Power',
      height: 300
    }
  );

  const values3 = data.map(d => ({
    x: d.IRRADIATION,
    y: d.DC_POWER,
  }));

  tfvis.render.scatterplot(
    document.getElementById('IrrvDC'),
    {values: values3}, 
    {
      xLabel: 'IRRADIATION',
      yLabel: 'DC Power',
      height: 300
    }
  );

  const values4 = data.map(d => ({
    x: d.AMBIENT_TEMPERATURE,
    y: d.DC_POWER,
  }));

  tfvis.render.scatterplot(
    document.getElementById('AtempvDC'),
    {values: values4}, 
    {
      xLabel: 'Ambient Temperature',
      yLabel: 'DC Power',
      height: 300
    }
  );

  const values5 = data.map(d => ({
    x: d.MODULE_TEMPERATURE,
    y: d.DC_POWER,
  }));

  tfvis.render.scatterplot(
    document.getElementById('MtempvDC'),
    {values: values}, 
    {
      xLabel: 'Module Temperature',
      yLabel: 'DC Power',
      height: 300
    }
  );

}

async function run(){
  // Load and plot the original input data that we are going to train on.
  const data = await getData();
  // Create the model
  const model = createModel();  
  tfvis.show.modelSummary({name: 'Model Summary',tab:"Model Summary"}, model);
  tfvis.show.layer({name: 'Model Layers',tab:"Model Summary"}, model.getLayer(undefined, 1));
  
  // Convert the data to a form we can use for training.
  const tensorData = convertToTensor(data);
  const {inputs, labels} = tensorData;
    
  // Train the model  
  await trainModel(model, inputs, labels);
  console.log('Done Training');

  // Make some predictions using the model and compare them to the
  // original data
  testModel(model, data, tensorData);
}

$(document).ready(function(){
  $("#trainmodel").click(function(){

    tfvis.visor().open();
    run();

  });
});

//END TENSORFLOW------------------------------------------------------->