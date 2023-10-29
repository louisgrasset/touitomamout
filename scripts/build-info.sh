#!/bin/sh

VERSION=$(npm pkg get version | xargs)
echo "{ \"name\": \"Touitomamout\", \"version\": \"$VERSION\" }" > ./src/buildInfo.json
