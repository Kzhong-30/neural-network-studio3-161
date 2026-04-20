import * as THREE from 'three';

export interface NetworkConfig {
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  learningRate: number;
  activation: 'sigmoid' | 'relu' | 'tanh';
}

export interface NeuronInfo {
  position: THREE.Vector3;
  layerIndex: number;
  neuronIndex: number;
  activation: number;
  bias: number;
}

export interface SynapseInfo {
  from: THREE.Vector3;
  to: THREE.Vector3;
  weight: number;
  layerIndex: number;
  fromIndex: number;
  toIndex: number;
}

export interface TrainingStats {
  epoch: number;
  loss: number;
  accuracy: number;
  learningRate: number;
  status: 'idle' | 'training' | 'completed' | 'stopped';
}

export interface TrainingData {
  inputs: number[][];
  outputs: number[][];
}

export type ModelType = 'XOR' | 'Linear' | 'Circle';

export interface LayerWeights {
  weights: Float32Array;
  biases: Float32Array;
}
