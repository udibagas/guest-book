#!/bin/bash

echo "🚀 Starting Mitrateknik Guest Book Application"
echo ""

# Check if PostgreSQL is running
echo "📋 Checking PostgreSQL connection..."
if command -v psql >/dev/null 2>&1; then
    echo "✅ PostgreSQL is available"
else
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL and ensure it's running"
    exit 1
fi

# Check if database exists
echo "📋 Checking database..."
if psql -h localhost -U ${DB_USER:-postgres} -lqt | cut -d \| -f 1 | grep -qw guest_book; then
    echo "✅ Database 'guest_book' exists"
else
    echo "⚠️  Database 'guest_book' does not exist"
    echo "Creating database..."
    createdb -h localhost -U ${DB_USER:-postgres} guest_book
    if [ $? -eq 0 ]; then
        echo "✅ Database 'guest_book' created successfully"
    else
        echo "❌ Failed to create database"
        echo "Please create the database manually:"
        echo "  psql -U postgres -c \"CREATE DATABASE guest_book;\""
        exit 1
    fi
fi

echo ""
echo "🎯 Setup complete! You can now run:"
echo "  npm run dev    # Start both frontend and backend"
echo ""
echo "📱 Application URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  Admin:    http://localhost:3000/admin"
