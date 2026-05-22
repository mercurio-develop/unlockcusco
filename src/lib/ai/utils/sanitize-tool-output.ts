/**
 * Recursively replaces all 'undefined' values with 'null' in an object.
 * This is required because the AI SDK's 'execute' function must return a valid JSONValue,
 * and 'undefined' is not a valid JSONValue in recent versions.
 */
export function sanitizeToolOutput<T>(obj: T): unknown {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}
