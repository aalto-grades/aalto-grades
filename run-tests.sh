#!/bin/sh
docker run -i --rm -v $(pwd)/robot-tests/:/test marketsquare/robotframework-browser:latest bash -c "robot /test"
