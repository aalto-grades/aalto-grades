
***Settings***

Resource    ./variables.robot
Library    Browser

***Keywords***


Open Aalto Grades on Localhost
    New Page    ${localhostURL}

Sign Out
    Click       ${signOutButton}


Page Contains Element
    [Arguments]     ${element}
    Get Element Count   ${element}    >   0 
