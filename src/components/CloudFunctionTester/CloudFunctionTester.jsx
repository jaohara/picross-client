import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import './CloudFunctionTester.scss';

import Button from '../Button/Button';
import HorizontalDivider from '../HorizontalDivider/HorizontalDivider';
import TextInput from '../TextInput/TextInput';
import Select from '../Select/Select';

import { UserContext } from '../../contexts/UserContext';

// import cloud functions from project's firebase module
import { functions } from '../../firebase/firebase';
import { httpsCallable } from 'firebase/functions';

// create local references to cloud functions
// const createGameRecordCallable = httpsCallable(functions, 'createGameRecord');
// const getUserGameRecordsCallable = httpsCallable(functions, 'getUserGameRecords');
// const completeGameRecordCallable = httpsCallable(functions, 'completeGameRecord');
// const deleteGameRecordCallable = httpsCallable(functions, 'deleteGameRecord');

const deleteAllTestGameRecordsCallable = httpsCallable(functions, 'deleteAllTestGameRecords');

// import api with wrapped callable functions
import {
  completeGameRecord,
  createGameRecord,
  deleteGameRecord,
  getPuzzleReports,
  getUserGameRecords,
} from "../../firebase/api";

import convertDataFromObjectWithIdKeysToArray from '../../utils/convertDataFromObjectWithIdKeysToArray';

const CloudFunctionTester = ({ 
  disabled = false,
  testerFlags = {},
}) => {

  // Merge passed in flags with the default values
  const activeTesterFlags = {
    createGameRecord: false,
    getUserGameRecords: false,
    completeGameRecord: false,
    deleteGameRecord: false,
    deleteAllTestGameRecords: false,
    getPuzzleReports: false,
    ...testerFlags,
  };

  const [ completeGameRecordId, setCompleteGameRecordId ] = useState("");
  const [ createRecordIsComplete, setCreateRecordIsComplete ] = useState(false);
  const [ createRecordTestString, setCreateRecordTestString ] = useState("");
  const [ deleteGameRecordId, setDeleteGameRecordId ] = useState("");

  // test copy of the game records, local to this component
  const [ testGameRecords, setTestGameRecords ] = useState(null);
  const [ testGameRecordsLoading, setTestGameRecordsLoading ] = useState(false);
  
  const { 
    user
  } = useContext(UserContext); 

  // function to log current state values when interacting with tester elements
  const logStateValues = () => {
    console.log(`completeGameRecordId: ${completeGameRecordId}`);
    console.log(`createGameRecordIsComplete: ${createRecordIsComplete}`);
    console.log(`createRecordTestString: ${createRecordTestString}`);
    console.log(`deleteGameRecordId: ${deleteGameRecordId}`);
  };

  const handleGetPuzzleReports = () => {
    if (!user) {
      console.error("handleGetPuzzleReports: no user authenticated");
      return;
    }

    const result = getPuzzleReports();

    if (result) {
      console.log("getPuzzleReports: received response:", result);
    }
    else {
      console.error("getPuzzleReports: error getting reports");
    }
  }

  //TODO: Debug, don't have this function in production code
  const handleDeleteAllTestGameRecords = () => {
    if (!user) {
      console.error("handleDeleteAllTestGameRecords: no user authenticated");
      return;
    }

    const callCloudFunction = async () => {
      const result = await deleteAllTestGameRecordsCallable();
      console.log("handleDeleteAllTestGameRecords: returned these test records:", result);
    };

    callCloudFunction();
  };

  // functions to wrap callables with some more local functionality
  const handleCreateGameRecord = () => {
    logStateValues();

    const testGameRecord = {
      dateString: Date.now(),
      testGameRecord: true,
      completed: createRecordIsComplete,
      testString: createRecordTestString,
    };

    createGameRecord(user, testGameRecord);
  };
  
  const handleGetUserGameRecords = () => {
    console.log("handleGetUserGameRecords: invoked");

    // logStateValues();
    setTestGameRecordsLoading(true);
    
    const callCloudFunction = async () => {
      const gameRecords = await getUserGameRecords(user);
      setTestGameRecordsLoading(false);

      if (gameRecords) {
        console.log("CloudFunctionTester: received gameRecords:", gameRecords);
        setTestGameRecords(gameRecords);
        const gameRecordsArray = convertDataFromObjectWithIdKeysToArray(gameRecords);
        // console.log("converted gameRecords to:", gameRecordsArray);
        setCompleteGameRecordId(gameRecordsArray[0].id);
        setDeleteGameRecordId(gameRecordsArray[0].id);
      }
    };

    callCloudFunction();
  };
  
  const handleCompleteGameRecord = () => {
    logStateValues();
    console.log("handleCompleteGameRecord: invoked");

    const result = completeGameRecord(user, completeGameRecordId);

    if (result) {
      // IMPLEMENT: remove the key that was just deleted
      const newGameRecords = testGameRecords;
      newGameRecords[completeGameRecordId].complete = true;
      setTestGameRecords(newGameRecords);
    }
  };
  
  const handleDeleteGameRecord = () => {
    const fName = "handleDeleteGameRecord";
    console.log(`${fName}: invoked`);
    logStateValues();

    const result = deleteGameRecord(user, deleteGameRecordId);

    if (result) {
      console.log(`${fName}: successfully deleted record '${deleteGameRecordId}`);
    }
    else {
      console.error(`${fName}: error deleting record '${deleteGameRecordId}'`);
    }
  };
  
  const handleCreateGameRecordCheckboxChange = () => {
    setCreateRecordIsComplete((previous) => !previous);
    logStateValues();
  };
  
  useEffect(() => {
    // load the test records for the purpose of using these api calls in this component

    // load once here and manually reload on change, just to test
    !disabled && activeTesterFlags.getUserGameRecords && handleGetUserGameRecords();
  }, [user]);

  const testGameRecordsArray = 
    testGameRecords ? convertDataFromObjectWithIdKeysToArray(testGameRecords) : null;

  const cloudFunctionTesterBody = disabled ? (
    <code>Disabled.</code>
  ) : (
    <>
      { 
        activeTesterFlags.getUserGameRecords ? (
          <p>
            <code>
              testGameRecords { testGameRecordsLoading ? "loading..." : "loaded"}
              { 
                testGameRecordsArray !== null && ` - ${testGameRecordsArray.length} records`
              }
            </code>
          </p>
        ) : (<></>)
      }
      
      {
        activeTesterFlags.createGameRecord ? (
          <div className="cloud-function-test-container">
            <h1>createGameRecord</h1>
            {/* 
              required state:
                - random string in text input
                - boolean of whether the submission is complete
            */}
            <HorizontalDivider />

            <p>
              <TextInput
                placeholder='Test string for record'
                setValue={setCreateRecordTestString}
                value={createRecordTestString}
              />
              <p>
                <input 
                  id='is-completed-checkbox'
                  onChange={handleCreateGameRecordCheckboxChange}
                  type='checkbox'
                  value={createRecordIsComplete}
                /> 
                <label htmlFor="is-completed-checkbox">Completed?</label>
              </p>

              <Button
                iconType='save'
                onClick={handleCreateGameRecord}  
              >
                Create Game Record
              </Button>
            </p>
          </div>
        ) : (<></>)
      }

      {
        activeTesterFlags.getUserGameRecords ? (
          <div className="cloud-function-test-container">
            <h1>getUserGameRecords</h1>
            <HorizontalDivider/>

            <p>
              <Button 
                iconType='load'
                onClick={handleGetUserGameRecords}
              >
                Fetch and Log User's gameRecords
              </Button>
            </p>
          </div>
        ) : (<></>)
      }    

      {
        activeTesterFlags.completeGameRecord ? (
          <div className="cloud-function-test-container">
            <h1>completeGameRecord</h1>
            {/* 
              required state:
                - gameRecordId text input
            */}
            <HorizontalDivider />

            <p>
              <Select
                disabled={testGameRecordsLoading}
                label={"gameRecord id"}
                options={testGameRecordsArray}
                optionField={"id"}
                setValue={setCompleteGameRecordId}
                value={completeGameRecordId}
              />

              { completeGameRecordId && testGameRecords && (
                <code>
                  <strong>{completeGameRecordId}</strong>: 
                  {!testGameRecords[completeGameRecordId].completed && "in"}complete
                </code>
              )}

              <Button
                iconType='complete'
                onClick={handleCompleteGameRecord}
              >
                Toggle gameRecord Completion
              </Button>
            </p>
          </div>
        ) : (<></>)
      } 

      {
        activeTesterFlags.deleteGameRecord ? (
          <div className="cloud-function-test-container">
            <h1>deleteGameRecord</h1>
            {/* 
              required state:
                - gameRecordId text input
            */}
            <HorizontalDivider />

            <p>
              <Select
                disabled={testGameRecordsLoading}
                // label={"gameRecord id"}
                options={testGameRecordsArray}
                optionField={"id"}
                setValue={setDeleteGameRecordId}
                value={deleteGameRecordId}
              />
              <Button
                iconType='delete'
                onClick={handleDeleteGameRecord}
              >
                Delete Game Record
              </Button>
            </p>
          </div>
        ) : (<></>)
      } 

      {
        activeTesterFlags.deleteAllTestGameRecords ? (
          <div className="cloud-function-test-container">
            <h1>deleteAllTestGameRecords</h1>

            <p>
              <Button
                iconType='nuke'
                onClick={handleDeleteAllTestGameRecords}
              >
                Delete All Test Records
              </Button>
            </p>
          </div>
        ) : (<></>)
      } 

      {
        activeTesterFlags.getPuzzleReports ? (
          <div className="cloud-function-test-container">
            <h1>getPuzzleReports</h1>

            <p>This will fetch and log the results of the getPuzzleReports callable.</p>

            <p>
              <Button
                iconType='load'
                onClick={handleGetPuzzleReports}
              >
                getPuzzleReports
              </Button>
            </p>
          </div>
        ) : (<></>)
      } 
    </>
  );

  return ( 
    <div className="cloud-function-tester">
      <h1>Cloud Function Tester</h1>

      <HorizontalDivider extraBottomMargin/>
      {cloudFunctionTesterBody}
    </div>
  );
}
 
export default CloudFunctionTester;