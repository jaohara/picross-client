import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import { UserContextProvider } from "./contexts/UserContext";
import { GameContextProvider } from "./contexts/GameContext";
import { DataContextProvider } from './contexts/DataContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataContextProvider>
      <UserContextProvider>

        <GameContextProvider>
          <App />
        </GameContextProvider>
      </UserContextProvider>
    </DataContextProvider>
  </React.StrictMode>,
)
