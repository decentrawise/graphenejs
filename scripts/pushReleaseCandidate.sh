#!/bin/bash

yarn login
yarn publish --tag "$1"
