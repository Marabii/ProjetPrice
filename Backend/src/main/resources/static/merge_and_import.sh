#!/bin/bash

# Set the directory to the script's location
cd "$(dirname "$0")"

# Install dependencies
echo "Installing dependencies..."
npm install

# Run the merging script
echo "Running merging script..."
node mergeCSVFiles.js

# Check if the merged file was created
if [ ! -f "merged_formations.json" ]; then
  echo "Error: merged_formations.json was not created."
  exit 1
fi

# Check if there are any unmatched ecoles
if [ -f "unmatched_ecoles.json" ]; then
  echo "Warning: Some ecoles could not be matched. See unmatched_ecoles.json for details."
fi

# Import to MongoDB (uncomment if you have MongoDB installed)
echo "Importing to MongoDB..."
echo "Note: If this fails, make sure MongoDB is running and mongoimport is installed."
mongoimport --db projetPrice --collection formations --file merged_formations.json --jsonArray --drop

echo "Process completed successfully!"
echo "The merged data is available in merged_formations.json"
