import { isAbortError } from "@arcgis/core/core/promiseUtils";

export async function ignoreAbortErrors<T>(promise: Promise<T>): Promise<T | undefined> {
  try {
    return await promise;
  } catch (error: any) {
    if (!isAbortError(error)) {
      throw error;
    }
    return undefined;
  }
}

export function abortNullable<T extends { abort: () => void }>(obj: T | null): null {
  if (obj) {
    obj.abort();
  }
  return null;
}

export function removeNullable<T extends { remove: () => void }>(obj: T | null): null {
  if (obj) {
    obj.remove();
  }
  return null;
}
