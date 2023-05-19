# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

***Settings***

Resource    ./variables.robot
Library    Browser

***Keywords***


Open Aalto Grades on Localhost
    New Page    ${localhostURL}

Sign Out
    Click       ${showSignOutButton}
    Click       ${signOutButton}

Page Contains Element
    [Arguments]     ${element}
#   Get Element Count   ${element}    >   0 
    Wait For Elements State    ${element}    visible