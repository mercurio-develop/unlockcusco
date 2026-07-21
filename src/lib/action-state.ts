export type ActionState<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export function actionSuccess<T>(data?: T): ActionState<T> {
  return { success: true, data };
}

export function actionError(error: string): ActionState<never> {
  return { success: false, error };
}

export function isActionSuccess<T>(
  result: ActionState<T>
): result is { success: true; data?: T } {
  return result.success === true;
}
