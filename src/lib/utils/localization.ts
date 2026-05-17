export function getLocalizedField<T extends Record<string, any>>(
  obj: T | null | undefined,
  fieldName: keyof T,
  locale: string
): any {
  if (!obj) return null;
  
  const esFieldName = `${String(fieldName)}Es`;
  
  if (locale === 'es' && obj[esFieldName] && typeof obj[esFieldName] === 'string' && obj[esFieldName].trim() !== '') {
    return obj[esFieldName];
  }
  
  return obj[fieldName];
}
