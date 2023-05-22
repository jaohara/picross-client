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

function App() {
  const { toggleMenu } = useContext(GameContext);

  useHotKeys({
    toggleMenu: toggleMenu,
  });

  // TODO: Is this the proper order for wrapping the contexts?
  return (
    <div className="App">
      <BackgroundScreen />
      <BoardScreen />
      <MenuScreen 
      
      />
    </div>
  );
}

export default App;
