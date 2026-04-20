import React from 'react';
import { NetworkConfig } from '../types';

interface NetworkInfoProps {
  networkConfig: NetworkConfig;
  modelType: string;
}

const NetworkInfo: React.FC<NetworkInfoProps> = ({ networkConfig, modelType }) => {
  const totalNeurons = networkConfig.inputSize + 
    networkConfig.hiddenLayers.reduce((a, b) => a + b, 0) + 
    networkConfig.outputSize;
  
  const totalConnections = networkConfig.hiddenLayers.reduce((acc, layer, index) => {
    const prevLayer = index === 0 ? networkConfig.inputSize : networkConfig.hiddenLayers[index - 1];
    return acc + prevLayer * layer;
  }, 0) + (networkConfig.hiddenLayers.length > 0 
    ? networkConfig.hiddenLayers[networkConfig.hiddenLayers.length - 1] * networkConfig.outputSize 
    : networkConfig.inputSize * networkConfig.outputSize);

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Problem Type</h4>
        <div style={styles.value}>{modelType}</div>
      </div>
      
      <div style={styles.divider} />
      
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Network Architecture</h4>
        <div style={styles.architectureRow}>
          <span style={styles.archLabel}>Input:</span>
          <span style={styles.archValue}>{networkConfig.inputSize} neurons</span>
        </div>
        {networkConfig.hiddenLayers.map((layer, index) => (
          <div key={index} style={styles.architectureRow}>
            <span style={styles.archLabel}>Hidden {index + 1}:</span>
            <span style={styles.archValue}>{layer} neurons</span>
          </div>
        ))}
        <div style={styles.architectureRow}>
          <span style={styles.archLabel}>Output:</span>
          <span style={styles.archValue}>{networkConfig.outputSize} neurons</span>
        </div>
      </div>
      
      <div style={styles.divider} />
      
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Statistics</h4>
        <div style={styles.statsRow}>
          <span style={styles.statName}>Total Neurons</span>
          <span style={styles.statValue}>{totalNeurons}</span>
        </div>
        <div style={styles.statsRow}>
          <span style={styles.statName}>Total Connections</span>
          <span style={styles.statValue}>{totalConnections}</span>
        </div>
        <div style={styles.statsRow}>
          <span style={styles.statName}>Hidden Layers</span>
          <span style={styles.statValue}>{networkConfig.hiddenLayers.length}</span>
        </div>
        <div style={styles.statsRow}>
          <span style={styles.statName}>Activation</span>
          <span style={styles.statValue}>{networkConfig.activation}</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(100, 255, 218, 0.1)',
    borderRadius: '8px',
    padding: '16px'
  },
  section: {
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '12px',
    color: '#64ffda',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    fontWeight: 600
  },
  value: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff'
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    margin: '12px 0'
  },
  architectureRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    fontSize: '13px'
  },
  archLabel: {
    color: '#8892b0'
  },
  archValue: {
    color: '#fff',
    fontFamily: 'monospace'
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    fontSize: '13px'
  },
  statName: {
    color: '#8892b0'
  },
  statValue: {
    color: '#64ffda',
    fontFamily: 'monospace',
    fontWeight: 600
  }
};

export default NetworkInfo;
