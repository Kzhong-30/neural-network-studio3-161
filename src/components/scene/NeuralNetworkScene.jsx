import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene3D from './Scene3D';

const LoadingFallback = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#00ffff',
      fontFamily: 'Consolas, monospace',
      fontSize: '18px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '10px' }}>Loading 3D Scene...</div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #00ffff',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
      </div>
    </div>
  );
};

const NeuralNetworkScene = ({
  networkConfig,
  weights = [],
  activations = [],
  biases = [],
  isTraining = false,
  pulseIntensity = 0,
  showGrid = true,
  showAxes = true
}) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0f' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)' }}
      >
        <Suspense fallback={null}>
          <Scene3D
            networkConfig={networkConfig}
            weights={weights}
            activations={activations}
            biases={biases}
            isTraining={isTraining}
            pulseIntensity={pulseIntensity}
            showGrid={showGrid}
            showAxes={showAxes}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default NeuralNetworkScene;
