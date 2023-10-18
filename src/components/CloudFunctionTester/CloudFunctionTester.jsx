import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import './CloudFunctionTester.scss';

import Button from '../Button/Button';
import HorizontalDivider from '../HorizontalDivider/HorizontalDivider';
import TextInput from '../TextInput/TextInput';

import { UserContext } from '../../contexts/UserContext';

// import cloud functions from project's firebase module
import { functions } from '../../firebase/firebase';
import { httpsCallable } from 'firebase/functions';

// create local references to cloud functions
// const createGameRecordCallable = httpsCallable(functions, 'createGameRecord');
// const getUserGameRecordsCallable = httpsCallable(functions, 'getUserGameRecords');
// const completeGameRecordCallable = httpsCallable(functions, 'completeGameRecord');
// const deleteGameRecordCallable = httpsCallable(functions, 'deleteGameRecord');

// import api with wrapped callable functions
import {
  completeGameRecord,
  createGameRecord,
  deleteGameRecord,
  getUserGameRecords,
} from "../../firebase/api";

const CloudFunctionTester = () => {
  const [ completeGameRecordId, setCompleteGameRecordId ] = useState("");
  const [ createRecordIsComplete, setCreateRecordIsComplete ] = useState(false);
  const [ createRecordTestString, setCreateRecordTestString ] = useState("");
  const [ deleteGameRecordId, setDeleteGameRecordId ] = useState("");
  
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

  // functions to wrap callables with some more local functionality
  const handleCreateGameRecord = () => {
    logStateValues();

    const testGameRecord = {
      completed: createRecordIsComplete,
      dateString: Date.now(),
      testGameRecord: true,
      testString: createRecordTestString,
    };

    createGameRecord(user, testGameRecord);

    // createGameRecordCallable({ gameRecord: testGameRecord})
    //   .then((result) => {
    //     console.log("createGameRecord: invocation finished, data returned is:", result);
    //   });
  };
  
  const handleGetUserGameRecords = () => {
    logStateValues();
    
    const callCloudFunction = async () => {
      const gameRecords = await getUserGameRecords(user);
      
      if (gameRecords) {
        console.log("CloudFunctionTester: received gameRecords:", gameRecords);
      }
    };

    callCloudFunction();
  };
  
  const handleCompleteGameRecord = () => {
    logStateValues();
  };
  
  const deleteGameRecord = () => {
    logStateValues();
  };
  
  const handleCreateGameRecordCheckboxChange = () => {
    setCreateRecordIsComplete((previous) => !previous);
    logStateValues();
  };
  

  return ( 
    <div className="cloud-function-tester">
      <h1>Cloud Function Tester</h1>

      <HorizontalDivider extraBottomMargin/>


      <div className="cloud-function-test-container">
        <h1>createGameRecord</h1>
        {/* 
          required state:
            - random string in text input
            - boolean of whether the submission is complete
        */}
        <HorizontalDivider />
        <div className="cloud-function-tester-instructions">  
          <p>
            Here I will test <code>api.createGameRecord</code>, similar to how I already am in 
            <code>TitleMenu</code>. This should have a button to toggle whether or not the record
            is complete.
          </p>

          <p>
            <strong>After this is done, check that <code>duplicateGameRecordOnCreate</code> fired if the 
            gameRecord was completed.</strong>
          </p>
        </div>

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


      <div className="cloud-function-test-container">
        <h1>getUserGameRecords</h1>
        <HorizontalDivider/>

        <div className="cloud-function-tester-instructions">
          <p>
            This should just be a button that gets the user records and logs the response object.
            After this, <strong>I should work on using this approach to grab the overall gameRecords 
            in <code>UserContext</code>.</strong>
          </p>
        </div>

        <p>
          <Button 
            iconType='load'
            onClick={handleGetUserGameRecords}
          >
            Fetch and Log User's gameRecords
          </Button>
        </p>
      </div>

      <div className="cloud-function-test-container">
        <h1>completeGameRecord</h1>
        {/* 
          required state:
            - gameRecordId text input
        */}
        <HorizontalDivider />

        <div className="cloud-function-tester-instructions">
          <p>
            This should be a <code>TextInput</code> that, when given a <code>gameRecordId</code> of an
            incomplete gameRecord that the current user owns, resubmit it marked as completed.
          </p>

          <p>
            <strong>After this is done, check that <code>duplicateGameRecordOnUpdate</code> fired.</strong>
          </p>
        </div>

        <p>
          <TextInput
            placeholder='gameRecord id'
            setValue={setCompleteGameRecordId}
            value={completeGameRecordId}
          />
          <Button
            iconType='complete'
            onClick={handleCompleteGameRecord}
          >
            Toggle gameRecord Completion
          </Button>
        </p>
      </div>

      <div className="cloud-function-test-container">
        <h1>deleteGameRecord</h1>
        {/* 
          required state:
            - gameRecordId text input
        */}
        <HorizontalDivider />
        <div className="cloud-function-tester-instructions">
          <p>
            This should be a <code>TextInput</code> that takes in a <code>gameRecordId</code> of a gameRecord that
            the current user owns, then submits a request to delete the resource. The response data should be 
            logged.
          </p>
        </div>

        <p>
          <TextInput
            placeholder='gameRecord id'
            setValue={setDeleteGameRecordId}
            value={deleteGameRecordId}
          />
          <Button
            iconType='delete'
            onClick={deleteGameRecord}
          >
            Delete Game Record
          </Button>
        </p>
      </div>
    </div>
  );
}
 
export default CloudFunctionTester;