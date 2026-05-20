import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
} from 'nuqs/server';

export const searchParamsCache = createSearchParamsCache({
  q: parseAsString.withDefault(''),
  id: parseAsString,
  loc: parseAsString.withDefault(''),
  cat: parseAsString.withDefault(''),
  rad: parseAsInteger.withDefault(5),
  lat: parseAsFloat,
  lng: parseAsFloat,
  sort: parseAsString.withDefault('recommended'),
  trip: parseAsString,
});
