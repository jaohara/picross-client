import React, {
  useContext,
  useState,
} from 'react';

import "./LoginForm.scss";

import { UserContext } from '../../contexts/UserContext';

import Button from '../Button/Button';
import TextInput from '../TextInput/TextInput';

const LoginForm = ({
  mode = "login",
  login = () => console.log("LoginForm: login called"),
  register = () => console.log("LoginForm: register called"),
}) => {
  return ( 
    <div className="login-form-wrapper">
      {/* TODO: make this differ between login/signup */}
      {
        mode === "login" ? (
          <LoginFormBody 
            login={login}
          />
        ) : (
          <SignupFormBody 
            register={register}
          />
        )
      }
    </div>
  );
}

function LoginFormBody ({ login }) {
  const PASSWORD_ERROR_STRING = "Incorrect password.";

  const [ email, setEmail ] = useState("");
  const [ loginPending, setLoginPending ] = useState(false);
  const [ password, setPassword ] = useState("");
  const [ passwordError, setPasswordError ] = useState();

  const canSubmit = email.length > 0 && password.length > 0 && !loginPending;

  const loginButtonType = loginPending ? "waiting" : "login";

  const hasPasswordError = 
    passwordError && typeof passwordError === 'string' && passwordError.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoginPending(true);
    
    const successCallback = () => {
      console.log("LoginFormBody: login success");
    }

    const failureCallback = () => {
      setLoginPending(false);
      setPasswordError(PASSWORD_ERROR_STRING)
    };

    console.log("Firing LoginForm handleSubmit");
    const result = login(email, password, successCallback, failureCallback);
    console.log("login result: ", result);
  };
  
  return (
    <div className="login-form">
      <form onSubmit={handleSubmit}>
        <TextInput
          label="email"
          setValue={setEmail}
          value={email}
        />

        <TextInput
          error={hasPasswordError}
          label="password"
          onChange={() => setPasswordError("")}
          password={true}
          setValue={setPassword}
          value={password}
        />

        {
          hasPasswordError && (
            <div className="auth-form-error">
              Incorrect password.
            </div>
          )
        }

        <Button
          className="login-button"
          disabled={!canSubmit}
          iconType={loginButtonType}
          isFormSubmit
          onClick={handleSubmit}
        >
          Login
        </Button>

      </form>
    </div>
  ); 
}

function SignupFormBody ({ register }) {
  const [ confirmPassword, setConfirmPassword ] = useState("");
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ username, setUsername ] = useState("");

  const passwordsMatch = password === confirmPassword;
  
  const passwordError = 
    password.length !== 0 && confirmPassword.length !== 0 && !passwordsMatch;
  
  const canSubmit = email.length > 0 && username.length > 0 && password.length > 0 &&
    confirmPassword.length > 0 && passwordsMatch; 

  const successCallback = () => console.log("SignupFormBody: Success!")

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Firing SignupForm handleSubmit");
    register(email, password, username, successCallback);
  };

  return (
    <div className="login-form">
      <form 
        autoComplete='off'
        onSubmit={handleSubmit}
      >
        <TextInput
          label="username"
          setValue={setUsername}
          value={username}
        />

        <TextInput
          label="email"
          setValue={setEmail}
          value={email}
        />

        <TextInput
          error={passwordError}
          label="password"
          password={true}
          setValue={setPassword}
          value={password}
          />

        <TextInput
          error={passwordError}
          label="confirm password"
          password={true}
          value={confirmPassword}
          setValue={setConfirmPassword}
        />

        <Button
          className="login-button"
          disabled={!canSubmit}
          isFormSubmit
          onClick={handleSubmit}
          iconType="signup"
        >
          Signup
        </Button>
      </form>
    </div>
  ); 
}
 
export default LoginForm;