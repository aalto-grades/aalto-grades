import {z} from 'zod';

export enum Language {
  English = 'EN',
  Finnish = 'FI',
  Swedish = 'SV',
  Spanish = 'ES',
  Japanese = 'JA',
  Chinese = 'ZH',
  Portuguese = 'PT',
  French = 'FR',
  German = 'DE',
  Russian = 'RU',
}

export const LanguageSchema = z.nativeEnum(Language);

export const IdSchema = z.number().int();
export const LocalizedStringSchema = z.object({
  fi: z.string(),
  en: z.string(),
  sv: z.string(),
});

export type LocalizedString = z.infer<typeof LocalizedStringSchema>;
