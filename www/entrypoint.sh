#!/bin/bash

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 .env file not found, copying from .env.example..."
    cp .env.example .env
    echo "✅ .env file created successfully"
    
    # Generate application key
    echo "🔑 Generating application key..."
    node ace generate:key
    
    # Run fresh migrations
    echo "🗄️ Running fresh migrations..."
    node ace migration:fresh
    
    echo "🚀 Setup completed successfully!"
else
    echo "✅ .env file already exists, skipping setup commands"
fi 

node bin/server.js