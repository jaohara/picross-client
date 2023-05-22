import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';

const OptionsMenu = () => {
  return ( 
    <div className="options-menu menu">
      <MenuHeader
        title="Options"
        iconType="options"
      />
      {/* <div className="menu-header-container">
        <h1 className='menu-header'>Options Menu</h1>
      </div> */}

      <div className="menu-body-container">
        <MenuLinks 
          excludeAll={true}
          showBackButton={true}
        />

        <div className="menu-body">
          <h1>Todo:</h1>
          <ul>
            <li>Figure out which options are controlled here and where they're saved</li>
            <li>Does this control GameContext Stuff?</li>
            <li>Should these be saved locally or saved in UserContext?</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
 
export default OptionsMenu;