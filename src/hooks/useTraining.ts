import { useState, useCallback, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { TrainingStats, ModelType, NetworkConfig, TrainingData, LayerWeights } from '../types';
import { getDefaultConfig, calculateAccuracy } from '../utils/trainingData';

interface UseTrainingProps {
  model: tf.Sequential | null;
  networkConfig: NetworkConfig;
  modelType: ModelType;
  trainingData: TrainingData;
  onWeightsUpdate: (weights: LayerWeights[]) => void;
  onActivationsUpdate: (activations: number[][]) => void;
}

export const useTraining = ({
  model,
  networkConfig,
  modelType,
  trainingData,
  onWeightsUpdate,
  onActivationsUpdate
}: UseTrainingProps) => {
  const [trainingStats, setTrainingStats] = useState<TrainingStats>({
    epoch: 0,
    loss: 0,
    accuracy: 0,
    learningRate: networkConfig.learningRate,
    status: 'idle'
  });

  const trainingRef = useRef(false);
  const epochRef = useRef(0);
  const inputsTensorRef = useRef<tf.Tensor2D | null>(null);
  const outputsTensorRef = useRef<tf.Tensor2D | null>(null);

  useEffect(() => {
    return () => {
      if (inputsTensorRef.current) inputsTensorRef.current.dispose();
      if (outputsTensorRef.current) outputsTensorRef.current.dispose();
    };
  }, []);

  const prepareTensors = useCallback(() => {
    if (inputsTensorRef.current) inputsTensorRef.current.dispose();
    if (outputsTensorRef.current) outputsTensorRef.current.dispose();

    inputsTensorRef.current = tf.tensor2d(trainingData.inputs);
    outputsTensorRef.current = tf.tensor2d(trainingData.outputs);
  }, [trainingData]);

  const updateWeightsFromModel = useCallback(() => {
    if (!model) return;

    const weights: LayerWeights[] = [];
    model.layers.forEach((layer) => {
      const layerWeights = layer.getWeights();
      if (layerWeights.length >= 2) {
        weights.push({
          weights: layerWeights[0].dataSync() as Float32Array,
          biases: layerWeights[1].dataSync() as Float32Array
        });
      }
    });

    onWeightsUpdate(weights);
  }, [model, onWeightsUpdate]);

  const runTrainingEpoch = useCallback(async () => {
    if (!model || !trainingRef.current || !inputsTensorRef.current || !outputsTensorRef.current) {
      return false;
    }

    const config = getDefaultConfig(modelType);
    
    const history = await model.fit(inputsTensorRef.current, outputsTensorRef.current, {
      epochs: 1,
      batchSize: config.batchSize,
      shuffle: true,
      verbose: 0
    });

    const loss = history.history.loss[0] as number;
    
    const predictions = model.predict(inputsTensorRef.current) as tf.Tensor;
    const accuracy = calculateAccuracy(predictions, outputsTensorRef.current);
    predictions.dispose();

    epochRef.current += 1;

    setTrainingStats({
      epoch: epochRef.current,
      loss,
      accuracy,
      learningRate: networkConfig.learningRate,
      status: 'training'
    });

    updateWeightsFromModel();

    if (trainingData.inputs.length > 0) {
      const sampleInput = [trainingData.inputs[0]];
      const inputTensor = tf.tensor2d(sampleInput);
      
      const activations: number[][] = [];
      activations.push(sampleInput[0]);
      
      let currentOutput: tf.Tensor = inputTensor;
      for (let i = 0; i < model.layers.length; i++) {
        currentOutput = model.layers[i].apply(currentOutput) as tf.Tensor;
        const activationData = Array.from(currentOutput.dataSync());
        activations.push(activationData);
      }
      
      onActivationsUpdate(activations);
      
      inputTensor.dispose();
      currentOutput.dispose();
    }

    return epochRef.current < config.epochs;
  }, [model, modelType, networkConfig, trainingData, updateWeightsFromModel, onActivationsUpdate]);

  const startTraining = useCallback(async () => {
    if (!model || trainingRef.current) return;

    model.compile({
      optimizer: tf.train.sgd(networkConfig.learningRate),
      loss: getDefaultConfig(modelType).loss,
      metrics: ['accuracy']
    });

    prepareTensors();
    trainingRef.current = true;
    epochRef.current = 0;

    setTrainingStats(prev => ({ ...prev, status: 'training' }));

    const trainLoop = async () => {
      if (!trainingRef.current) return;

      const shouldContinue = await runTrainingEpoch();
      
      if (shouldContinue && trainingRef.current) {
        requestAnimationFrame(trainLoop);
      } else {
        trainingRef.current = false;
        setTrainingStats(prev => ({ ...prev, status: 'completed' }));
      }
    };

    trainLoop();
  }, [model, networkConfig, modelType, prepareTensors, runTrainingEpoch]);

  const stopTraining = useCallback(() => {
    trainingRef.current = false;
    setTrainingStats(prev => ({ ...prev, status: 'stopped' }));
  }, []);

  const resetTraining = useCallback(() => {
    trainingRef.current = false;
    epochRef.current = 0;
    setTrainingStats({
      epoch: 0,
      loss: 0,
      accuracy: 0,
      learningRate: networkConfig.learningRate,
      status: 'idle'
    });
  }, [networkConfig.learningRate]);

  return {
    trainingStats,
    startTraining,
    stopTraining,
    resetTraining
  };
};
