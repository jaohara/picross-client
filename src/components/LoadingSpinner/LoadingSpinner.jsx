import React from 'react';

import "./LoadingSpinner.scss";

import { TbLoader } from "react-icons/tb";

import {
  LARGE_ICON_SIZE
} from "../../constants";

// TODO: import the tabler spinner icon to use here

const LoadingSpinner = () => {
  return ( 
    <div className="loading-spinner">
      <div className="loading-spinner-wrapper">
        <TbLoader 
          size={LARGE_ICON_SIZE}
        />
      </div>
    </div>
  );
}
 
export default LoadingSpinner;