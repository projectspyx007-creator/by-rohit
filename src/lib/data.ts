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
    id: "4",
    title: "Library Maintenance",
    author: "Library Staff",
    date: "2024-07-25",
    pinned: false,
    content: "<p>The library will be closed this weekend (July 27-28) for annual maintenance. We apologize for the inconvenience.</p>"
  }
];
