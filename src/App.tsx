import React, { useState, useCallback, useEffect } from 'react';
import Scene3D from './components/scene/Scene3D';
import ModelSelector from './components/ModelSelector';
import ControlsPanel from './components/ControlsPanel';
import NetworkInfo from './components/NetworkInfo';
import { useNeuralNetwork } from './hooks/useNeuralNetwork';
import { useTraining } from './hooks/useTraining';
import { ModelType, NetworkConfig, LayerWeights } from './types';
import { getDefaultConfig } from './utils/trainingData';

function App() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('XOR');
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>(getDefaultConfig('XOR'));
  const [layerActivations, setLayerActivations] = useState<number[][]>([]);
  const [layerWeightsState, setLayerWeightsState] = useState<LayerWeights[]>([]);

  const {
    model,
    layerWeights,
    layerActivations: initialActivations,
    trainingData,
    initializeModel
  } = useNeuralNetwork();

  useEffect(() => {
    const result = initializeModel(selectedModel);
    setNetworkConfig(getDefaultConfig(selectedModel));
    setLayerActivations(result.activations);
    setLayerWeightsState(result.weights);
  }, [selectedModel, initializeModel]);

  const handleWeightsUpdate = useCallback((weights: LayerWeights[]) => {
    setLayerWeightsState(weights);
  }, []);

  const handleActivationsUpdate = useCallback((activations: number[][]) => {
    setLayerActivations(activations);
  }, []);

  const {
    trainingStats,
    startTraining,
    stopTraining,
    resetTraining
  } = useTraining({
    model,
    networkConfig,
    modelType: selectedModel,
    trainingData,
    onWeightsUpdate: handleWeightsUpdate,
    onActivationsUpdate: handleActivationsUpdate
  });

  const handleModelChange = useCallback((modelType: ModelType) => {
    setSelectedModel(modelType);
    resetTraining();
  }, [resetTraining]);

  const handleReset = useCallback(() => {
    resetTraining();
    const result = initializeModel(selectedModel);
    setLayerActivations(result.activations);
    setLayerWeightsState(result.weights);
  }, [resetTraining, initializeModel, selectedModel]);

  const currentLayerWeights = layerWeightsState.length > 0 ? layerWeightsState : layerWeights;
  const currentActivations = layerActivations.length > 0 ? layerActivations : initialActivations;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Neural Network Studio</h1>
          <span style={styles.subtitle}>3D Visualization & Training</span>
        </div>
        <div style={styles.headerCenter}>
          <div style={styles.statusBadge}>
            <div style={{
              ...styles.statusDot,
              backgroundColor: trainingStats.status === 'training' ? '#64ffda' : 
                              trainingStats.status === 'completed' ? '#4caf50' : '#ff9800',
              animation: trainingStats.status === 'training' ? 'pulse 1.5s ease-in-out infinite' : 'none'
            }} />
            <span style={styles.statusText}>{trainingStats.status.toUpperCase()}</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.modelBadge}>{selectedModel}</span>
        </div>
      </header>

      <main style={styles.main}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <h3 style={styles.sectionTitle}>Model Selection</h3>
            <ModelSelector 
              selectedModel={selectedModel} 
              onModelChange={handleModelChange} 
            />
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sectionTitle}>Training Controls</h3>
            <ControlsPanel
              trainingStats={trainingStats}
              onStartTraining={startTraining}
              onStopTraining={stopTraining}
              onReset={handleReset}
            />
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sectionTitle}>Network Information</h3>
            <NetworkInfo 
              networkConfig={networkConfig}
              modelType={selectedModel}
            />
          </div>
        </aside>

        <section style={styles.viewport}>
          <div style={styles.viewportHeader}>
            <span style={styles.viewportTitle}>3D Network Visualization</span>
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, backgroundColor: '#64ffda' }} />
                <span>Positive Weight</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, backgroundColor: '#ff6b6b' }} />
                <span>Negative Weight</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, backgroundColor: '#ffd93d' }} />
                <span>Active Neuron</span>
              </div>
            </div>
          </div>
          <div style={styles.canvasContainer}>
            <Scene3D
              networkConfig={networkConfig}
              layerWeights={currentLayerWeights}
              layerActivations={currentActivations}
              trainingStats={trainingStats}
            />
          </div>
        </section>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #0a0a0a;
          color: #fff;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderBottom: '1px solid rgba(100, 255, 218, 0.2)',
    backdropFilter: 'blur(10px)'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #64ffda 0%, #00bcd4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '12px',
    color: '#8892b0',
    letterSpacing: '1px'
  },
  headerCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    border: '1px solid rgba(100, 255, 218, 0.2)'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  statusText: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '1px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center'
  },
  modelBadge: {
    padding: '8px 16px',
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    border: '1px solid #64ffda',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#64ffda',
    letterSpacing: '1px'
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  sidebar: {
    width: '360px',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRight: '1px solid rgba(100, 255, 218, 0.1)',
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  sidebarSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionTitle: {
    fontSize: '12px',
    color: '#64ffda',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: 600
  },
  viewport: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#050505'
  },
  viewportHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    borderBottom: '1px solid rgba(100, 255, 218, 0.1)'
  },
  viewportTitle: {
    fontSize: '12px',
    color: '#64ffda',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: 600
  },
  legend: {
    display: 'flex',
    gap: '20px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#8892b0'
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  canvasContainer: {
    flex: 1,
    position: 'relative'
  }
};

export default App;
