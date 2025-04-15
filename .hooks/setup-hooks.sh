#!/bin/bash

# Make hooks executable
chmod +x .hooks/pre-commit

# Create symbolic link to the pre-commit hook
ln -sf ../../.hooks/pre-commit .git/hooks/pre-commit

echo "Git hooks have been set up successfully!" 