// Type definition for activity
export type Activity = {
  id: string;
  type: "withdraw" | "deposit";
  status: "completed" | "processing" | "failed";
  amount: number;
  crypto: string;
  destination?: string;
  source?: string;
  date: string;
  txHash: string;
};

// Dummy activity data
export const DUMMY_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "withdraw",
    status: "completed",
    amount: 498.0,
    crypto: "USDC",
    destination: "Chase Checking ***1234",
    date: "2024-12-30T10:30:00",
    txHash: "5xK9mNp3qRs7tVw2yBc8dEf4gHj6kLm9nPq",
  },
  {
    id: "2",
    type: "deposit",
    status: "completed",
    amount: 500.0,
    crypto: "USDC",
    source: "Bank Transfer",
    date: "2024-12-29T14:20:00",
    txHash: "7yL2qRs8tVw3zAb4cDe5fGh6iJk7lMn8oPq",
  },
  {
    id: "3",
    type: "withdraw",
    status: "processing",
    amount: 150.0,
    crypto: "USDT",
    destination: "Chase Checking ***1234",
    date: "2024-12-30T09:15:00",
    txHash: "3zM5tVw2xYz6aBc7dEf8gHi9jKl0mNo1pQr",
  },
  {
    id: "4",
    type: "deposit",
    status: "failed",
    amount: 200.0,
    crypto: "USDC",
    source: "Wire Transfer",
    date: "2024-12-28T16:45:00",
    txHash: "9aB1xYz6cDe7fGh8iJk9lMn0oPq1rSt2uVw",
  },
];

// Helper functions
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const truncateHash = (hash: string) => {
  return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return {
        bg: "bg-accent-100 dark:bg-accent-900/30",
        text: "text-accent-700 dark:text-accent-400",
      };
    case "processing":
      return {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-400",
      };
    case "failed":
      return {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
      };
    default:
      return {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-700 dark:text-gray-400",
      };
  }
};
