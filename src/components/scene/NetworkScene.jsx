import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera } from '@react-three/drei';
import NeuronNode from '../network/NeuronNode';
import SynapseLine from '../network/SynapseLine';
import * as THREE from 'three';

const NetworkContent = ({ networkConfig, weights, isTraining, activations = [] }) => {
  const groupRef = useRef();
  const { inputSize, hiddenLayers, outputSize } = networkConfig;
  const layers = [inputSize, ...hiddenLayers, outputSize];

  useFrame((state) => {
    if (groupRef.current && isTraining) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const { neuronPositions, connections } = useMemo(() => {
    const positions = [];
    const conns = [];
    const layerSpacing = 4;
    const neuronSpacing = 1.5;
    const depthSpacing = 1.2;

    layers.forEach((neuronCount, layerIndex) => {
      const layerPositions = [];
      const gridSize = Math.ceil(Math.sqrt(neuronCount));
      const offset = (gridSize - 1) / 2;

      for (let i = 0; i < neuronCount; i++) {
        const gridX = (i % gridSize) - offset;
        const gridY = Math.floor(i / gridSize) - offset;
        const x = (layerIndex - (layers.length - 1) / 2) * layerSpacing;
        const y = gridY * neuronSpacing;
        const z = gridX * depthSpacing;
        layerPositions.push([x, y, z]);
      }

      positions.push(layerPositions);
    });

    if (weights && weights.length > 0) {
      for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
        const currentLayerSize = layers[layerIndex];
        const nextLayerSize = layers[layerIndex + 1];
        const layerWeights = weights[layerIndex] || [];

        for (let i = 0; i < currentLayerSize; i++) {
          for (let j = 0; j < nextLayerSize; j++) {
            const weightIndex = i * nextLayerSize + j;
            if (weightIndex < layerWeights.length) {
              conns.push({
                from: positions[layerIndex][i],
                to: positions[layerIndex + 1][j],
                weight: layerWeights[weightIndex],
                key: `conn-${layerIndex}-${i}-${j}`
              });
            }
          }
        }
      }
    }

    return { neuronPositions: positions, connections: conns };
  }, [layers, weights]);

  const layerLabels = ['Input', ...hiddenLayers.map((_, i) => `Hidden ${i + 1}`), 'Output'];

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color={0xffffff} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={0x00ffff} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />

      <gridHelper args={[30, 30, 0x333333, 0x222222]} position={[0, -3, 0]} />

      {neuronPositions.map((layer, layerIndex) => (
        <Text
          key={`label-${layerIndex}`}
          position={[
            (layerIndex - (layers.length - 1) / 2) * 4,
            Math.max(...layer.map(p => p[1])) + 2,
            0
          ]}
          fontSize={0.6}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
        >
          {layerLabels[layerIndex]}
        </Text>
      ))}

      {connections.map((conn) => (
        <SynapseLine
          key={conn.key}
          from={conn.from}
          to={conn.to}
          weight={conn.weight}
          isTraining={isTraining}
        />
      ))}

      {neuronPositions.map((layer, layerIndex) =>
        layer.map((position, neuronIndex) => (
          <NeuronNode
            key={`neuron-${layerIndex}-${neuronIndex}`}
            position={position}
            layerIndex={layerIndex}
            neuronIndex={neuronIndex}
            activation={activations[layerIndex]?.[neuronIndex] || Math.random() * 0.5}
            isTraining={isTraining}
            weightUpdateSignal={isTraining && Math.random() > 0.95}
          />
        ))
      )}
    </group>
  );
};

const NetworkScene = ({ networkConfig, weights, isTraining }) => {
  return (
    <Canvas
      gl={{ antialias: true, alpha: false }}
      style={{ background: 'linear-gradient(#0a0a1a, #1a1a2e)' }}
      dpr={[1, 2]}
    >
      <PerspectiveCamera makeDefault position={[12, 8, 12]} fov={50} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
      />
      <fog attach="fog" args={['#0a0a1a', 15, 35]} />
      <NetworkContent
        networkConfig={networkConfig}
        weights={weights}
        isTraining={isTraining}
      />
    </Canvas>
  );
};

export default NetworkScene;
