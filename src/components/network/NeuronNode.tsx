import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface NeuronNodeProps {
  position: THREE.Vector3;
  layerIndex: number;
  neuronIndex: number;
  activation: number;
  bias: number;
  isHovered: boolean;
  onHover: (info: { layerIndex: number; neuronIndex: number; activation: number; bias: number } | null) => void;
  pulseIntensity?: number;
}

const NeuronNode: React.FC<NeuronNodeProps> = ({
  position,
  layerIndex,
  neuronIndex,
  activation,
  bias,
  isHovered,
  onHover,
  pulseIntensity = 0
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      const baseScale = 0.4;
      const activationScale = activation * 0.3;
      const pulseScale = pulseIntensity * 0.2 * Math.sin(state.clock.elapsedTime * 8);
      const hoverScale = hovered ? 0.15 : 0;
      const totalScale = baseScale + activationScale + pulseScale + hoverScale;
      
      meshRef.current.scale.setScalar(totalScale);

      const hue = 0.6 - activation * 0.4;
      const saturation = 0.8;
      const lightness = 0.3 + activation * 0.4 + pulseIntensity * 0.2;
      
      materialRef.current.color.setHSL(hue, saturation, lightness);
      materialRef.current.emissive.setHSL(hue, saturation, 0.2 + pulseIntensity * 0.3);
      materialRef.current.emissiveIntensity = 0.3 + activation * 0.5 + pulseIntensity * 0.5;
    }
  });

  const handlePointerOver = (e: THREE.Event) => {
    e.stopPropagation();
    setHovered(true);
    onHover({ layerIndex, neuronIndex, activation, bias });
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover(null);
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      
      {hovered && (
        <Html distanceFactor={10}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            border: '1px solid #64ffda',
            boxShadow: '0 4px 20px rgba(100, 255, 218, 0.3)',
            minWidth: '180px',
            pointerEvents: 'none',
            zIndex: 1000
          }}>
            <div style={{ color: '#64ffda', fontWeight: 'bold', marginBottom: '8px' }}>
              Neuron [{layerIndex}, {neuronIndex}]
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#888' }}>Activation:</span>
              <span style={{ color: '#fff' }}>{activation.toFixed(4)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#888' }}>Bias:</span>
              <span style={{ color: '#fff' }}>{bias.toFixed(4)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Position:</span>
              <span style={{ color: '#fff' }}>[{position.x.toFixed(1)}, {position.y.toFixed(1)}, {position.z.toFixed(1)}]</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default NeuronNode;
