import * as React from 'react';
import { toast as sonnerToast } from 'sonner';

export function useToast() {
  const toast = React.useCallback(({ title, description, variant = 'default', ...props }) => {
    if (variant === 'destructive') {
      sonnerToast.error(title, {
        description,
        ...props,
      });
    } else {
      sonnerToast(title, {
        description,
        ...props,
      });
    }
  }, []);

  return { toast };
} 