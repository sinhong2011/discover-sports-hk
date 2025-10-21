#!/bin/bash

# 🚀 CI/CD Helper Script for Discover Sports HK
# This script provides quick commands for common CI/CD operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}🚀 $1${NC}"
    echo "----------------------------------------"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if EAS CLI is installed
check_eas_cli() {
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI is not installed. Please install it first:"
        echo "npm install -g @expo/eas-cli"
        exit 1
    fi
}

# Check if logged in to Expo
check_expo_login() {
    if ! eas whoami &> /dev/null; then
        print_error "Not logged in to Expo. Please login first:"
        echo "eas login"
        exit 1
    fi
}

# Build functions
build_preview() {
    print_header "Building Preview Version"
    check_eas_cli
    check_expo_login
    
    echo "Building preview version for testing..."
    eas build --profile preview --platform all --non-interactive
    print_success "Preview build started! Check EAS dashboard for progress."
}

build_test() {
    print_header "Building Test Version"
    check_eas_cli
    check_expo_login
    
    echo "Building test version for internal testing..."
    eas build --profile test --platform all --non-interactive
    print_success "Test build started! Check EAS dashboard for progress."
}

build_production() {
    print_header "Building Production Version"
    check_eas_cli
    check_expo_login
    
    read -p "Are you sure you want to build for production? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Building production version..."
        eas build --profile production --platform all --non-interactive
        print_success "Production build started! Check EAS dashboard for progress."
    else
        print_warning "Production build cancelled."
    fi
}

build_testflight() {
    print_header "Building for TestFlight"
    check_eas_cli
    check_expo_login
    
    read -p "Are you sure you want to build for TestFlight? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Building TestFlight version..."
        eas build --profile testflight --platform ios --non-interactive
        print_success "TestFlight build started! Check EAS dashboard for progress."
    else
        print_warning "TestFlight build cancelled."
    fi
}

# Submit functions
submit_testflight() {
    print_header "Submitting to TestFlight"
    check_eas_cli
    check_expo_login
    
    read -p "Submit latest iOS build to TestFlight? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Submitting to TestFlight..."
        eas submit --profile testflight --platform ios --latest --non-interactive
        print_success "Submitted to TestFlight! Check App Store Connect for status."
    else
        print_warning "TestFlight submission cancelled."
    fi
}

submit_playstore() {
    print_header "Submitting to Google Play"
    check_eas_cli
    check_expo_login
    
    read -p "Submit latest Android build to Google Play? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Submitting to Google Play..."
        eas submit --profile production --platform android --latest --non-interactive
        print_success "Submitted to Google Play! Check Play Console for status."
    else
        print_warning "Google Play submission cancelled."
    fi
}

# Status functions
check_builds() {
    print_header "Checking Build Status"
    check_eas_cli
    check_expo_login
    
    echo "Recent builds:"
    eas build:list --limit 10
}

check_submissions() {
    print_header "Checking Submission Status"
    check_eas_cli
    check_expo_login
    
    echo "Recent submissions:"
    eas submit:list --limit 10
}

# Setup functions
setup_credentials() {
    print_header "Setting up Credentials"
    check_eas_cli
    check_expo_login
    
    echo "Setting up iOS credentials..."
    eas credentials
}

# Main menu
show_menu() {
    echo -e "${BLUE}"
    echo "🚀 CI/CD Helper for Discover Sports HK"
    echo "======================================"
    echo -e "${NC}"
    echo "Build Commands:"
    echo "  1) Build Preview (for PRs)"
    echo "  2) Build Test (for develop branch)"
    echo "  3) Build Production"
    echo "  4) Build TestFlight"
    echo ""
    echo "Submit Commands:"
    echo "  5) Submit to TestFlight"
    echo "  6) Submit to Google Play"
    echo ""
    echo "Status Commands:"
    echo "  7) Check Build Status"
    echo "  8) Check Submission Status"
    echo ""
    echo "Setup Commands:"
    echo "  9) Setup Credentials"
    echo ""
    echo "  0) Exit"
    echo ""
}

# Main script
main() {
    if [ $# -eq 0 ]; then
        while true; do
            show_menu
            read -p "Choose an option: " choice
            case $choice in
                1) build_preview ;;
                2) build_test ;;
                3) build_production ;;
                4) build_testflight ;;
                5) submit_testflight ;;
                6) submit_playstore ;;
                7) check_builds ;;
                8) check_submissions ;;
                9) setup_credentials ;;
                0) print_success "Goodbye!"; exit 0 ;;
                *) print_error "Invalid option. Please try again." ;;
            esac
            echo ""
            read -p "Press Enter to continue..."
            clear
        done
    else
        case $1 in
            "build-preview") build_preview ;;
            "build-test") build_test ;;
            "build-production") build_production ;;
            "build-testflight") build_testflight ;;
            "submit-testflight") submit_testflight ;;
            "submit-playstore") submit_playstore ;;
            "check-builds") check_builds ;;
            "check-submissions") check_submissions ;;
            "setup-credentials") setup_credentials ;;
            *) 
                echo "Usage: $0 [command]"
                echo "Commands: build-preview, build-test, build-production, build-testflight,"
                echo "          submit-testflight, submit-playstore, check-builds, check-submissions, setup-credentials"
                exit 1
                ;;
        esac
    fi
}

main "$@"
