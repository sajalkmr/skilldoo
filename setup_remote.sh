#!/bin/bash

echo "Setting up remote GitHub repository..."

cd "$(dirname "$0")"

echo "Current directory: $(pwd)"

echo "Checking git status..."
git status

echo "Checking remote repositories..."
git remote -v

echo "Fetching from remote..."
git fetch origin

echo "Pushing to remote main branch..."
git push -u origin main

echo "Git setup complete!" 