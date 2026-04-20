import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const NeuronNode = ({
  position,
  layerIndex,
  neuronIndex,
  activation = 0,
  bias = 0,
  layerName = '',
  isTraining = false,
  pulseIntensity = 0
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  
  const baseColor = useMemo(() => {
    const hue = 0.55 + (layerIndex * 0.1);
    const saturation = 0.8;
    const lightness = 0.3 + activation * 0.4;
    return new THREE.Color().setHSL(hue, saturation, lightness);
  }, [layerIndex, activation]);
  
  const emissiveColor = useMemo(() => {
    return new THREE.Color(0x00ffff);
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.3 : (0.8 + activation * 0.4);
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
      
      if (isTraining) {
        const pulse = Math.sin(state.clock.elapsedTime * 5 + neuronIndex) * 0.5 + 0.5;
        setGlowIntensity(pulse * pulseIntensity);
      } else {
        setGlowIntensity(hovered ? 0.5 : 0.1);
      }
    }
  });
  
  const infoData = {
    layer: layerName || `Layer ${layerIndex}`,
    neuron: neuronIndex,
    activation: activation.toFixed(4),
    bias: bias.toFixed(4)
  };
  
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={glowIntensity}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {hovered && (
        <Html
          position={[0.6, 0.6, 0]}
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            padding: '10px 14px',
            borderRadius: '8px',
            color: '#00ffff',
            fontFamily: 'Consolas, monospace',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            border: '1px solid #00ffff',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '6px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
            Neuron Info
          </div>
          <div>Layer: <span style={{ color: '#fff' }}>{infoData.layer}</span></div>
          <div>Index: <span style={{ color: '#fff' }}>{infoData.neuron}</span></div>
          <div>Activation: <span style={{ color: '#0f0' }}>{infoData.activation}</span></div>
          <div>Bias: <span style={{ color: '#ff0' }}>{infoData.bias}</span></div>
        </Html>
      )}
    </group>
  );
};

export default NeuronNode;
