import { 
  useContext, 
} from 'react'
import './styles/App.scss'

// import { UserContextProvider } from "./contexts/UserContext";
import { GameContext } from './contexts/GameContext';

import useHotKeys from './hooks/useHotKeys';

import BackgroundScreen from "./pages/BackgroundScreen/BackgroundScreen";
import BoardScreen from './pages/BoardScreen/BoardScreen';
import MenuScreen from './pages/MenuScreen/MenuScreen';
import MenuToggle from './components/MenuToggle/MenuToggle';

function App() {
  const { 
    gameIsActive,
    toggleMenu,
    togglePauseGame,
  } = useContext(GameContext);

  const togglePauseMenu = () => {
    if (gameIsActive) {
      togglePauseGame(Date.now());
      toggleMenu();
    }
  }

  useHotKeys({
    togglePauseMenu: togglePauseMenu,
  });

  return (
    <div className="App">
      <BackgroundScreen />
      <BoardScreen />
      <MenuScreen 
      
      />
      <MenuToggle />
    </div>
  );
}

export default App;
