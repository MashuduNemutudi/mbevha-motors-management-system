/**
 * components/common/ErrorBoundary.jsx
 *
 * Catches any JavaScript error in the component tree and shows
 * a readable error screen instead of a blank white page.
 *
 * Wrap the root App in this so no crash ever shows blank.
 */

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#f5f5f5', fontFamily: 'sans-serif',
          padding: '24px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '40px',
            maxWidth: '560px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            borderTop: '4px solid #CC1C1C',
          }}>
            <h1 style={{ color: '#CC1C1C', fontSize: '22px', marginBottom: '8px' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#555', marginBottom: '20px', fontSize: '14px' }}>
              The application encountered an error. Check the browser console (F12) for details.
            </p>

            {this.state.error && (
              <pre style={{
                background: '#1a1a1a', color: '#ff6b6b', borderRadius: '8px',
                padding: '16px', fontSize: '12px', overflowX: 'auto',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                marginBottom: '24px',
              }}>
                {this.state.error.toString()}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 24px', background: '#CC1C1C', color: '#fff',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '14px',
                }}
              >
                Reload Page
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
                style={{
                  padding: '10px 24px', background: 'transparent', color: '#333',
                  border: '1.5px solid #ccc', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '14px',
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
