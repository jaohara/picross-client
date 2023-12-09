import React from 'react';

import "./LoadingSpinner.scss";

import { TbLoader } from "react-icons/tb";

// TODO: import the tabler spinner icon to use here

const LoadingSpinner = () => {
  return ( 
    <div className="loading-spinner">
      <div className="loading-spinner-wrapper">
        <TbLoader />
      </div>
    </div>
  );
}
 
export default LoadingSpinner;