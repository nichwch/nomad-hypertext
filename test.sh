#!/usr/bin/env bash
rm .dbfile.msp
rm -rf ./.cache
node index.mjs -d smalldir
# needs to be run twice for some reason
node index.mjs -d smalldir
node query.mjs -q hello

