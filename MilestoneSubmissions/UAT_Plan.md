# User Acceptance Test Plan - Tinderfy

## Overview
This document outlines the User Acceptance Test (UAT) plan for Tinderfy, a music-based dating application. The UAT will be conducted to ensure the application meets user requirements and expectations before final deployment.

## Test Environment
- **Local Environment**: Docker containers running on localhost
- **Database**: PostgreSQL 14
- **Server**: Node.js with Express
- **Port**: 3000
- **URL**: http://localhost:3000

## User Acceptance Testers
The intended audience for Tinderfy includes college students and adults who are interested in music and looking for partners. Testers should ideally reflect this demographic:
- College students (ages 18-25)
- Young adults (ages 25-35)
- Music enthusiasts
- Users familiar with dating apps
- Team members for initial testing

---

## Feature 1: User Registration

### Description
Users should be able to create a new account by providing a username and password. The system should validate the input and create a new user account in the database.

### Test Cases (Acceptance Criteria)

#### Test Case 1.1: Positive - Successful Registration
**Scenario**: Given a new user is on the registration page, when they enter a valid username and password and click 'Register', then they should be redirected to the login page.

**Test Data**:
- Username: `newuser123`
- Password: `SecurePass456!`

**Test Steps**:
1. Navigate to http://localhost:3000/register
2. Enter username: `newuser123`
3. Enter password: `SecurePass456!`
4. Click the "Register" button

**Expected Results**:
- User is redirected to the login page (/login)
- A new user account is created in the database
- Username is stored with a hashed password

**Test Results (Actual)**:
_To be filled during testing_

---

#### Test Case 1.2: Negative - Duplicate Username
**Scenario**: Given a user is on the registration page, when they enter a username that already exists in the database and click 'Register', then they should see an error message indicating the username already exists.

**Test Data**:
- Username: `existinguser` (already registered)
- Password: `Password123!`

**Test Steps**:
1. Navigate to http://localhost:3000/register
2. Enter username: `existinguser`
3. Enter password: `Password123!`
4. Click the "Register" button

**Expected Results**:
- User remains on the registration page
- Error message "Username already exists" is displayed
- No new user account is created

**Test Results (Actual)**:
_To be filled during testing_

---

#### Test Case 1.3: Negative - Missing Required Fields
**Scenario**: Given a user is on the registration page, when they leave the username or password field blank and click 'Register', then they should see browser validation preventing submission.

**Test Data**:
- Username: (empty)
- Password: (empty)

**Test Steps**:
1. Navigate to http://localhost:3000/register
2. Leave username field empty
3. Leave password field empty
4. Click the "Register" button

**Expected Results**:
- Browser validation prevents form submission
- User is notified that fields are required
- No API request is made

**Test Results (Actual)**:
_To be filled during testing_

---

## Feature 2: User Login

### Description
Registered users should be able to log in to their account using their username and password. The system should authenticate the user and create a session.

### Test Cases (Acceptance Criteria)

#### Test Case 2.1: Positive - Successful Login
**Scenario**: Given a registered user is on the login page, when they enter their correct username and password and click 'Login', then they should be authenticated and redirected to their dashboard/home page.

**Test Data**:
- Username: `registered_user`
- Password: `CorrectPass123`

**Test Steps**:
1. Navigate to http://localhost:3000/login
2. Enter username: `registered_user`
3. Enter password: `CorrectPass123`
4. Click the "Login" button

**Expected Results**:
- User is authenticated successfully
- Session is created for the user
- User is redirected to the home page or dashboard
- User remains logged in for subsequent requests

**Test Results (Actual)**:
_To be filled during testing_

---

#### Test Case 2.2: Negative - Incorrect Password
**Scenario**: Given a user is on the login page, when they enter a correct username but an incorrect password and click 'Login', then they should see an error message indicating invalid credentials.

**Test Data**:
- Username: `registered_user`
- Password: `WrongPassword`

**Test Steps**:
1. Navigate to http://localhost:3000/login
2. Enter username: `registered_user`
3. Enter password: `WrongPassword`
4. Click the "Login" button

**Expected Results**:
- User is not authenticated
- Error message "Invalid credentials" or similar is displayed
- User remains on the login page
- No session is created

**Test Results (Actual)**:
_To be filled during testing_

---

#### Test Case 2.3: Negative - Non-existent Username
**Scenario**: Given a user is on the login page, when they enter a username that does not exist in the database and click 'Login', then they should see an error message indicating invalid credentials.

**Test Data**:
- Username: `nonexistentuser`
- Password: `AnyPassword123`

**Test Steps**:
1. Navigate to http://localhost:3000/login
2. Enter username: `nonexistentuser`
3. Enter password: `AnyPassword123`
4. Click the "Login" button

**Expected Results**:
- User is not authenticated
- Error message "Invalid credentials" or similar is displayed
- User remains on the login page
- No session is created

**Test Results (Actual)**:
_To be filled during testing_

---

#### Test Case 2.4: Negative - Missing Fields
**Scenario**: Given a user is on the login page, when they leave the password field blank and click 'Login', then they should see browser validation preventing submission.

**Test Data**:
- Username: `registered_user`
- Password: (empty)

**Test Steps**:
1. Navigate to http://localhost:3000/login
2. Enter username: `registered_user`
3. Leave password field empty
4. Click the "Login" button

**Expected Results**:
- Browser validation prevents form submission
- User is notified that password is required
- No API request is made

**Test Results (Actual)**:
_To be filled during testing_

---

## Feature 3: Home Page Navigation

### Description
Users should be able to navigate from the home page to the registration and login pages. The home page should provide clear navigation options and display the application branding.

### Test Cases (Acceptance Criteria)

#### Test Case 3.1: Positive - Navigate to Registration
**Scenario**: Given a user is on the home page, when they click the "Get Started" or "Register" button, then they should be redirected to the registration page.

**Test Data**:
- Starting URL: http://localhost:3000/

**Test Steps**:
1. Navigate to http://localhost:3000/
2. Verify the home page loads correctly
3. Click the "Get Started" button

**Expected Results**:
- User is redirected to http://localhost:3000/register
- Registration page loads correctly
- All form fields are visible and accessible

**Test Results (Actual)**:
_To be filled during testing_

---

#### Test Case 3.2: Positive - Navigate to Login
**Scenario**: Given a user is on the home page, when they click the "Login" button, then they should be redirected to the login page.

**Test Data**:
- Starting URL: http://localhost:3000/

**Test Steps**:
1. Navigate to http://localhost:3000/
2. Verify the home page loads correctly
3. Click the "Login" button

**Expected Results**:
- User is redirected to http://localhost:3000/login
- Login page loads correctly
- All form fields are visible and accessible

**Test Results (Actual)**:
_To be filled during testing_

---

#### Test Case 3.3: Positive - Home Page Display
**Scenario**: Given a user navigates to the home page, when the page loads, then they should see the application name, tagline, and navigation buttons.

**Test Data**:
- URL: http://localhost:3000/

**Test Steps**:
1. Navigate to http://localhost:3000/
2. Verify page elements are displayed

**Expected Results**:
- Application name "Tinderfy" is displayed
- Tagline "The grooviest dating app in the world!" is displayed
- "Get Started" button is visible and clickable
- "Login" button is visible and clickable
- Page layout is responsive and visually appealing

**Test Results (Actual)**:
_To be filled during testing_

---

#### Test Case 3.4: Positive - Navigation Links from Registration/Login Pages
**Scenario**: Given a user is on the registration page, when they click the "Log in" link, then they should be redirected to the login page. Similarly, from the login page, clicking "Register" should redirect to the registration page.

**Test Data**:
- Registration page URL: http://localhost:3000/register
- Login page URL: http://localhost:3000/login

**Test Steps**:
1. Navigate to http://localhost:3000/register
2. Click the "Log in" link at the bottom of the form
3. Verify redirect to login page
4. From login page, click the "Register" link
5. Verify redirect to registration page

**Expected Results**:
- Users can easily navigate between registration and login pages
- Links are clearly visible and functional
- Navigation is intuitive

**Test Results (Actual)**:
_To be filled during testing_

---

## Test Execution Summary

### Test Status
- **Total Test Cases**: 11
- **Positive Test Cases**: 6
- **Negative Test Cases**: 5
- **Test Results**: _To be filled after execution_

### Notes
- All tests should be executed in a clean database environment
- Test data should be prepared before test execution
- Test results should be documented immediately after each test case
- Any defects found should be logged and tracked

### Sign-off
**Testers**: _To be filled_
**Date**: _To be filled_
**Status**: _To be filled_


