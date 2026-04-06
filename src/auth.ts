import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Re-export auth configuration
export { authOptions } from '@/lib/auth';

// Create auth function for compatibility
export const auth = () => getServerSession(authOptions);