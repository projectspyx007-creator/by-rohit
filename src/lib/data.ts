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
