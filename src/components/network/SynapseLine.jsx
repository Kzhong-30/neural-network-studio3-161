import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SynapseLine = ({ from, to, weight, isTraining, pulseIntensity = 0 }) => {
  const lineRef = useRef();
  const offsetRef = useRef(0);

  useFrame((state, delta) => {
    if (lineRef.current && isTraining) {
      offsetRef.current += delta * 2;
      lineRef.current.material.dashOffset = offsetRef.current;
      const pulseOpacity = 0.3 + Math.abs(Math.sin(offsetRef.current)) * 0.3 + pulseIntensity * 0.4;
      lineRef.current.material.opacity = Math.min(pulseOpacity, 1);
    }
  });

  const normalizedWeight = Math.tanh(weight * 2);
  const lineWidth = Math.abs(normalizedWeight) * 1.5 + 0.3;
  const opacity = Math.abs(normalizedWeight) * 0.6 + 0.2;
  
  const color = weight > 0 
    ? new THREE.Color(0, 1, 0.5) 
    : new THREE.Color(1, 0.3, 0.3);

  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineDashedMaterial
        color={color}
        opacity={opacity}
        transparent={true}
        dashSize={0.2}
        gapSize={0.1}
        linewidth={lineWidth}
      />
    </line>
  );
};

export default SynapseLine;
