import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  Navigate,
} from "react-router-dom";

import "./Menu.scss";

// remove as necessary
import { UserContext } from '../../../contexts/UserContext';
import { GameContext } from '../../../contexts/GameContext';

import LoginForm from '../../../components/LoginForm/LoginForm';
import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';

const LoginMenu = () => {
  const {
    login,
    // logout,
    user,
  } = useContext(UserContext);

  if (user) {
    return (<Navigate to={"/title"} />)
  }

  return ( 
    <div className="login-menu menu">
      <MenuHeader
        iconType="login"
        title="Login"
      />

      <div className="menu-body-container">
        <MenuLinks
          excludeAll={true}
          showBackButton={true}
        />

        <div className="menu-body">
          <LoginForm 
            login={login}
          />
        </div>

      </div>

    </div>
  );
}
 
export default LoginMenu;