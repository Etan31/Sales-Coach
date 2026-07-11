import { z } from 'zod';
import { businessTypes, difficulties, contactMethods, languages } from '../constants/options.js';

const businessTypeValues = businessTypes.map((option) => option.value);
const difficultyValues = difficulties.map((option) => option.value);
const contactMethodValues = contactMethods.map((option) => option.value);
const languageValues = languages.map((option) => option.value);

export const createSessionSchema = z.object({
  businessType: z.enum(businessTypeValues),
  difficulty: z.enum(difficultyValues),
  contactMethod: z.enum(contactMethodValues),
  language: z.enum(languageValues)
});

export const chatSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(2000)
});

export const endSessionSchema = z.object({
  sessionId: z.string().uuid()
});

export const sessionIdParamSchema = z.object({
  id: z.string().uuid()
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20)
});
