'use client';

import * as React from 'react';
import { Check, ChevronDown, X, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './button';
import { Modal } from './modal';
import { CategoryEditor } from '../video/category-editor';

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

export interface SelectProps {
  value: string[];
  options: SelectOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  allowManage?: boolean;
  onCategoriesChange?: () => Promise<void>;
}

export function Select({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className,
  allowManage = false,
  onCategoriesChange,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showManageModal, setShowManageModal] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  const handleToggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemoveOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const handleSaveCategories = async () => {
    if (!onCategoriesChange) return;

    try {
      setIsUpdating(true);
      await onCategoriesChange();
      setShowManageModal(false);
    } catch (error) {
      console.error('Failed to update categories:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="relative" ref={containerRef}>
        <div
          className={cn(
            'min-h-[2.5rem] p-1.5 border rounded-md bg-white cursor-pointer flex flex-wrap gap-1.5 items-center transition-all',
            'hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
            {
              'border-gray-300': !isOpen,
              'border-blue-500 ring-1 ring-blue-500': isOpen,
            },
            className
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map(option => (
              <span
                key={option.value}
                className="inline-flex items-center px-2 py-1 rounded text-sm transition-all hover:ring-1 hover:ring-gray-300"
                style={{
                  backgroundColor: option.color
                    ? `${option.color}20`
                    : 'rgb(229 231 235)',
                  color: option.color || 'rgb(75 85 99)',
                }}
              >
                {option.label}
                <X
                  className="ml-1.5 h-3 w-3 cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={e => handleRemoveOption(e, option.value)}
                />
              </span>
            ))
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
          <ChevronDown
            className={cn(
              'ml-auto h-4 w-4 shrink-0 opacity-50 transition-transform duration-200',
              { 'rotate-180': isOpen }
            )}
          />
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 z-10 mt-1 bg-white border rounded-md shadow-lg overflow-hidden min-w-[240px]">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50/80">
              <h3 className="text-sm font-medium text-gray-700">
                Select Categories
              </h3>
              {allowManage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    setIsOpen(false);
                    setShowManageModal(true);
                  }}
                  className="h-7 px-2 text-sm hover:bg-gray-200 transition-colors"
                  disabled={isUpdating}
                >
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Manage
                </Button>
              )}
            </div>

            <div
              className={cn(
                'p-1.5 overflow-y-auto',
                'scrollbar-thin scrollbar-track-transparent',
                'scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400',
                options.length > 6 ? 'max-h-[280px]' : 'max-h-none'
              )}
            >
              <div className="grid grid-cols-2 gap-1">
                {options.map(option => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center p-2 rounded-sm cursor-pointer transition-colors',
                      'hover:bg-gray-50',
                      { 'bg-blue-50/50': value.includes(option.value) }
                    )}
                    onClick={() => handleToggleOption(option.value)}
                  >
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      {option.color && (
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-black/5"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      <span className="truncate font-medium text-sm text-gray-700">
                        {option.label}
                      </span>
                    </div>
                    {value.includes(option.value) && (
                      <Check className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showManageModal && (
        <Modal
          title="Manage Categories"
          isOpen={true}
          onClose={() => setShowManageModal(false)}
        >
          <div className="py-2">
            <CategoryEditor
              onSave={handleSaveCategories}
              onCancel={() => setShowManageModal(false)}
              isUpdating={isUpdating}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
