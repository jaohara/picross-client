import React from 'react';

import "./AppCredits.scss";

import {
  APP_VERSION,
  CREDITS_LINE,
  CREDITS_LINE_FORMATTED,
} from "../../constants";

const AppCredits = () => {
  return (       
    <div className="app-credits">
      <div className="credits-line">
        {/* {CREDITS_LINE} */}
        {CREDITS_LINE_FORMATTED}
      </div>

      <div className="app-version">
        {APP_VERSION}
      </div>
    </div>
  );
}
 
export default AppCredits;