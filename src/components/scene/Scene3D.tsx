import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, GridHelper, Stars } from '@react-three/drei';
import * as THREE from 'three';
import NetworkVisualizer from '../network/NetworkVisualizer';
import { NetworkConfig, LayerWeights, TrainingStats } from '../../types';

interface Scene3DProps {
  networkConfig: NetworkConfig;
  layerWeights: LayerWeights[];
  layerActivations: number[][];
  trainingStats: TrainingStats;
}

const Scene3D: React.FC<Scene3DProps> = ({
  networkConfig,
  layerWeights,
  layerActivations,
  trainingStats
}) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#0a0a0a'));
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={[15, 8, 15]}
          fov={45}
          near={0.1}
          far={1000}
        />
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          target={[0, 0, 0]}
        />

        <ambientLight intensity={0.3} />
        
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <pointLight
          position={[-10, -10, -5]}
          intensity={0.5}
          color="#64ffda"
        />
        
        <pointLight
          position={[10, -10, 5]}
          intensity={0.3}
          color="#ff6b6b"
        />

        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        <GridHelper
          args={[30, 30, 0x333333, 0x222222]}
          position={[0, -8, 0]}
        />

        <Suspense fallback={null}>
          <NetworkVisualizer
            networkConfig={networkConfig}
            layerWeights={layerWeights}
            layerActivations={layerActivations}
            isTraining={trainingStats.status === 'training'}
            trainingEpoch={trainingStats.epoch}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
