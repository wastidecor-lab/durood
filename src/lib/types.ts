export interface User {
  email: string;
  name: string;
  city: string;
  whatsapp: string;
  profilePicture?: string;
  stats?: {
    today: number;
    week: number;
    allTime: number;
  };
  lastUpdated?: string; // ISO 8601 date string
}
