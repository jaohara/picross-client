#!/bin/bash

# If you've just cloned this repo, remember to chmod +x this file.

# This script will be called in the firebase predeploy step. It is used to 
# concatenate some shared utility functions from ./src/utils/ into 
# ./functions/shared-utils so that they can be used in the cloud functions.
{
    cat ./functions/prepend.js;
    echo; # just to have newlines for readability
    cat ./src/utils/hashPuzzleGridBackend.js;
    echo;    
    cat ./src/utils/rotate2dArray.js;
    echo;    
    cat ./src/utils/sumRowNumbers.js;
    echo;    
    cat ./src/utils/splitPuzzleGridByRowWidth.js;
    echo;
    cat ./functions/append.js;
    echo;
} > ./functions/temp-shared-utils.js

# Replace 'export default function' with 'function'
sed 's/export default function/function/g' ./functions/temp-shared-utils.js > ./functions/shared-utils.js

# remove the temp file
rm ./functions/temp-shared-utils.js