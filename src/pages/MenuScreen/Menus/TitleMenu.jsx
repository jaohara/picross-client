import React, {
  useContext,
  useState,
} from 'react';

import "./Menu.scss";

import { UserContext } from '../../../contexts/UserContext';
import { DataContext } from '../../../contexts/DataContext';

// import Button from '../../../components/Button/Button';
import MenuHeader from '../../../components/MenuHeader/MenuHeader';
import MenuLinks from '../../../components/MenuLinks/MenuLinks';
// import TextInput from '../../../components/TextInput/TextInput';
import { menuRoutes } from '../../../routes';

// TODO: for testing cloud functions
import CloudFunctionTester from '../../../components/CloudFunctionTester/CloudFunctionTester';

// Components to test layout
import Button from '../../../components/Button/Button';

// new layout components
import MenuContent from '../../../components/MenuContent/MenuContent';
import MenuContentGroup from '../../../components/MenuContentGroup/MenuContentGroup';
import MenuSection from '../../../components/MenuSection/MenuSection';

import { 
  APP_TITLE,
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


// const OLD_IMPLEMENTATION = true;
const OLD_IMPLEMENTATION = false;

const TitleMenu = () => {
  // TODO: Remove this after testing loading animation
  const [ testContentLoading, setTestContentLoading ] = useState(false);

  const handleToggleLoadingClick = (e) => setTestContentLoading((oldState) => !oldState);

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


  const cloudFunctionTesterFlags = {
    // createGameRecord: false,
    // getUserGameRecords: false,
    // completeGameRecord: false,
    // deleteGameRecord: false,
    getPuzzleReports: true,
    deleteAllTestGameRecords: true,
  };

  const oldJsx = ( 
    <div className="title-menu menu">
      <MenuHeader 
        iconType="title"
        title={APP_TITLE}
      />

      <div className="menu-body-container">
        {/*         
        <MenuLinks 
          excluded={excludedRoutes}
          renamedMappings={renamedRoutes}
          // showDiagnosticRoute={true}
        /> 
        */}

        <div className="menu-body">
          <CloudFunctionTester 
            testerFlags={cloudFunctionTesterFlags} 
          />

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

  const middleSectionBackgroundTint = "#ff8c42";

  return OLD_IMPLEMENTATION ? oldJsx : ( 
    <div className="title-menu menu">
      <MenuSection  bgShade="lighter">
        {/* Default will be fixed width */}
        <MenuContent
          opaque={false}
        >
          <MenuHeader 
            iconType="title"
            title={APP_TITLE}
          />
        </MenuContent>
        <MenuContent>
          <MenuContentGroup>
            <div>
              <h1>Loading Controls</h1>
              <p>
                These Controls will toggle whether or not the other <code>MenuContent</code> 
                components are rendering their body or the loading component.
              </p>
            </div>
            <div>
              <h2>Toggle Loaders</h2>
              <p>
                <Button 
                  iconType="options"
                  onClick={handleToggleLoadingClick}
                >
                  Toggle Loaders
                </Button>
              </p>
              <p style={{marginTop: "1rem"}}>
                <code>
                  testContentLoading: {`${testContentLoading}`}
                </code>
              </p>
            </div>
          </MenuContentGroup>
        </MenuContent>
      </MenuSection>

      <MenuSection
        bgShade={"lighter"}
        // bgTint={middleSectionBackgroundTint}
        verticalPadding={2}
      >
        <MenuContent 
          columns={3}
          fullWidth
          opaque={false}
        >
          <TestContent loading={testContentLoading} />
          <TestContent />
          <TestContent loading={testContentLoading} />
        </MenuContent>

        <MenuContent
          columns={3}
          // fullWidth
        >
          <TestContent />
          <TestContent />
          <TestContent />
          <TestContent />
          <TestContent />
        </MenuContent>
      </MenuSection>

      <MenuSection
        bgShade="dark"
        >
        <MenuContent
          loading={testContentLoading}
          >
          <TestContent />
        </MenuContent>
        <MenuContent
          loading={testContentLoading}
        >
          <TestContent />
        </MenuContent>
      </MenuSection>
    </div>
  );
}

const TestContent = ({ loading }) => {
  return (
    <MenuContent
      className="test-content"
      loading={loading}
    >
    {/* <div className="test-content"> */}
      <h1>Test Content</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae nisi natus maiores id doloremque eveniet? Alias, reiciendis nulla! Hic obcaecati laudantium sequi laboriosam enim repellat laborum temporibus ipsa sed delectus!
      </p>
    </MenuContent>
  )
}
 
export default TitleMenu;