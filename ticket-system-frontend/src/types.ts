// User related types
export interface User {
  _id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'moderator';
  skills?: string[];
  token?: string; // Added token field for backend compatibility
  createdAt: string;
  updatedAt: string;
}

// Ticket related types
export interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  ticketNumber?: string;
  relatedSkills?: string[];
  helpfulNotes?: string;
  assignedTo?: User;
  createdBy: User | string;
  createdAt: string;
  updatedAt: string;
}

// Auth related types
export interface AuthResponse {
  user: User;
  authenticated: boolean;
  message?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
}

// Profile related types
export interface ProfileUpdateForm {
  name: string;
  skills: string;
}

// API response types
export interface TicketsResponse {
  tickets: Ticket[];
  message?: string;
}

export interface TicketResponse {
  ticket: Ticket;
  message?: string;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data?: User;
}
