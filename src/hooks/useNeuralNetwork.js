import { useState, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

export const useNeuralNetwork = () => {
  const [model, setModel] = useState(null);
  const [weights, setWeights] = useState([]);
  const [activations, setActivations] = useState([]);
  const [biases, setBiases] = useState([]);
  const previousWeightsRef = useRef([]);

  const createModel = useCallback((config) => {
    const { inputSize, hiddenLayers, outputSize, activation, modelType } = config;
    
    const newModel = tf.sequential();
    
    const hiddenActivation = activation || 'sigmoid';
    const outputActivation = modelType === 'Linear' ? 'linear' : 'sigmoid';
    
    newModel.add(tf.layers.dense({
      units: hiddenLayers[0],
      inputShape: [inputSize],
      activation: hiddenActivation,
      kernelInitializer: 'glorotNormal',
      biasInitializer: 'zeros'
    }));
    
    for (let i = 1; i < hiddenLayers.length; i++) {
      newModel.add(tf.layers.dense({
        units: hiddenLayers[i],
        activation: hiddenActivation,
        kernelInitializer: 'glorotNormal',
        biasInitializer: 'zeros'
      }));
    }
    
    newModel.add(tf.layers.dense({
      units: outputSize,
      activation: outputActivation,
      kernelInitializer: 'glorotNormal',
      biasInitializer: 'zeros'
    }));
    
    const initialWeights = [];
    const initialBiases = [];
    
    newModel.layers.forEach(layer => {
      const layerWeights = layer.getWeights();
      if (layerWeights.length > 0) {
        const weightValues = Array.from(layerWeights[0].dataSync());
        const biasValues = Array.from(layerWeights[1].dataSync());
        initialWeights.push(weightValues);
        initialBiases.push(biasValues);
      }
    });
    
    previousWeightsRef.current = JSON.parse(JSON.stringify(initialWeights));
    
    setWeights(initialWeights);
    setBiases(initialBiases);
    setModel(newModel);
    
    return newModel;
  }, []);

  const updateWeights = useCallback(() => {
    if (!model) return;
    
    const currentWeights = [];
    const currentBiases = [];
    
    model.layers.forEach(layer => {
      const layerWeights = layer.getWeights();
      if (layerWeights.length > 0) {
        const weightValues = Array.from(layerWeights[0].dataSync());
        const biasValues = Array.from(layerWeights[1].dataSync());
        currentWeights.push(weightValues);
        currentBiases.push(biasValues);
      }
    });
    
    setWeights(currentWeights);
    setBiases(currentBiases);
  }, [model]);

  const calculateActivations = useCallback((inputData) => {
    if (!model) return;
    
    try {
      const input = tf.tensor2d([inputData]);
      const layerActivations = [];
      
      let currentOutput = input;
      for (const layer of model.layers) {
        currentOutput = layer.apply(currentOutput);
        const activationData = Array.from(currentOutput.dataSync());
        layerActivations.push(activationData);
      }
      
      setActivations(layerActivations);
      input.dispose();
      
      return layerActivations;
    } catch (error) {
      console.error('Error calculating activations:', error);
    }
  }, [model]);

  const updateModel = useCallback((config) => {
    if (model) {
      model.dispose();
    }
    return createModel(config);
  }, [model, createModel]);

  const dispose = useCallback(() => {
    if (model) {
      model.dispose();
      setModel(null);
      setWeights([]);
      setActivations([]);
      setBiases([]);
    }
  }, [model]);

  return {
    model,
    weights,
    activations,
    biases,
    createModel,
    updateModel,
    updateWeights,
    calculateActivations,
    dispose
  };
};
