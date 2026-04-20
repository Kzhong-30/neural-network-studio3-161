import React, { useMemo, useState, useCallback } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import NeuronNode from './NeuronNode';
import SynapseLine from './SynapseLine';
import { NetworkConfig, LayerWeights } from '../../types';

interface NetworkVisualizerProps {
  networkConfig: NetworkConfig;
  layerWeights: LayerWeights[];
  layerActivations: number[][];
  isTraining: boolean;
  trainingEpoch: number;
}

interface NeuronData {
  position: THREE.Vector3;
  layerIndex: number;
  neuronIndex: number;
  activation: number;
  bias: number;
}

interface SynapseData {
  from: THREE.Vector3;
  to: THREE.Vector3;
  weight: number;
  layerIndex: number;
}

const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({
  networkConfig,
  layerWeights,
  layerActivations,
  isTraining,
  trainingEpoch
}) => {
  const [hoveredNeuron, setHoveredNeuron] = useState<{ layerIndex: number; neuronIndex: number } | null>(null);

  const { neurons, synapses, layerSizes } = useMemo(() => {
    const { inputSize, hiddenLayers, outputSize } = networkConfig;
    const layers = [inputSize, ...hiddenLayers, outputSize];
    
    const layerSpacing = 4;
    const neuronSpacing = 1.5;
    const neurons: NeuronData[] = [];
    const synapses: SynapseData[] = [];

    const layerPositions: THREE.Vector3[][] = [];

    layers.forEach((neuronCount, layerIndex) => {
      const layerPos: THREE.Vector3[] = [];
      const x = (layerIndex - (layers.length - 1) / 2) * layerSpacing;
      const yOffset = (neuronCount - 1) * neuronSpacing / 2;

      for (let i = 0; i < neuronCount; i++) {
        const y = i * neuronSpacing - yOffset;
        const z = 0;
        const position = new THREE.Vector3(x, y, z);
        layerPos.push(position);

        const activation = layerActivations[layerIndex]?.[i] || 0;
        const bias = layerWeights[layerIndex]?.biases?.[i] || 0;

        neurons.push({
          position,
          layerIndex,
          neuronIndex: i,
          activation,
          bias
        });
      }

      layerPositions.push(layerPos);
    });

    for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
      const currentLayerSize = layers[layerIndex];
      const nextLayerSize = layers[layerIndex + 1];

      for (let i = 0; i < currentLayerSize; i++) {
        for (let j = 0; j < nextLayerSize; j++) {
          const weight = layerWeights[layerIndex]?.weights?.[i * nextLayerSize + j] || 0;

          synapses.push({
            from: layerPositions[layerIndex][i],
            to: layerPositions[layerIndex + 1][j],
            weight,
            layerIndex
          });
        }
      }
    }

    return { neurons, synapses, layerSizes: layers };
  }, [networkConfig, layerWeights, layerActivations]);

  const handleNeuronHover = useCallback((info: { layerIndex: number; neuronIndex: number; activation: number; bias: number } | null) => {
    if (info) {
      setHoveredNeuron({ layerIndex: info.layerIndex, neuronIndex: info.neuronIndex });
    } else {
      setHoveredNeuron(null);
    }
  }, []);

  const getPulseIntensity = useCallback((layerIndex: number, neuronIndex: number) => {
    if (!isTraining) return 0;
    
    const epochPhase = (trainingEpoch % 10) / 10;
    const layerPhase = layerIndex / layerSizes.length;
    const neuronPhase = neuronIndex / layerSizes[layerIndex];
    
    const pulse = Math.sin((epochPhase + layerPhase + neuronPhase) * Math.PI * 2);
    return Math.max(0, pulse * 0.5);
  }, [isTraining, trainingEpoch, layerSizes]);

  const getSynapsePulseIntensity = useCallback((layerIndex: number) => {
    if (!isTraining) return 0;
    
    const epochPhase = (trainingEpoch % 10) / 10;
    const layerPhase = layerIndex / layerSizes.length;
    
    const pulse = Math.sin((epochPhase + layerPhase) * Math.PI * 3);
    return Math.max(0, pulse * 0.4);
  }, [isTraining, trainingEpoch, layerSizes]);

  return (
    <group>
      {layerSizes.map((count, index) => (
        <Text
          key={`label-${index}`}
          position={[
            (index - (layerSizes.length - 1) / 2) * 4,
            (count * 1.5) / 2 + 1,
            0
          ]}
          fontSize={0.6}
          color="#64ffda"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
        >
          {index === 0 ? 'Input' : index === layerSizes.length - 1 ? 'Output' : `Hidden ${index}`}
        </Text>
      ))}

      {synapses.map((synapse, index) => (
        <SynapseLine
          key={`synapse-${index}`}
          from={synapse.from}
          to={synapse.to}
          weight={synapse.weight}
          layerIndex={synapse.layerIndex}
          pulseIntensity={getSynapsePulseIntensity(synapse.layerIndex)}
        />
      ))}

      {neurons.map((neuron, index) => (
        <NeuronNode
          key={`neuron-${index}`}
          position={neuron.position}
          layerIndex={neuron.layerIndex}
          neuronIndex={neuron.neuronIndex}
          activation={neuron.activation}
          bias={neuron.bias}
          isHovered={hoveredNeuron?.layerIndex === neuron.layerIndex && hoveredNeuron?.neuronIndex === neuron.neuronIndex}
          onHover={handleNeuronHover}
          pulseIntensity={getPulseIntensity(neuron.layerIndex, neuron.neuronIndex)}
        />
      ))}
    </group>
  );
};

export default NetworkVisualizer;
