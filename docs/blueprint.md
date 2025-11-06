# **App Name**: Coffee Campus

## Core Features:

- User Authentication: Secure user sign-up and sign-in with email/password and Google OAuth, including email verification and user role management using Firebase Auth and Firestore.
- Real-time Notices: Display real-time notices fetched from Firestore, with admin/editor roles able to add, edit, and pin notices with rich text and file uploads, ensuring students can read and comment.
- Personalized Timetable: Enable users to create and manage their weekly timetable with a grid-based interface, allowing them to add subjects, rooms, teachers, and colors, stored in Firestore and shareable via read-only links.
- AI-Powered Coffee Coach: Integrate a chatbot powered by Gemini Pro 1.5 to provide users with information and assistance regarding classes, notices, and campus life. The chatbot will tool itself to utilize user timetables and the latest notices from Firestore.
- Profile Management: Allow users to view and manage their profile information, including avatar, name, email, roll number, and role, with settings to toggle notifications and dark mode.
- Backend Cloud Functions: Utilize Cloud Functions for tasks such as generating chat responses with Gemini Pro and sending real-time notifications on notice creation.
- CI/CD with Github Actions: Every save triggers CI/CD through Github Actions, testing new code and ensuring its reliability, with all the data secured on the cloud database, with daily backups.

## Style Guidelines:

- Primary color: Coffee (#6B4226) to create a warm and inviting campus feel.
- Background color: Cream (#F6E9D7) to complement the primary color with a soft, muted tone.
- Accent color: Light Brown (#A67C52) to highlight interactive elements.
- Headline font: 'Belleza' sans-serif for a stylish and artistic appearance; body font: 'Alegreya' serif for a clear and inviting reading experience.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use coffee-themed icons throughout the app for a consistent and thematic look.
- Instagram-style mobile-first layout with a fixed top bar and bottom navigation for easy access to key features.
- Subtle animations and transitions to enhance user experience, like the coffee steam SVG on the landing page.