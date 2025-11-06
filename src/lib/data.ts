export type Notice = {
  id: string;
  title: string;
  author: string;
  date: string;
  pinned: boolean;
  content: string;
};

export const mockNotices: Notice[] = [
  {
    id: "1",
    title: "Welcome to Coffee Campus!",
    author: "Alice (Admin)",
    date: "2024-07-28",
    pinned: true,
    content: "<p>Welcome to the new semester! Grab a virtual coffee and explore the app. ☕</p>"
  },
  {
    id: "2",
    title: "Mid-term Exam Schedule",
    author: "Exam Department",
    date: "2024-07-27",
    pinned: false,
    content: "<p>The mid-term exam schedule for all departments has been published. Please check the university website for details.</p>"
  },
  {
    id: "3",
    title: "Annual Sports Day Registration",
    author: "Sports Committee",
    date: "2024-07-26",
    pinned: false,
    content: "<p>Registrations for the annual sports day are now open. Last date to register is August 5th.</p>"
  },
  {
    id: "4",
    title: "Library Maintenance",
    author: "Library Staff",
    date: "2024-07-25",
    pinned: false,
    content: "<p>The library will be closed this weekend (July 27-28) for annual maintenance. We apologize for the inconvenience.</p>"
  }
];

export type TimetableEntry = {
    id: string;
    subject: string;
    room: string;
    teacher: string;
    start: string;
    end: string;
    color: string;
};

export const mockTimetable: Record<string, TimetableEntry[]> = {
    Monday: [
        { id: 'm1', subject: 'CS101', room: 'A-101', teacher: 'Dr. Smith', start: '09:00', end: '10:00', color: 'bg-red-200' },
        { id: 'm2', subject: 'MA202', room: 'B-203', teacher: 'Prof. Jones', start: '11:00', end: '12:00', color: 'bg-blue-200' },
    ],
    Tuesday: [
        { id: 't1', subject: 'PHY101', room: 'C-105', teacher: 'Dr. Brown', start: '10:00', end: '11:00', color: 'bg-green-200' },
    ],
    Wednesday: [
        { id: 'w1', subject: 'CS101', room: 'A-101', teacher: 'Dr. Smith', start: '09:00', end: '10:00', color: 'bg-red-200' },
        { id: 'w2', subject: 'EE201', room: 'D-301', teacher: 'Prof. White', start: '14:00', end: '15:00', color: 'bg-yellow-200' },
    ],
    Thursday: [
        { id: 'th1', subject: 'MA202', room: 'B-203', teacher: 'Prof. Jones', start: '11:00', end: '12:00', color: 'bg-blue-200' },
    ],
    Friday: [
        { id: 'f1', subject: 'PHY101', room: 'C-105', teacher: 'Dr. Brown', start: '10:00', end: '11:00', color: 'bg-green-200' },
        { id: 'f2', subject: 'EE201', room: 'D-301', teacher: 'Prof. White', start: '14:00', end: '15:00', color: 'bg-yellow-200' },
    ],
    Saturday: [],
    Sunday: [],
};
