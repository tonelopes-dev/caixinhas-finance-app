'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/send-email-flow.ts';
import '@/ai/flows/financial-report-flow.ts';
