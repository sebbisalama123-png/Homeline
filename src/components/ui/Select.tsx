/**
 * Custom Select built on Radix UI primitives, styled to match the
 * Homeline Furniture design language (earthy palette, pill/rounded forms).
 */
import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from './cn'

export type SelectOption = {
  value: string
  label: string
}

type SelectProps = {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  disabled?: boolean
  'aria-label'?: string
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  className,
  triggerClassName,
  disabled,
  'aria-label': ariaLabel,
}: SelectProps) {
  const selected = options.find((o) => o.value === value)

  return (
    <RadixSelect.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        className={cn('ht-select-trigger', triggerClassName)}
        aria-label={ariaLabel ?? selected?.label ?? placeholder}
      >
        <RadixSelect.Value placeholder={placeholder}>
          {selected?.label ?? placeholder}
        </RadixSelect.Value>
        <RadixSelect.Icon asChild>
          <ChevronDown size={13} className="ht-select-icon" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className={cn('ht-select-content', className)}
          position="popper"
          sideOffset={6}
          align="start"
        >
          <RadixSelect.ScrollUpButton className="ht-select-scroll-btn">
            <ChevronUp size={13} />
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport className="ht-select-viewport">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="ht-select-item"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="ht-select-item-check">
                  <Check size={12} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton className="ht-select-scroll-btn">
            <ChevronDown size={13} />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
