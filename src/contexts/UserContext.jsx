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

  // TODO: the signup function here should call api.createUserEntity,
  //  and the login function should also double check to see if all the required 
  //  subcollections exist when a user is logged (stats, cheevos)
  //
  // Should this be something like api.checkAndCreateUserEntitySubcollections?
  
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
