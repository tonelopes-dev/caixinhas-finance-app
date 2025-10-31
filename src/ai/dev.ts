'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-budget-analysis.ts';
import '@/ai/flows/send-email-flow.ts';
