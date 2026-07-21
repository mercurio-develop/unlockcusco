import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
} from 'nuqs/server';

export const searchParamsParsers = {
  q: parseAsString.withDefault(''),
  id: parseAsString,
  loc: parseAsString.withDefault(''),
  cat: parseAsString.withDefault(''),
  rad: parseAsInteger,
  lat: parseAsFloat,
  lng: parseAsFloat,
  sort: parseAsString.withDefault('recommended'),
  trip: parseAsString,
  filter: parseAsString,
  ai_prompt: parseAsString,
  data: parseAsString,
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
