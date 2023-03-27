<!--
SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

## Robot Framework End-to-end Testing

This end to end testing is implemented utilizing Robot Framework and notably the browser library of robot framework.

Generic user guide of robot framework ( Quite long ):
https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html

Keyword documentation of the browser library: 
https://marketsquare.github.io/robotframework-browser/Browser.html

## Fast Track to keywords

Robot Framework tests are written utilizing an abstraction called keywords, these keywords are then used as building blocks for new keywords:

Python implementation -> Base Keyword abstraction -> Higher level keywords in infinite layers

For example in one of the test cases we utilize a keyword called our authentication test cases:
```
Verify Admin User registering succeeded
```
The implementation of this keyword is located under authentication/keywords.robot

This keyword is implemented by calling a common keyword called located in the common/keywords.robot called:
```
Page Contains Element
```

The page contains element is implemented in the common/keywords.robot by utilizing a keyword defined by the browser library called:
```
Get Element Count  
```
This keyword's functionality is implemented either on top of other keywords or a coded python implementation by the library.

## Structure of the directory

The structure of this directory is built in the following way:
```
common/
output/
high-level-feature-directories/
```

The common directory contains keywords utilized by all the different features for basic usage.
```
keywords.robot
variables.robot
```


The output directory is used as a place to store the output of robot framework after execution.

The high-level feature directories such as authentication or courses contain the following files:

```
keywords.robot
variables.robot
low-level-features.robot
```

The test cases are written in the low-level feature robot files, that import the directories keyword.robot which contains the implementation for the keywords utilized in the low-level feature robot files.

The keywords.robot file imports the common keywords.robot file as well as the variables.robot file of the same directory. 

As the implementation of authentication is written in its own high-level feature file, the implementation is located there.


## Running the program

Ran in GitHub actions through a dockerfile located under the project root folder docker-tests.

Can be ran locally using robot framework by installing the python packages:
```
pip install robotframework
pip install robotframework-browser
```
Note that using a virtual environment for pip is recommended.

After that the tests can be ran by writing
```
robot --outputdir output/ .
```
