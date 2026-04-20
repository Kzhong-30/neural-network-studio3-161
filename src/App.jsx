import React, { useState, useEffect, useCallback } from 'react';
import { NeuralNetworkScene } from './components/scene';
import ControlsPanel from './components/ControlsPanel';
import TrainingStats from './components/TrainingStats';
import ModelSelector from './components/ModelSelector';
import { useNeuralNetwork } from './hooks/useNeuralNetwork';
import { useTraining, getModelConfig } from './hooks/useTraining';
import './styles/App.css';

function App() {
  const [selectedModel, setSelectedModel] = useState('XOR');
  const [networkConfig, setNetworkConfig] = useState(getModelConfig('XOR'));
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);

  const {
    model,
    weights,
    activations,
    biases,
    createModel,
    updateWeights,
    calculateActivations,
    dispose
  } = useNeuralNetwork();

  const {
    training,
    startTraining,
    stopTraining,
    resetTraining,
    stats,
    pulseIntensity
  } = useTraining(model, networkConfig, updateWeights, calculateActivations);

  useEffect(() => {
    const config = getModelConfig(selectedModel);
    setNetworkConfig(config);
    createModel(config);
    
    return () => {
      dispose();
    };
  }, []);

  const handleConfigChange = useCallback((newConfig) => {
    setNetworkConfig(newConfig);
  }, []);

  const handleModelChange = useCallback((modelType) => {
    if (training) {
      stopTraining();
    }
    
    setSelectedModel(modelType);
    const config = getModelConfig(modelType);
    setNetworkConfig(config);
    createModel(config);
    resetTraining();
  }, [training, stopTraining, createModel, resetTraining]);

  const handleStartTraining = useCallback(() => {
    startTraining();
  }, [startTraining]);

  const handleStopTraining = useCallback(() => {
    stopTraining();
  }, [stopTraining]);

  const handleResetView = useCallback(() => {
    const config = getModelConfig(selectedModel);
    createModel(config);
    resetTraining();
  }, [selectedModel, createModel, resetTraining]);

  const totalParams = networkConfig.inputSize * networkConfig.hiddenLayers[0] + 
    networkConfig.hiddenLayers.reduce((acc, layer, i, arr) => {
      if (i < arr.length - 1) {
        return acc + layer * arr[i + 1];
      }
      return acc + layer * networkConfig.outputSize;
    }, 0);

  return (
    <div className="app">
      <div className="app-layout">
        <header className="header-bar">
          <div className="header-left">
            <span className="app-title">NN Studio</span>
          </div>
          <div className="header-center">
            <div className="training-status">
              <div className={`status-indicator ${training ? 'training' : 'idle'}`}></div>
              <span>{training ? 'TRAINING' : 'READY'}</span>
            </div>
          </div>
          <div className="header-right">
            <span className="model-name">{selectedModel} Model</span>
          </div>
        </header>

        <div className="main-content">
          <div className="sidebar left-sidebar">
            <div className="sidebar-section">
              <div className="section-header">
                <h3>MODEL PRESETS</h3>
              </div>
              <ModelSelector 
                selectedModel={selectedModel} 
                onModelChange={handleModelChange} 
              />
            </div>

            <div className="sidebar-section">
              <div className="section-header">
                <h3>NETWORK ARCHITECTURE</h3>
              </div>
              <ControlsPanel 
                networkConfig={networkConfig}
                onConfigChange={handleConfigChange}
                onStartTraining={handleStartTraining}
                onStopTraining={handleStopTraining}
                isTraining={training}
              />
            </div>
          </div>

          <div className="viewport">
            <div className="viewport-header">
              <span>3D NETWORK VISUALIZATION</span>
              <div className="viewport-controls">
                <button 
                  className="viewport-btn" 
                  onClick={handleResetView}
                >
                  Reset View
                </button>
                <button 
                  className={`viewport-btn ${showGrid ? 'active' : ''}`}
                  onClick={() => setShowGrid(!showGrid)}
                >
                  {showGrid ? 'Hide' : 'Show'} Grid
                </button>
                <button 
                  className={`viewport-btn ${showAxes ? 'active' : ''}`}
                  onClick={() => setShowAxes(!showAxes)}
                >
                  {showAxes ? 'Hide' : 'Show'} Axes
                </button>
              </div>
            </div>
            <div className="visualization-container">
              <NeuralNetworkScene 
                networkConfig={networkConfig} 
                weights={weights}
                activations={activations}
                biases={biases}
                isTraining={training}
                pulseIntensity={pulseIntensity}
                showGrid={showGrid}
                showAxes={showAxes}
              />
            </div>
          </div>

          <div className="sidebar right-sidebar">
            <div className="sidebar-section">
              <div className="section-header">
                <h3>TRAINING STATISTICS</h3>
              </div>
              <TrainingStats stats={stats} />
            </div>

            <div className="sidebar-section">
              <div className="section-header">
                <h3>NETWORK INFO</h3>
              </div>
              <div className="network-info">
                <div className="info-row">
                  <span>Layers:</span>
                  <span>{[networkConfig.inputSize, ...networkConfig.hiddenLayers, networkConfig.outputSize].join(' → ')}</span>
                </div>
                <div className="info-row">
                  <span>Activation:</span>
                  <span>{networkConfig.activation}</span>
                </div>
                <div className="info-row">
                  <span>Learning Rate:</span>
                  <span>{networkConfig.learningRate}</span>
                </div>
                <div className="info-row">
                  <span>Total Parameters:</span>
                  <span>{totalParams.toLocaleString()}</span>
                </div>
                <div className="info-row">
                  <span>Model Type:</span>
                  <span>{networkConfig.modelType}</span>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <div className="section-header">
                <h3>TRAINING CONTROLS</h3>
              </div>
              <div className="training-controls">
                <button 
                  className={`train-btn primary ${training ? 'active' : ''}`}
                  onClick={handleStartTraining}
                  disabled={training}
                >
                  {training ? 'TRAINING...' : 'START TRAINING'}
                </button>
                <button 
                  className="train-btn secondary"
                  onClick={handleStopTraining}
                  disabled={!training}
                >
                  STOP TRAINING
                </button>
                <button 
                  className="train-btn secondary"
                  onClick={handleResetView}
                  disabled={training}
                >
                  RESET NETWORK
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="status-bar">
          <div className="status-left">
            <span>Epoch: {stats.epoch}</span>
            <span>Loss: {stats.loss.toFixed(6)}</span>
            <span>Accuracy: {(stats.accuracy * 100).toFixed(2)}%</span>
          </div>
          <div className="status-right">
            <span>{stats.status}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
