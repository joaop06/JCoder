#!/bin/bash

# Script to run tests for the Applications module
# Usage: ./scripts/test-applications.sh [type]
# Types: unit, integration, e2e, all, coverage

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
check_dependencies() {
    print_message $BLUE "🔍 Checking dependencies..."
    
    if ! command_exists npm; then
        print_message $RED "❌ npm not found. Please install Node.js and npm."
        exit 1
    fi
    
    if ! command_exists node; then
        print_message $RED "❌ node not found. Please install Node.js."
        exit 1
    fi
    
    print_message $GREEN "✅ Dependencies verified"
}

# Function to clean temporary files
cleanup() {
    print_message $YELLOW "🧹 Cleaning temporary files..."
    
    # Remove test upload files
    if [ -d "./test-uploads" ]; then
        rm -rf ./test-uploads
    fi
    
    # Remove temporary files
    if [ -d "./test-temp" ]; then
        rm -rf ./test-temp
    fi
    
    # Remove old coverage files
    if [ -d "./coverage" ]; then
        rm -rf ./coverage
    fi
    
    if [ -d "./coverage-e2e" ]; then
        rm -rf ./coverage-e2e
    fi
    
    print_message $GREEN "✅ Cleanup completed"
}

# Function to run unit tests
run_unit_tests() {
    print_message $BLUE "🧪 Running unit tests..."
    
    npm run test:unit:applications
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "✅ Unit tests passed"
    else
        print_message $RED "❌ Unit tests failed"
        exit 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_message $BLUE "🔗 Running integration tests..."
    
    npm run test:integration:applications
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "✅ Integration tests passed"
    else
        print_message $RED "❌ Integration tests failed"
        exit 1
    fi
}

# Function to run E2E tests
run_e2e_tests() {
    print_message $BLUE "🌐 Running E2E tests..."
    
    npm run test:e2e:applications
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "✅ E2E tests passed"
    else
        print_message $RED "❌ E2E tests failed"
        exit 1
    fi
}

# Function to run all tests
run_all_tests() {
    print_message $BLUE "🚀 Running all tests..."
    
    npm run test:applications
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "✅ All tests passed"
    else
        print_message $RED "❌ Some tests failed"
        exit 1
    fi
}

# Function to run tests with coverage
run_coverage_tests() {
    print_message $BLUE "📊 Running tests with coverage..."
    
    npm run test:coverage:applications
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "✅ Tests with coverage completed"
        
        # Check if coverage file was generated
        if [ -f "./coverage/lcov-report/index.html" ]; then
            print_message $BLUE "📈 Coverage report generated at ./coverage/lcov-report/index.html"
        fi
    else
        print_message $RED "❌ Tests with coverage failed"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [type]"
    echo ""
    echo "Available types:"
    echo "  unit        - Run only unit tests"
    echo "  integration - Run only integration tests"
    echo "  e2e         - Run only E2E tests"
    echo "  all         - Run all tests"
    echo "  coverage    - Run all tests with coverage"
    echo "  help        - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 unit"
    echo "  $0 coverage"
    echo "  $0 all"
}

# Main function
main() {
    local test_type=${1:-all}
    
    print_message $BLUE "🎯 Starting Applications module tests..."
    print_message $BLUE "📁 Directory: $(pwd)"
    print_message $BLUE "⏰ Date: $(date)"
    echo ""
    
    # Check dependencies
    check_dependencies
    echo ""
    
    # Clean temporary files
    cleanup
    echo ""
    
    # Execute tests based on type
    case $test_type in
        unit)
            run_unit_tests
            ;;
        integration)
            run_integration_tests
            ;;
        e2e)
            run_e2e_tests
            ;;
        all)
            run_all_tests
            ;;
        coverage)
            run_coverage_tests
            ;;
        help|--help|-h)
            show_help
            exit 0
            ;;
        *)
            print_message $RED "❌ Invalid test type: $test_type"
            echo ""
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    print_message $GREEN "🎉 Tests completed successfully!"
    
    # Clean temporary files after tests
    cleanup
}

# Execute main function
main "$@"
