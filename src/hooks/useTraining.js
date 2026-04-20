import { useState, useCallback, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

const generateTrainingData = (modelType, size = 200) => {
  let inputs = [];
  let outputs = [];
  
  switch (modelType) {
    case 'XOR':
      for (let i = 0; i < size; i++) {
        const a = Math.round(Math.random());
        const b = Math.round(Math.random());
        inputs.push([a, b]);
        outputs.push([a ^ b]);
      }
      break;
      
    case 'Linear':
      for (let i = 0; i < size; i++) {
        const x = Math.random() * 2 - 1;
        const y = 2 * x + 1 + (Math.random() * 0.2 - 0.1);
        inputs.push([x]);
        outputs.push([y]);
      }
      break;
      
    case 'Circle':
      for (let i = 0; i < size; i++) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        inputs.push([x, y]);
        outputs.push([x * x + y * y < 0.49 ? 1 : 0]);
      }
      break;
      
    default:
      for (let i = 0; i < size; i++) {
        const a = Math.round(Math.random());
        const b = Math.round(Math.random());
        inputs.push([a, b]);
        outputs.push([a ^ b]);
      }
  }
  
  return {
    inputs: tf.tensor2d(inputs),
    outputs: tf.tensor2d(outputs),
    inputsArray: inputs,
    outputsArray: outputs
  };
};

const getModelConfig = (modelType) => {
  switch (modelType) {
    case 'XOR':
      return {
        inputSize: 2,
        hiddenLayers: [4, 4],
        outputSize: 1,
        learningRate: 0.5,
        activation: 'sigmoid',
        modelType: 'XOR'
      };
    case 'Linear':
      return {
        inputSize: 1,
        hiddenLayers: [8, 8],
        outputSize: 1,
        learningRate: 0.01,
        activation: 'relu',
        modelType: 'Linear'
      };
    case 'Circle':
      return {
        inputSize: 2,
        hiddenLayers: [8, 8],
        outputSize: 1,
        learningRate: 0.1,
        activation: 'sigmoid',
        modelType: 'Circle'
      };
    default:
      return {
        inputSize: 2,
        hiddenLayers: [4, 4],
        outputSize: 1,
        learningRate: 0.5,
        activation: 'sigmoid',
        modelType: 'XOR'
      };
  }
};

export const useTraining = (model, networkConfig, updateWeights, calculateActivations) => {
  const [training, setTraining] = useState(false);
  const [stats, setStats] = useState({
    epoch: 0,
    loss: 0,
    accuracy: 0,
    learningRate: networkConfig?.learningRate || 0.1,
    status: 'Ready',
    trainingData: [],
    modelType: networkConfig?.modelType || 'XOR'
  });
  const [pulseIntensity, setPulseIntensity] = useState(0);
  
  const trainingRef = useRef(false);
  const animationFrameId = useRef(null);
  const dataRef = useRef(null);

  const startTraining = useCallback(async () => {
    if (!model || trainingRef.current) return;
    
    setTraining(true);
    trainingRef.current = true;
    setStats(prev => ({ ...prev, status: 'Training' }));
    
    const modelType = networkConfig?.modelType || 'XOR';
    const learningRate = networkConfig?.learningRate || 0.1;
    
    const lossFn = modelType === 'Linear' ? 'meanSquaredError' : 'binaryCrossentropy';
    
    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: lossFn,
      metrics: ['accuracy']
    });
    
    const { inputs, outputs, inputsArray, outputsArray } = generateTrainingData(modelType, 300);
    dataRef.current = { inputs, outputs, inputsArray, outputsArray };
    
    let epoch = 0;
    const maxEpochs = 500;
    const trainingData = [];
    
    const trainLoop = async () => {
      if (!trainingRef.current || epoch >= maxEpochs) {
        stopTraining();
        return;
      }
      
      try {
        const history = await model.fit(inputs, outputs, {
          epochs: 1,
          batchSize: 32,
          shuffle: true,
          verbose: 0
        });
        
        updateWeights();
        
        const sampleIndex = Math.floor(Math.random() * inputsArray.length);
        calculateActivations(inputsArray[sampleIndex]);
        
        const predictions = model.predict(inputs);
        const predVals = predictions.dataSync();
        const actualVals = outputs.dataSync();
        
        let accuracy = 0;
        if (modelType === 'Linear') {
          let totalError = 0;
          for (let i = 0; i < predVals.length; i++) {
            totalError += Math.abs(predVals[i] - actualVals[i]);
          }
          accuracy = 1 - Math.min(totalError / predVals.length, 1);
        } else {
          let correct = 0;
          for (let i = 0; i < predVals.length; i++) {
            const predicted = predVals[i] > 0.5 ? 1 : 0;
            const actual = actualVals[i] > 0.5 ? 1 : 0;
            if (predicted === actual) correct++;
          }
          accuracy = correct / predVals.length;
        }
        
        predictions.dispose();
        
        const loss = history.history.loss[0];
        const lossDelta = epoch > 0 ? Math.abs(loss - (trainingData[trainingData.length - 1]?.loss || loss)) : 0;
        const intensity = Math.min(lossDelta * 100, 1);
        setPulseIntensity(intensity);
        
        trainingData.push({ epoch: epoch + 1, loss, accuracy });
        
        setStats(prev => ({
          ...prev,
          epoch: epoch + 1,
          loss: loss,
          accuracy: accuracy,
          status: 'Training',
          trainingData: [...trainingData]
        }));
        
        epoch++;
        
        animationFrameId.current = requestAnimationFrame(trainLoop);
      } catch (error) {
        console.error('Training error:', error);
        stopTraining();
      }
    };
    
    animationFrameId.current = requestAnimationFrame(trainLoop);
  }, [model, networkConfig, updateWeights, calculateActivations]);
  
  const stopTraining = useCallback(() => {
    trainingRef.current = false;
    setTraining(false);
    setPulseIntensity(0);
    
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    if (dataRef.current) {
      dataRef.current.inputs.dispose();
      dataRef.current.outputs.dispose();
      dataRef.current = null;
    }
    
    setStats(prev => ({
      ...prev,
      status: 'Stopped'
    }));
  }, []);
  
  const resetTraining = useCallback(() => {
    stopTraining();
    setStats({
      epoch: 0,
      loss: 0,
      accuracy: 0,
      learningRate: networkConfig?.learningRate || 0.1,
      status: 'Ready',
      trainingData: [],
      modelType: networkConfig?.modelType || 'XOR'
    });
  }, [stopTraining, networkConfig]);
  
  useEffect(() => {
    return () => {
      if (dataRef.current) {
        dataRef.current.inputs.dispose();
        dataRef.current.outputs.dispose();
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);
  
  return {
    training,
    startTraining,
    stopTraining,
    resetTraining,
    stats,
    pulseIntensity,
    generateTrainingData,
    getModelConfig
  };
};

export { getModelConfig, generateTrainingData };
