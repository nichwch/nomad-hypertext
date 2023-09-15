#!/usr/bin/env bash
rm .dbfile.msp
rm -rf ./.cache
time node importFromDirectory.mjs -d exegesis
# needs to be run twice for some reason
# node importFromDirectory.mjs -d smalldir
node query.mjs -q scarcity

