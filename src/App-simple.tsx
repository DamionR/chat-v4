
function App() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1a1a1a',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>AI Chat Client - Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Current URL: {window.location.href}</p>
      <button onClick={() => alert('Button works!')}>
        Test Button
      </button>
    </div>
  )
}

export default App