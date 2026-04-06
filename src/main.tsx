import { createRoot } from 'react-dom/client'
import { Component, ReactNode } from 'react'
import App from './App.tsx'
import './index.css'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Something went wrong</h2>
          <p style={{ color: '#666' }}>Please refresh the page to try again.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
