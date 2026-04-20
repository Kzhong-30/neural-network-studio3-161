# Neural Network Studio - 3D Visualization

A 3D neural network visualization application supporting real-time training visualization for XOR, Linear Regression, and Circle Classification problems.

## Features

- **3D Neural Network Visualization**: Interactive 3D visualization of neural network architecture
- **Real-time Training**: Watch weights and activations update in real-time during training
- **Multiple Problem Types**:
  - XOR Problem: Classic non-linear classification
  - Linear Regression: Predict continuous values
  - Circle Classification: Separate points inside/outside a circle
- **Interactive Controls**: Start, stop, and reset training
- **Detailed Information**: Hover over neurons to see detailed information
- **Animated Visualizations**: Weight updates trigger glowing pulse effects

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **3D Rendering**: React Three Fiber (@react-three/fiber) + React Three Drei (@react-three/drei)
- **Neural Networks**: TensorFlow.js
- **Build Tool**: Vite
- **Deployment**: Docker + Nginx

## Project Structure

```
src/
├── components/
│   ├── scene/
│   │   └── Scene3D.tsx          # 3D scene component
│   ├── network/
│   │   ├── NeuronNode.tsx       # Neuron node component (3D sphere)
│   │   ├── SynapseLine.tsx      # Connection line component
│   │   └── NetworkVisualizer.tsx # Main network visualization
│   ├── ModelSelector.tsx        # Problem type selector
│   ├── ControlsPanel.tsx        # Training controls
│   └── NetworkInfo.tsx          # Network information display
├── hooks/
│   ├── useNeuralNetwork.ts      # Neural network management
│   └── useTraining.ts           # Training logic
├── types/
│   └── index.ts                 # TypeScript type definitions
└── utils/
    └── trainingData.ts          # Training data generators
```

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Docker Deployment

```bash
# Build Docker image
docker build -t nn-studio .

# Run container
docker run -p 8080:80 nn-studio

# Open http://localhost:8080
```

## Docker Configuration

- **Base Image**: node:18-alpine (build) + nginx:alpine (production)
- **Build Tool**: Vite
- **Port**: 80 (exposed)
- **Web Server**: Nginx with gzip compression and client-side routing support

## 3D Visualization Features

### NeuronNode Component
- MeshStandardMaterial with lighting support
- Dynamic scaling based on activation values
- Color changes based on activation (cyan to yellow gradient)
- Emissive glow effect during training pulses
- Hover tooltips showing detailed neuron information

### SynapseLine Component
- Line width based on weight magnitude
- Color coding: Green (positive), Red (negative)
- Opacity based on weight strength
- Animated pulses during weight updates

### Scene3D Component
- Perspective camera with orbit controls
- Multiple light sources (ambient, directional, point lights)
- Starfield background
- Grid helper for spatial reference

## Training Visualization

During training, you'll see:
- **Weight Updates**: Connection lines pulse and change color/intensity
- **Activation Changes**: Neurons scale and change color based on their activation
- **Training Stats**: Real-time epoch, loss, and accuracy display
- **Problem Switching**: Change between XOR, Linear, and Circle problems

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT
