import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SynapseLine = ({
  from,
  to,
  weight = 0,
  previousWeight = 0,
  isTraining = false,
  weightChangeIntensity = 0
}) => {
  const lineRef = useRef();
  const materialRef = useRef();
  const pulseRef = useRef(0);
  const prevWeightRef = useRef(weight);
  
  const points = useMemo(() => {
    return [
      new THREE.Vector3(...from),
      new THREE.Vector3(...to)
    ];
  }, [from, to]);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);
  
  const lineColor = useMemo(() => {
    if (weight > 0) {
      const intensity = Math.min(Math.abs(weight), 1);
      return new THREE.Color(0.2, 0.6 + intensity * 0.4, 0.2);
    } else {
      const intensity = Math.min(Math.abs(weight), 1);
      return new THREE.Color(0.6 + intensity * 0.4, 0.2, 0.2);
    }
  }, [weight]);
  
  const weightDelta = Math.abs(weight - previousWeight);
  
  useFrame((state) => {
    if (materialRef.current) {
      if (isTraining && weightDelta > 0.001) {
        const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.5 + 0.5;
        pulseRef.current = pulse * Math.min(weightDelta * 10, 1);
        
        const emissiveIntensity = pulseRef.current * 2;
        materialRef.current.emissiveIntensity = emissiveIntensity;
        
        const pulseColor = weight > previousWeight 
          ? new THREE.Color(0, 1, 0.5)
          : new THREE.Color(1, 0.5, 0);
        materialRef.current.emissive = pulseColor;
      } else {
        materialRef.current.emissiveIntensity = 0.1;
        materialRef.current.emissive = new THREE.Color(0x000000);
      }
      
      const baseOpacity = 0.3 + Math.min(Math.abs(weight) * 0.7, 0.7);
      materialRef.current.opacity = baseOpacity;
    }
    
    prevWeightRef.current = weight;
  });
  
  const tubeRadius = useMemo(() => {
    return 0.02 + Math.abs(weight) * 0.03;
  }, [weight]);
  
  const curve = useMemo(() => {
    return new THREE.LineCurve3(points[0], points[1]);
  }, [points]);
  
  return (
    <group>
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial
          ref={materialRef}
          color={lineColor}
          transparent
          opacity={0.6}
          linewidth={2}
        />
      </line>
      
      <mesh>
        <tubeGeometry args={[curve, 8, tubeRadius, 8, false]} />
        <meshStandardMaterial
          color={lineColor}
          emissive={lineColor}
          emissiveIntensity={isTraining ? weightChangeIntensity : 0.1}
          transparent
          opacity={0.4 + Math.abs(weight) * 0.4}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      
      {isTraining && weightDelta > 0.01 && (
        <mesh>
          <tubeGeometry args={[curve, 8, tubeRadius * 2, 8, false]} />
          <meshBasicMaterial
            color={weight > previousWeight ? 0x00ff88 : 0xff4400}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
};

export default SynapseLine;
