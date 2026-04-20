import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SynapseLineProps {
  from: THREE.Vector3;
  to: THREE.Vector3;
  weight: number;
  layerIndex: number;
  pulseIntensity?: number;
}

const SynapseLine: React.FC<SynapseLineProps> = ({
  from,
  to,
  weight,
  pulseIntensity = 0
}) => {
  const lineRef = useRef<THREE.Line>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  useFrame(() => {
    if (materialRef.current) {
      const absWeight = Math.abs(weight);
      const thickness = Math.max(0.5, absWeight * 3);
      const pulseEffect = pulseIntensity * 2;
      
      materialRef.current.linewidth = thickness + pulseEffect;
      
      if (weight > 0) {
        const greenIntensity = 0.4 + absWeight * 0.4 + pulseIntensity * 0.3;
        materialRef.current.color.setRGB(0.2, greenIntensity, 0.3);
      } else {
        const redIntensity = 0.5 + absWeight * 0.4 + pulseIntensity * 0.3;
        materialRef.current.color.setRGB(redIntensity, 0.2, 0.2);
      }
      
      materialRef.current.opacity = 0.4 + absWeight * 0.4 + pulseIntensity * 0.3;
    }
  });

  const points = React.useMemo(() => [from.clone(), to.clone()], [from, to]);
  
  const geometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        ref={materialRef}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </line>
  );
};

export default SynapseLine;
