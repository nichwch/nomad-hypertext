#!/usr/bin/env bash
rm .dbfile.msp
rm -rf ./.cache
node importFromDirectory.mjs -d smalldir
# needs to be run twice for some reason
# node importFromDirectory.mjs -d smalldir
node query.mjs -q scarcity

