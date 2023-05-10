import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import { UserContextProvider } from "./contexts/UserContext";
import { GameContextProvider } from "./contexts/GameContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserContextProvider>
      <GameContextProvider>
        <App />
      </GameContextProvider>
    </UserContextProvider>
  </React.StrictMode>,
)
