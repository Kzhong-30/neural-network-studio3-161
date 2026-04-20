import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const NeuronNode = ({ position, layerIndex, neuronIndex, activation = 0, isTraining, weightUpdateSignal }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      pulseRef.current += delta * 2;
      
      const baseScale = 0.4 + (activation || 0) * 0.2;
      const pulseScale = isTraining ? 0.05 * Math.sin(pulseRef.current * 3) : 0;
      const weightPulse = weightUpdateSignal ? 0.15 : 0;
      const finalScale = baseScale + pulseScale + weightPulse;
      
      meshRef.current.scale.set(finalScale, finalScale, finalScale);
      
      const hue = layerIndex * 0.25;
      const saturation = 0.8;
      const lightness = 0.4 + (activation || 0) * 0.3;
      const color = new THREE.Color();
      color.setHSL(hue, saturation, lightness);
      meshRef.current.material.color = color;
      
      const emissiveIntensity = activation * 0.8 + (weightUpdateSignal ? 0.5 : 0) + (hovered ? 0.3 : 0);
      meshRef.current.material.emissiveIntensity = emissiveIntensity;
    }
  });

  const layerNames = ['Input', 'Hidden 1', 'Hidden 2', 'Hidden 3', 'Output'];

  return (
    <>
      <mesh
        position={position}
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial
          emissive={new THREE.Color(0x00ffff)}
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {hovered && (
        <Html position={[position[0], position[1] + 0.8, position[2]]} center>
          <div className="neuron-tooltip">
            <div className="tooltip-title">Neuron #{neuronIndex + 1}</div>
            <div className="tooltip-row">
              <span>Layer:</span>
              <span>{layerNames[layerIndex] || `Layer ${layerIndex}`}</span>
            </div>
            <div className="tooltip-row">
              <span>Activation:</span>
              <span>{((activation || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="tooltip-row">
              <span>Position:</span>
              <span>({position.map(p => p.toFixed(2)).join(', ')})</span>
            </div>
          </div>
        </Html>
      )}
    </>
  );
};

export default NeuronNode;
