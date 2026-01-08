// Type definition for activity
export type Activity = {
  id: string;
  /**
   * Direction is used for iconography and +/- amounts.
   * Server type is preserved separately in `title`.
   */
  type: "withdraw" | "deposit";
  title: string;
  status: "completed" | "processing" | "failed";
  amount: number | null;
  crypto: string;
  destination?: string;
  source?: string;
  date: string;
  txHash: string;
  rawType?: string;
  isFinancial: boolean;
  description?: string | null;
  network?: string | null;
  fee?: number | null;
  referenceId?: string | null;
};

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
