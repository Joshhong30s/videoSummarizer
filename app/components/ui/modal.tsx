'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ModalProps extends React.ComponentProps<typeof Dialog.Root> {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({
    title,
    description,
    children,
    className,
    isOpen,
    onClose,
  }: ModalProps) => {
    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white dark:bg-gray-800 p-6 shadow-lg',
              'animate-in fade-in-0 zoom-in-95 duration-200',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150',
              className
            )}
          >
            {title && (
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight mb-4">
                {title}
              </Dialog.Title>
            )}
            {description && (
              <Dialog.Description className="text-sm text-muted-foreground mb-4">
                {description}
              </Dialog.Description>
            )}
            {children}
            <Dialog.Close className="absolute right-4 top-4 rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

Modal.displayName = 'Modal';
