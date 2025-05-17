'use client';

import { toast } from 'sonner';
import { formatErrorMessage } from '@/utils/api-utils';

/**
 * A wrapper for API calls to handle errors consistently
 * @param apiCall The API call function to execute
 * @param options Configuration options for error handling
 * @returns Promise with the result of the API call
 */
export async function apiHandler<T>(
  apiCall: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    successMessage?: string;
    errorMessage?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  } = {}
): Promise<T | null> {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage = 'An error occurred',
    showSuccessToast = false,
    showErrorToast = true,
  } = options;

  try {
    const result = await apiCall();

    if (showSuccessToast && successMessage) {
      toast.success(successMessage);
    }

    onSuccess?.(result);
    return result;
  } catch (error) {
    const message = errorMessage + ': ' + formatErrorMessage(error);

    if (showErrorToast) {
      toast.error(message);
    }

    onError?.(error);
    console.error(error);
    return null;
  }
}
