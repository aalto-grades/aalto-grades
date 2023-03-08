#!/bin/sh
docker run --rm -v $(pwd):/test marketsquare/robotframework-browser:latest bash -c "robot --outputdir /test/output /test"
