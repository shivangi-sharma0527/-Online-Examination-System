# ExamPro — Online Examination System

A fully functional front-end online examination project built with plain HTML, CSS and JavaScript.

## Run
1. Extract the project.
2. Open `index.html` in a modern browser.
3. No Node.js, database or build step is required.

## Demo login
- Email: `demo@exampro.com`
- Password: `123456`

## Included functionality
- Sign up / sign in / logout
- Demo account
- LocalStorage-based user session
- Profile editing
- Exam library
- Search and category/difficulty filtering
- Exam details/instructions
- Exam player with countdown timer
- Previous/next navigation
- Question palette
- Answer selection
- Mark for review
- Automatic submission when time expires
- Submit confirmation for unanswered questions
- Automatic score calculation
- Results dashboard
- Attempt history
- Dark mode
- Reminder/result/autosave preferences
- Clear attempts
- Responsive mobile layout
- Keyboard navigation in the exam
- Dynamic data rendering without page reloads

## API integration
The assignment PDF mentions API integration. This version is deliberately self-contained so it works offline and does not break if an external API is unavailable. The JavaScript data layer is structured so a REST API can replace the local `exams` array later.

## Important
This is a browser-only educational/demo application. Passwords are stored in LocalStorage and are **not suitable for production authentication**. A production version should use a backend, hashed passwords, database storage, authorization and server-side exam validation.
