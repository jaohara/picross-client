import React, {
  useContext,
  useState,
} from 'react';

import "./Menu.scss";


// remove as necessary
import { UserContext } from '../../../contexts/UserContext';

import Button from '../../../components/Button/Button';
import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';
import TextInput from '../../../components/TextInput/TextInput';
import { menuRoutes } from '../../../routes';

// TODO: for testing cloud functions
import CloudFunctionTester from '../../../components/CloudFunctionTester/CloudFunctionTester';

import { 
  APP_TITLE,
  MENU_HEADER_ICON_SIZE as ICON_SIZE,
} from "../../../constants";

const defaultExcludedRoutes = [
  "title",
  "login",
  "signup",
  "puzzle-group",
  "puzzle",
  "pause",
];


// TODO: Temporary imports
import { functions } from '../../../firebase/firebase';
import { httpsCallable } from 'firebase/functions';
const createGameRecord = httpsCallable(functions, 'createGameRecord');

const TitleMenu = () => {
  const {
    user,
  } = useContext(UserContext);

  // check if logged in, and exclude all routes but "Login" (and signup? should that 
  // be its own route?)
  const excludedRoutes = !user ? 
    menuRoutes.filter((route) => route !== "login" && route !== "signup") : 
    defaultExcludedRoutes;

  const renamedRoutes = {
    "puzzle-list": "Play",
  };

  // TODO: remove test state
  const [ testString, setTestString ] = useState("");

  // temporary test function for my callable cloud function
  const callCallableCloudFunction = () => {
    console.log("callCallableCloudFunction: invoked");

    const testGameRecord = {
      completed: true,
      dateString: Date.now(),
      testGameRecord: true,
      testString: testString,
    };

    createGameRecord({ gameRecord: testGameRecord })
      .then((result) => {
        console.log("callCallableCloudFunction: invocation finished, data returned is:", result);
      });
  };

  return ( 
    <div className="title-menu menu">
      <MenuHeader 
        iconType="title"
        title={APP_TITLE}
      />

      <div className="menu-body-container">
        <MenuLinks 
          excluded={excludedRoutes}
          renamedMappings={renamedRoutes}
          showDiagnosticRoute={true}
        />

        <div className="menu-body">
          <CloudFunctionTester disabled />

          <p>
            You need to put some more thought into what should be displayed on this main screen.
          </p>

          <p>
            Should we even land at this main screen? Should you be forwarded to Play or Profile by 
            default?
          </p>

          <p>
            <strong>Should this be where the temporary instructions page is?</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
 
export default TitleMenu;