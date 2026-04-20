import React from 'react';
import { ModelType } from '../types';
import { FaProjectDiagram, FaChartLine, FaCircle } from 'react-icons/fa';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const models: { type: ModelType; name: string; description: string; icon: React.ReactNode }[] = [
  {
    type: 'XOR',
    name: 'XOR Problem',
    description: 'Classic non-linear classification',
    icon: <FaProjectDiagram />
  },
  {
    type: 'Linear',
    name: 'Linear Regression',
    description: 'Predict continuous values',
    icon: <FaChartLine />
  },
  {
    type: 'Circle',
    name: 'Circle Classification',
    description: 'Separate inside/outside circle',
    icon: <FaCircle />
  }
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  return (
    <div style={styles.container}>
      {models.map((model) => (
        <button
          key={model.type}
          style={{
            ...styles.button,
            ...(selectedModel === model.type ? styles.activeButton : {})
          }}
          onClick={() => onModelChange(model.type)}
        >
          <div style={styles.icon}>{model.icon}</div>
          <div style={styles.text}>
            <div style={styles.name}>{model.name}</div>
            <div style={styles.description}>{model.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(100, 255, 218, 0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    color: '#fff'
  },
  activeButton: {
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    borderColor: '#64ffda'
  },
  icon: {
    fontSize: '24px',
    color: '#64ffda'
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  name: {
    fontSize: '14px',
    fontWeight: 600
  },
  description: {
    fontSize: '12px',
    color: '#8892b0'
  }
};

export default ModelSelector;
