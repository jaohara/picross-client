import React, {
  createContext,
  useEffect,
  useState,
} from "react";

// import auth functions

// import necessary api functions

const UserContext = createContext(undefined);

const UserContextProvider = ({ children }) => {
  const userContextTestVal = "userContext";
  
  return (
    <UserContext.Provider
      value={{
        userContextTestVal: userContextTestVal,
      }}
    >
      {children}
    </UserContext.Provider>
  )
};

export { UserContext, UserContextProvider };
