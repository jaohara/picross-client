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

const CloudFunctionTester = () => {
  
  
  // TODO: Do I actually need anything from this context?
  const { 
    user
  } = useContext(UserContext); 

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


      <div className="cloud-function-test-container">
        <h1>getUserGameRecords</h1>
        <HorizontalDivider/>
        <p>
          This should just be a button that gets the user records and logs the response object.
          After this, <strong>I should work on using this approach to grab the overall gameRecords 
          in <code>UserContext</code>.</strong>
        </p>
      </div>

      <div className="cloud-function-test-container">
        <h1>completeGameRecord</h1>
        {/* 
          required state:
            - gameRecordId text input
        */}
        <HorizontalDivider />
        <p>
          This should be a <code>TextInput</code> that, when given a <code>gameRecordId</code> of an
          incomplete gameRecord that the current user owns, resubmit it marked as completed.
        </p>

        <p>
          <strong>After this is done, check that <code>duplicateGameRecordOnUpdate</code> fired.</strong>
        </p>
      </div>

      <div className="cloud-function-test-container">
        <h1>deleteGameRecord</h1>
        {/* 
          required state:
            - gameRecordId text input
        */}
        <HorizontalDivider />
        <p>
          This should be a <code>TextInput</code> that takes in a <code>gameRecordId</code> of a gameRecord that
          the current user owns, then submits a request to delete the resource. The response data should be 
          logged.
        </p>
      </div>
    </div>
  );
}
 
export default CloudFunctionTester;