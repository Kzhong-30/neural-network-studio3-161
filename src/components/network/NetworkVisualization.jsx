import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import NeuronNode from './NeuronNode';
import SynapseLine from './SynapseLine';

const NetworkVisualization = ({
  networkConfig,
  weights = [],
  activations = [],
  biases = [],
  isTraining = false,
  pulseIntensity = 0
}) => {
  const { inputSize, hiddenLayers, outputSize } = networkConfig;
  const layers = [inputSize, ...hiddenLayers, outputSize];
  const groupRef = useRef();
  
  const layerSpacing = 4;
  const neuronSpacing = 1.5;
  
  const neuronPositions = useMemo(() => {
    const positions = [];
    
    layers.forEach((neuronCount, layerIndex) => {
      const layerPositions = [];
      const yOffset = (neuronCount - 1) * neuronSpacing / 2;
      
      for (let i = 0; i < neuronCount; i++) {
        const x = layerIndex * layerSpacing - ((layers.length - 1) * layerSpacing) / 2;
        const y = i * neuronSpacing - yOffset;
        const z = 0;
        layerPositions.push([x, y, z]);
      }
      
      positions.push(layerPositions);
    });
    
    return positions;
  }, [layers, layerSpacing, neuronSpacing]);
  
  const layerNames = useMemo(() => {
    return layers.map((_, index) => {
      if (index === 0) return 'Input';
      if (index === layers.length - 1) return 'Output';
      return `Hidden ${index}`;
    });
  }, [layers]);
  
  const connections = useMemo(() => {
    const conns = [];
    
    if (weights && weights.length > 0) {
      for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
        const currentLayerSize = layers[layerIndex];
        const nextLayerSize = layers[layerIndex + 1];
        const layerWeights = weights[layerIndex] || [];
        
        for (let i = 0; i < currentLayerSize; i++) {
          for (let j = 0; j < nextLayerSize; j++) {
            const weightIndex = i * nextLayerSize + j;
            if (weightIndex < layerWeights.length) {
              const weight = layerWeights[weightIndex];
              const prevWeight = weights[layerIndex + '_prev'] 
                ? weights[layerIndex + '_prev'][weightIndex] 
                : weight;
              
              conns.push({
                id: `conn-${layerIndex}-${i}-${j}`,
                from: neuronPositions[layerIndex][i],
                to: neuronPositions[layerIndex + 1][j],
                weight: weight,
                previousWeight: prevWeight,
                layerIndex
              });
            }
          }
        }
      }
    } else {
      for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
        const currentLayerSize = layers[layerIndex];
        const nextLayerSize = layers[layerIndex + 1];
        
        for (let i = 0; i < currentLayerSize; i++) {
          for (let j = 0; j < nextLayerSize; j++) {
            conns.push({
              id: `conn-${layerIndex}-${i}-${j}`,
              from: neuronPositions[layerIndex][i],
              to: neuronPositions[layerIndex + 1][j],
              weight: (Math.random() - 0.5) * 2,
              previousWeight: (Math.random() - 0.5) * 2,
              layerIndex
            });
          }
        }
      }
    }
    
    return conns;
  }, [weights, layers, neuronPositions]);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });
  
  return (
    <group ref={groupRef}>
      {layers.map((count, index) => (
        <Text
          key={`label-${index}`}
          position={[
            index * layerSpacing - ((layers.length - 1) * layerSpacing) / 2,
            (layers[index] * neuronSpacing / 2) + 1.2,
            0
          ]}
          fontSize={0.4}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {layerNames[index]}
        </Text>
      ))}
      
      {connections.map((conn) => (
        <SynapseLine
          key={conn.id}
          from={conn.from}
          to={conn.to}
          weight={conn.weight}
          previousWeight={conn.previousWeight}
          isTraining={isTraining}
          weightChangeIntensity={pulseIntensity}
        />
      ))}
      
      {neuronPositions.map((layer, layerIndex) =>
        layer.map((position, neuronIndex) => {
          const activation = activations[layerIndex]?.[neuronIndex] || Math.random() * 0.5;
          const bias = biases[layerIndex]?.[neuronIndex] || 0;
          
          return (
            <NeuronNode
              key={`neuron-${layerIndex}-${neuronIndex}`}
              position={position}
              layerIndex={layerIndex}
              neuronIndex={neuronIndex}
              activation={activation}
              bias={bias}
              layerName={layerNames[layerIndex]}
              isTraining={isTraining}
              pulseIntensity={pulseIntensity}
            />
          );
        })
      )}
    </group>
  );
};

export default NetworkVisualization;
