import { useState, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { NetworkConfig, LayerWeights, ModelType, TrainingData } from '../types';
import { generateTrainingData, getDefaultConfig } from '../utils/trainingData';

export const useNeuralNetwork = () => {
  const [model, setModel] = useState<tf.Sequential | null>(null);
  const [layerWeights, setLayerWeights] = useState<LayerWeights[]>([]);
  const [layerActivations, setLayerActivations] = useState<number[][]>([]);
  const [trainingData, setTrainingData] = useState<TrainingData>({ inputs: [], outputs: [] });
  const modelRef = useRef<tf.Sequential | null>(null);

  const createModel = useCallback((config: NetworkConfig, modelType: ModelType) => {
    const newModel = tf.sequential();
    
    newModel.add(tf.layers.dense({
      units: config.hiddenLayers[0],
      inputShape: [config.inputSize],
      activation: config.activation,
      kernelInitializer: 'glorotUniform',
      biasInitializer: 'zeros'
    }));

    for (let i = 1; i < config.hiddenLayers.length; i++) {
      newModel.add(tf.layers.dense({
        units: config.hiddenLayers[i],
        activation: config.activation,
        kernelInitializer: 'glorotUniform',
        biasInitializer: 'zeros'
      }));
    }

    newModel.add(tf.layers.dense({
      units: config.outputSize,
      activation: config.outputSize === 1 ? 'sigmoid' : 'softmax',
      kernelInitializer: 'glorotUniform',
      biasInitializer: 'zeros'
    }));

    const data = generateTrainingData(modelType);
    setTrainingData(data);

    const weights: LayerWeights[] = [];
    const activations: number[][] = [];

    newModel.layers.forEach((layer, index) => {
      const layerWeights = layer.getWeights();
      if (layerWeights.length >= 2) {
        const kernel = layerWeights[0];
        const bias = layerWeights[1];
        
        weights.push({
          weights: kernel.dataSync() as Float32Array,
          biases: bias.dataSync() as Float32Array
        });

        const layerSize = config.hiddenLayers[index] || config.outputSize;
        activations.push(new Array(layerSize).fill(0));
      }
    });

    activations.unshift(new Array(config.inputSize).fill(0));

    setLayerWeights(weights);
    setLayerActivations(activations);
    setModel(newModel);
    modelRef.current = newModel;

    return { model: newModel, weights, activations, trainingData: data };
  }, []);

  const updateLayerWeights = useCallback(() => {
    if (!modelRef.current) return;

    const weights: LayerWeights[] = [];
    modelRef.current.layers.forEach((layer) => {
      const layerWeights = layer.getWeights();
      if (layerWeights.length >= 2) {
        weights.push({
          weights: layerWeights[0].dataSync() as Float32Array,
          biases: layerWeights[1].dataSync() as Float32Array
        });
      }
    });

    setLayerWeights(weights);
  }, []);

  const updateActivations = useCallback((inputData: number[][]) => {
    if (!modelRef.current || inputData.length === 0) return;

    const inputTensor = tf.tensor2d(inputData);
    const activations: number[][] = [];

    let currentOutput: tf.Tensor = inputTensor;
    activations.push(Array.from(inputData[0]));

    for (let i = 0; i < modelRef.current.layers.length; i++) {
      currentOutput = modelRef.current.layers[i].apply(currentOutput) as tf.Tensor;
      const activationData = currentOutput.dataSync();
      
      const layerActivation: number[] = [];
      for (let j = 0; j < activationData.length; j++) {
        layerActivation.push(activationData[j]);
      }
      activations.push(layerActivation);
    }

    setLayerActivations(activations);
    inputTensor.dispose();
    currentOutput.dispose();
  }, []);

  const initializeModel = useCallback((modelType: ModelType) => {
    const config = getDefaultConfig(modelType);
    return createModel(config, modelType);
  }, [createModel]);

  return {
    model,
    layerWeights,
    layerActivations,
    trainingData,
    createModel,
    initializeModel,
    updateLayerWeights,
    updateActivations
  };
};
