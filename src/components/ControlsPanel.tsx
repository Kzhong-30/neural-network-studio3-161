import React from 'react';
import { TrainingStats } from '../types';
import { FaPlay, FaStop, FaRedo } from 'react-icons/fa';

interface ControlsPanelProps {
  trainingStats: TrainingStats;
  onStartTraining: () => void;
  onStopTraining: () => void;
  onReset: () => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  trainingStats,
  onStartTraining,
  onStopTraining,
  onReset
}) => {
  const isTraining = trainingStats.status === 'training';
  const isCompleted = trainingStats.status === 'completed';

  return (
    <div style={styles.container}>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Epoch</div>
          <div style={styles.statValue}>{trainingStats.epoch}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Loss</div>
          <div style={styles.statValue}>{trainingStats.loss.toFixed(4)}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Accuracy</div>
          <div style={styles.statValue}>{(trainingStats.accuracy * 100).toFixed(1)}%</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Learning Rate</div>
          <div style={styles.statValue}>{trainingStats.learningRate.toFixed(3)}</div>
        </div>
      </div>

      <div style={styles.statusIndicator}>
        <div
          style={{
            ...styles.statusDot,
            backgroundColor: isTraining ? '#64ffda' : isCompleted ? '#4caf50' : '#ff9800'
          }}
        />
        <span style={styles.statusText}>
          {isTraining ? 'TRAINING IN PROGRESS' : isCompleted ? 'TRAINING COMPLETED' : 'READY TO TRAIN'}
        </span>
      </div>

      <div style={styles.buttonGroup}>
        {!isTraining ? (
          <button style={styles.primaryButton} onClick={onStartTraining}>
            <FaPlay style={styles.buttonIcon} />
            Start Training
          </button>
        ) : (
          <button style={styles.dangerButton} onClick={onStopTraining}>
            <FaStop style={styles.buttonIcon} />
            Stop Training
          </button>
        )}
        
        <button style={styles.secondaryButton} onClick={onReset}>
          <FaRedo style={styles.buttonIcon} />
          Reset
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid rgba(100, 255, 218, 0.1)'
  },
  statLabel: {
    fontSize: '12px',
    color: '#8892b0',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#64ffda',
    fontFamily: 'monospace'
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  statusText: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '1px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px'
  },
  primaryButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    border: '1px solid #64ffda',
    borderRadius: '8px',
    color: '#64ffda',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  dangerButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    border: '1px solid #f44336',
    borderRadius: '8px',
    color: '#f44336',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  buttonIcon: {
    fontSize: '14px'
  }
};

export default ControlsPanel;
