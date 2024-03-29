import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

import { 
  appEnvironment,
  devConfig,
  prodConfig,
} from "./firebaseConfig";

// initialize firebase app
const app = initializeApp(appEnvironment === "DEV" ? devConfig : prodConfig);

// get auth for app
const auth = getAuth(app);

// get firestore reference
const db = getFirestore(app);

// get cloud functions
const functions = getFunctions(app);

export {
  app,
  auth,
  db,
  functions,
};
