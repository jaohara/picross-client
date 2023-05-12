import React, {
  useContext,
  useState,
} from 'react';

import "./LoginContainer.scss";

import { UserContext } from '../../contexts/UserContext';

import Button from '../Button/Button';
import TextInput from '../TextInput/TextInput';

const LoginContainer = ({
  mode = "login",
}) => {
  return ( 
    <div className="login-container-wrapper">
      {
        windowMode === "signup" && 

        // TODO: resume here
      }
    </div>
  );
}
 
export default LoginContainer;