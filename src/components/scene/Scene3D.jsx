import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { NetworkVisualization } from '../network';

const CoordinateSystem = ({ size = 10 }) => {
  const axisLength = size;
  
  const xAxisPoints = useMemo(() => [
    new THREE.Vector3(-axisLength, 0, 0),
    new THREE.Vector3(axisLength, 0, 0)
  ], [axisLength]);
  
  const yAxisPoints = useMemo(() => [
    new THREE.Vector3(0, -axisLength, 0),
    new THREE.Vector3(0, axisLength, 0)
  ], [axisLength]);
  
  const zAxisPoints = useMemo(() => [
    new THREE.Vector3(0, 0, -axisLength),
    new THREE.Vector3(0, 0, axisLength)
  ], [axisLength]);
  
  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(xAxisPoints.flatMap(p => [p.x, p.y, p.z]))}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff4444" linewidth={2} />
      </line>
      
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(yAxisPoints.flatMap(p => [p.x, p.y, p.z]))}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#44ff44" linewidth={2} />
      </line>
      
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(zAxisPoints.flatMap(p => [p.x, p.y, p.z]))}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#4444ff" linewidth={2} />
      </line>
      
      <mesh position={[axisLength + 0.3, 0, 0]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
      
      <mesh position={[0, axisLength + 0.3, 0]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color="#44ff44" />
      </mesh>
      
      <mesh position={[0, 0, axisLength + 0.3]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color="#4444ff" />
      </mesh>
    </group>
  );
};

const Scene3D = ({
  networkConfig,
  weights = [],
  activations = [],
  biases = [],
  isTraining = false,
  pulseIntensity = 0,
  showGrid = true,
  showAxes = true
}) => {
  const sceneRef = useRef();
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[12, 8, 12]} fov={50} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        autoRotate={!isTraining}
        autoRotateSpeed={0.5}
      />
      
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
      <pointLight position={[10, 10, 10]} intensity={0.3} color="#ff00ff" />
      
      <Environment preset="city" />
      
      {showGrid && (
        <Grid
          args={[30, 30]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#1a3a4a"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#0a4a5a"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      )}
      
      {showAxes && <CoordinateSystem size={8} />}
      
      <group ref={sceneRef}>
        <NetworkVisualization
          networkConfig={networkConfig}
          weights={weights}
          activations={activations}
          biases={biases}
          isTraining={isTraining}
          pulseIntensity={pulseIntensity}
        />
      </group>
    </>
  );
};

export default Scene3D;
