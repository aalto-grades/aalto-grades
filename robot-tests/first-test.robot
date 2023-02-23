*** Settings ***
Library    Browser

* Test Cases *

Test New Browser on localhost
    New Browser    chromium    headless=false