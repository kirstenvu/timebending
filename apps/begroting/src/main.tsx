import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import OptInGate, {getStoredOptIn} from './components/OptInGate.tsx';
import './index.css';

function Root() {
  const [unlocked, setUnlocked] = useState(() => getStoredOptIn() !== null);

  if (!unlocked) {
    return <OptInGate onComplete={() => setUnlocked(true)} />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
