# College Companion - Technical Documentation

## 1. Project Overview

**College Companion** is a modern, mobile-first web application designed to be the ultimate digital assistant for college students. The app aims to streamline a student's daily academic life by centralizing crucial information and providing intelligent assistance.

The core purpose of the application is to reduce the mental overhead for students by providing a single, intuitive platform for managing their schedule, staying updated on campus news, and getting quick answers to their questions.

### Main Features
- **User Authentication**: Secure sign-up and sign-in with email/password and Google OAuth.
- **Personalized Timetable**: A dynamic, editable weekly schedule for classes.
- **Real-time Notice Board**: A live feed of campus notices, with special privileges for admin users.
- **AI-Powered Chat**: An intelligent chatbot (powered by Google's Gemini model) that provides contextual assistance based on the user's schedule and current notices.
- **Profile Management**: A dedicated section for users to manage their academic information and app settings, including a dark/light theme.
- **Real-time Notifications**: A system to alert users about new notices and upcoming classes.

---

## 2. User Roles

The application has two distinct user roles, which are assigned upon user registration.

- **Student**: This is the default role for all users. Students can:
  - View and search all public notices.
  - Create, update, and delete entries in their own personal timetable.
  - Interact with the AI Chatbot.
  - View and manage their own profile, including name, roll number, and app settings (notifications, theme).

- **Admin**: This is a privileged role with expanded capabilities. An admin can do everything a student can, plus:
  - Create new campus-wide notices.
  - Edit and delete any existing notice.
  - The admin role is currently hardcoded in the application logic. A user signing up with the email `ad24b1053@iiitr.ac.in` is assigned the `admin` role. Firestore Security Rules then grant this user special write permissions based on their unique Firebase Auth UID (`FCRlkEk6muMDar3gnNoQfxoqc903`).

---

## 3. Authentication System

User authentication is managed entirely by **Firebase Authentication**, providing a secure and scalable solution.

- **Providers**: The app supports two sign-in methods:
  1.  **Email & Password**: Users can create an account using their email and a password.
  2.  **Google OAuth**: Users can sign up or sign in using their Google account with a single click.

- **Sign-Up Flow**: When a new user registers (via email or Google), a `createUserWithEmailAndPassword` or `signInWithPopup` event is triggered. Upon successful authentication with Firebase, a corresponding user document is created in the `users` collection in Firestore. This document stores essential profile information like name, email, roll number, semester, and the assigned role (`student` or `admin`). New users have their notification preference set to `true` by default.

- **Session Management**: Client-side session persistence is handled automatically by the Firebase Auth SDK. The custom `useUser` hook (`src/firebase/provider.tsx`) provides the application with the current user's authentication state (`user`, `isUserLoading`). This hook is used throughout the app to access the user's UID and profile information.

- **Route Protection**: The application uses an `AuthGuard` component (`src/components/auth/auth-guard.tsx`) that wraps all protected routes. It checks the user's authentication state and automatically redirects:
  - Unauthenticated users from protected pages (like `/home`) to the `/signin` page.
  - Authenticated users from public pages (like `/signin` or `/signup`) to the `/home` page.

---

## 4. Database Structure

The application's data is stored in **Cloud Firestore**, a NoSQL document database. The structure is designed to be secure and scalable, with a strong emphasis on user-specific data access.

- **`users/{userId}`**:
  - **Description**: This collection stores the public profile for each user. The `userId` is the Firebase Auth UID.
  - **Data**: `name`, `email`, `rollNumber`, `role` (`student`/`admin`), `semester`, and user-specific settings like `notifications` (boolean).

- **`notices/{noticeId}`**:
  - **Description**: Stores all campus notices. This is a root-level collection readable by all authenticated users but writable only by admins.
  - **Data**: `title`, `body` (HTML content), `authorName`, `authorId`, `createdAt`, `startDate`, `endDate`, and `pinned` status.

- **`timetables/{userId}`**:
  - **Description**: Stores the personalized weekly timetable for each user. The document ID is the user's UID, ensuring that a user can only access their own timetable.
  - **Data**: Contains a single field, `entries`, which is an array of objects. Each object represents a class with fields like `subject`, `room`, `teacher`, `day`, `start`, `end`, and `color`.

- **`users/{userId}/notifications/{notificationId}`**:
  - **Description**: This is a subcollection within each user's document. It stores a list of notifications specific to that user. This structure ensures that notification queries are efficient and secure.
  - **Data**: `title`, `type` (`new_notice` or `class_reminder`), `read` (boolean), `createdAt` (timestamp), and `relatedEntityId` (e.g., the ID of the notice).

- **`chat_conversations/{userId}`**:
  - **Description**: Intended to store the history of conversations between a user and the AI chatbot. The document ID is the user's UID. (Note: The current implementation passes data to the AI on-the-fly and does not persist chat history, but the structure is in place).

---

## 5. Core Features and How They Work

### Profile System
- **UI Components**: `src/app/(app)/profile/page.tsx`, `Avatar`, `Card`, `Badge`.
- **Data Flow**: The page reads the user's profile from the `users/{userId}` document using the `useDoc` hook. The `rollNumber` is used to derive the user's branch and batch year for display.
- **Real-time Updates**: When a user toggles the notification or theme switch, the change is written directly to their document in the `users` collection via `setDocumentNonBlocking`, and the UI updates reactively.

### Notice Board
- **UI Components**: `src/app/(app)/notices/page.tsx` (list view), `src/app/(app)/notices/[id]/page.tsx` (detail view), `Card`, `Badge`, `Dialog` (for creating/editing).
- **Data Flow**: The notices page uses the `useCollection` hook to subscribe to the `notices` collection in real-time, ordered by date. When an admin creates or edits a notice, the data is written to Firestore, and the `useCollection` hook ensures all connected clients see the update instantly.
- **Admin Functionality**: If the logged-in user has an `admin` role, the UI conditionally renders "Add", "Edit", and "Delete" buttons. These actions trigger Firestore writes (`addDocumentNonBlocking`, `setDocumentNonBlocking`, `deleteDocumentNonBlocking`) which are permitted by security rules based on the admin's UID.

### Class Timetable
- **UI Components**: `src/app/(app)/timetable/page.tsx`, `Card`, `Dialog` (for adding/editing entries).
- **Data Flow**: The page reads the `timetables/{userId}` document. The `entries` array is fetched and grouped by `day` for rendering.
- **Real-time Updates**: When a user adds, edits, or deletes a class entry, the entire `entries` array for their timetable document is overwritten in Firestore. The `useDoc` hook detects this change and re-renders the UI with the updated schedule.

### Chat / AI Assistance
- **UI Components**: `src/app/(app)/chat/page.tsx`, `ChatView`, `ChatInput`, `ChatMessages`.
- **Data Flow**: The `ChatPage` first fetches the user's current timetable and the latest notices from Firestore. This data is serialized into JSON strings and passed to the `ChatView` component.
- **Genkit Flow**: When the user sends a message, the `generateChatResponse` function is called. This function invokes a Genkit flow (`aiChatbotAssistanceFlow`) which passes the user's message, timetable, and notices as context to the Gemini LLM. The model then generates a relevant, contextual reply. The response is streamed back and displayed in the UI.

### Notification System
- **Backend (Cloud Functions)**: Located in `functions/src/index.ts`.
  - `createNotificationOnNewNotice`: This function is triggered whenever a new document is created in the `notices` collection. It fetches all users, filters for those with `notifications` not explicitly set to `false`, and creates a new notification document in their `users/{userId}/notifications` subcollection. It correctly handles batching for more than 500 users.
  - `scheduleClassReminders`: This function runs on a 5-minute schedule (`every 5 minutes`). It checks for classes that are due to start in the next 15-20 minutes and creates reminder notifications for opted-in users.
- **Frontend (React)**:
  - `NotificationPanel` (`src/components/notifications/notification-panel.tsx`) uses the `useCollection` hook to listen to the `users/{userId}/notifications` subcollection in real-time.
  - The `Header` component displays a badge on the bell icon if there are any documents with `read: false`.
  - The `NotificationScheduler` (`src/components/notifications/notification-scheduler.tsx`) uses the browser's native Notification API to show desktop alerts for upcoming classes, independent of the Firestore-based notifications.

### Dark/Light Theme
- **Implementation**: Uses `next-themes` library and Radix UI.
- **UI Components**: A `Switch` component on the profile page controls the theme.
- **Mechanism**: The `useTheme` hook from `next-themes` is used to toggle the theme. The library automatically adds or removes the `.dark` class to the `<html>` element. The application's styles in `src/app/globals.css` use CSS variables that are defined differently for light mode (`:root`) and dark mode (`.dark`), allowing the entire UI to adapt instantly.

---

## 6. Navigation Architecture

- **Routing**: The application uses the **Next.js App Router**. Routes are defined by the folder structure within the `src/app` directory. For example, `src/app/(app)/profile/page.tsx` corresponds to the `/profile` URL.
- **Layouts**: The main application layout (`src/app/(app)/layout.tsx`) defines the persistent UI structure, including a top `Header` and a bottom `BottomNav`. The `(app)` folder is a route group, which allows it to have a specific layout without affecting the URL path.
- **Bottom Navigation**: The `BottomNav` component (`src/components/layout/bottom-nav.tsx`) contains `NavLink` items. The `usePathname` hook is used to determine the currently active route and apply a primary color style to the corresponding navigation icon and label.

---

## 7. Design System

The application's design is built on a foundation of **shadcn/ui** and **Tailwind CSS**, with a custom theme to match the "Coffee Campus" aesthetic.

- **Color Themes**:
  - The primary theme colors are defined as HSL CSS variables in `src/app/globals.css` and applied throughout the app using Tailwind's theme extension in `tailwind.config.ts`.
  - **Light Mode**: Utilizes a clean, modern tech aesthetic with a light gray background (`#F7F8FA`) and a vibrant purple primary color (`#6C47FF`).
  - **Dark Mode**: A sleek dark theme with a near-black background (`#0D0D10`) and a softer, lavender accent color (`#9D84FF`).

- **Typography**:
  - **Headlines**: `Belleza` (a stylish, sans-serif font) is used for major headings to give the app a unique personality.
  - **Body Text**: `Alegreya` (a clear, serif font) is used for all body text, ensuring excellent readability.
  - **Code/Monospace**: `Source Code Pro` is used for displaying code snippets or monospaced text.
  - All fonts are imported from Google Fonts in the root layout (`src/app/layout.tsx`).

- **Icons and Visual Style**:
  - **Icons**: The app primarily uses `lucide-react`, a clean and consistent icon library.
  - **Style**: The UI follows modern design principles with rounded corners (`rounded-2xl`), subtle shadows (`shadow-lg`), and a mobile-first, Instagram-style layout that prioritizes content and easy navigation.

---

## 8. Deployment / Hosting

- **Hosting**: The application is deployed on **Firebase App Hosting**. The configuration is defined in `apphosting.yaml`. Firebase App Hosting provides a managed, serverless environment for running Next.js applications with integrated CI/CD.
- **CI/CD**: Every push to the connected GitHub repository automatically triggers a new build and deployment. This allows for rapid iteration and continuous delivery of new features and fixes. Preview URLs are automatically generated for pull requests, enabling review before merging to production.

---

## 9. Future Scalability Recommendations

- **Performance**:
  - **Code Splitting**: Continue to leverage Next.js's automatic code splitting. For very large pages or components, consider using `React.lazy` and `Suspense` for manual code splitting.
  - **Image Optimization**: Ensure all images are served through the `next/image` component to benefit from automatic optimization, resizing, and modern format conversion (WebP).
  - **Database Queries**: For pages with very large lists, implement pagination in Firestore queries to avoid fetching thousands of documents at once.

- **Adding New Features Safely**:
  - **Feature Flags**: For major new features, consider implementing a feature flag system (e.g., using Firebase Remote Config). This allows you to enable/disable features for specific users or user groups without requiring a full redeployment, reducing risk.
  - **Modular Components**: Continue building features as isolated, reusable React components. This makes the codebase easier to test, maintain, and reason about.
  - **Security Rules**: Before adding any new Firestore collections or changing data access patterns, always write and test the corresponding security rules first to prevent data leaks. Use the Firebase Emulator Suite to test rules locally before deploying.
  - **Genkit Tools**: For more complex AI interactions, expand the use of Genkit by defining "tools" that the AI can use. For example, a tool to look up a specific user's class for a given day, or a tool to search past notices, would make the AI more powerful and accurate.
