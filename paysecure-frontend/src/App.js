import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));

  return (
    <div>
      <h1>PaySecure Gateway</h1>
      {!authToken ? (
        <>
          <Register />
          <Login setAuthToken={setAuthToken} />
        </>
      ) : (
        <Dashboard authToken={authToken} />
      )}
    </div>
  );
}

export default App;