export function getLocalizedField<T extends Record<string, unknown>>(
  obj: T | null | undefined,
  fieldName: keyof T,
  locale: string
): string | null {
  if (!obj) return null;
  
  const esFieldName = `${String(fieldName)}Es`;
  const esValue = (obj as Record<string, unknown>)[esFieldName];
  
  if (locale === 'es' && esValue && typeof esValue === 'string' && esValue.trim() !== '') {
    return esValue;
  }
  
  const value = obj[fieldName];
  return typeof value === 'string' ? value : null;
}
