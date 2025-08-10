#!/bin/sh

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 .env file not found, copying from .env.example..."
    cp .env.example .env
    echo "✅ .env file created successfully"
    
    # Change NODE_ENV from development to production
    echo "🔧 Setting NODE_ENV to production..."
    sed -i 's/NODE_ENV=development/NODE_ENV=production/g' .env
    echo "✅ Environment set to production"
    
    # Generate application key
    echo "🔑 Generating application key..."
    node ace generate:key
    
    # Run fresh migrations
    echo "🗄️ Running fresh migrations..."
    node ace migration:fresh --force
    
    echo "🚀 Setup completed successfully!"
else
    echo "✅ .env file already exists, skipping setup commands"
fi

node bin/server.js