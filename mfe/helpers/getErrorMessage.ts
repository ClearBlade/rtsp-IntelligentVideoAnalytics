export const getErrorMessage = (error: unknown): string => {

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      // Handle different JSON error structures
      if (parsed.results) {
        const results = JSON.parse(parsed.results);
        return results.error || results.message || results.results;
      }
      if (parsed.error?.message) {
        return parsed.error.message;
      }
      if (parsed.message) {
        return parsed.message;
      }
      if (parsed.errorMessage) {
        return parsed.errorMessage;
      }
      return error;
    } catch {
      return error; // Return original string if not JSON
    }
  }

  // Handle error objects with different structures
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, any>;
    
    // Check common error object patterns
    if (err.results) {
      try {
        const results = JSON.parse(err.results);
        return results.error || results.message || results.results;
      } catch {
        return err.results;
      }
    }
    if (err.error?.message) {
      return err.error.message;
    }
    if (err.message) {
      return err.message;
    }
    if (err.errorMessage) {
      return err.errorMessage;
    }
    if (err.description) {
      return err.description;
    }
  }

  // Fallback for other types
  return String(error);
};
