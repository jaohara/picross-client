#!/bin/bash

# If you've just cloned this repo, remember to chmod +x this file.

# This script will be called in the firebase predeploy step. It is used to 
# concatenate some shared utility functions from ./src/utils/ into 
# ./functions/shared-utils so that they can be used in the cloud functions.
{
    cat ./functions/prepend.js;
    echo; # just to have newlines for readability
    cat ./src/utils/hashPuzzleGrid.js;
    echo;    
    cat ./src/utils/rotate2dArray.js;
    echo;    
    cat ./src/utils/sumRowNumbers.js;
    echo;    
    cat ./src/utils/splitPuzzleGridByRowWidth.js;
    echo;
} > ./functions/shared-utils.js