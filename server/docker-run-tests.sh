#!/bin/sh

cat build/configs/database.js

npm run migration:up

npm run seed:up

npm test
