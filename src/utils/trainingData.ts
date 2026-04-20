import * as tf from '@tensorflow/tfjs';
import { ModelType, TrainingData } from '../types';

export const generateTrainingData = (modelType: ModelType, size: number = 100): TrainingData => {
  const inputs: number[][] = [];
  const outputs: number[][] = [];

  switch (modelType) {
    case 'XOR': {
      for (let i = 0; i < size; i++) {
        const a = Math.round(Math.random());
        const b = Math.round(Math.random());
        inputs.push([a, b]);
        outputs.push([a ^ b]);
      }
      break;
    }

    case 'Linear': {
      for (let i = 0; i < size; i++) {
        const x = Math.random() * 4 - 2;
        const noise = (Math.random() - 0.5) * 0.4;
        const y = 2 * x + 1 + noise;
        inputs.push([x]);
        outputs.push([y]);
      }
      break;
    }

    case 'Circle': {
      for (let i = 0; i < size; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random());
        
        if (Math.random() > 0.5) {
          const r = radius * 0.6;
          inputs.push([
            r * Math.cos(angle),
            r * Math.sin(angle)
          ]);
          outputs.push([1]);
        } else {
          const r = 0.8 + radius * 0.4;
          inputs.push([
            r * Math.cos(angle),
            r * Math.sin(angle)
          ]);
          outputs.push([0]);
        }
      }
      break;
    }
  }

  return { inputs, outputs };
};

export const getDefaultConfig = (modelType: ModelType) => {
  switch (modelType) {
    case 'XOR':
      return {
        inputSize: 2,
        hiddenLayers: [4, 4],
        outputSize: 1,
        learningRate: 0.5,
        activation: 'sigmoid' as const,
        loss: 'meanSquaredError' as const,
        epochs: 1000,
        batchSize: 4
      };
    case 'Linear':
      return {
        inputSize: 1,
        hiddenLayers: [8, 8],
        outputSize: 1,
        learningRate: 0.01,
        activation: 'relu' as const,
        loss: 'meanSquaredError' as const,
        epochs: 500,
        batchSize: 10
      };
    case 'Circle':
      return {
        inputSize: 2,
        hiddenLayers: [8, 8, 8],
        outputSize: 1,
        learningRate: 0.1,
        activation: 'relu' as const,
        loss: 'binaryCrossentropy' as const,
        epochs: 1000,
        batchSize: 16
      };
  }
};

export const calculateAccuracy = (predictions: tf.Tensor, labels: tf.Tensor): number => {
  const predArray = predictions.arraySync() as number[][];
  const labelArray = labels.arraySync() as number[][];
  
  let correct = 0;
  for (let i = 0; i < predArray.length; i++) {
    const pred = predArray[i][0] > 0.5 ? 1 : 0;
    const label = labelArray[i][0] > 0.5 ? 1 : 0;
    if (pred === label) correct++;
  }
  
  return correct / predArray.length;
};
