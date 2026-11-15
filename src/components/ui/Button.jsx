import React from 'react';
import './Button.css';

/**
 * Universal Tactile Button Component
 * Hand-crafted avionics aesthetic:
 * - 1px physical border and soft realistic depth
 * - Pressed active state: translateY(1px) + inset shadow
 * - Strict 6px border-radius (4px for sm)
 * - Single restrained accent color (Tactile Amber) + neutral tones
 * - Fast, calm transitions (140ms ease-out)
 * - Accessible focus-visible ring and disabled states
 */
export const Button = React.forwardRef(function Button(
  {
    as: Component = 'button',
    children,
    variant = 'secondary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'tab' | 'toggle' | 'icon'
    size = 'md',          // 'sm' | 'md' | 'lg'
    icon: Icon,
    iconPosition = 'left',
    iconSize,
    isActive = false,
    isLoading = false,
    disabled = false,
    className = '',
    type = 'button',
    onClick,
    ...props
  },
  ref
) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const activeClass = isActive ? 'btn--active' : '';
  const loadingClass = isLoading ? 'btn--loading' : '';

  const fullClassName = [
    baseClass,
    variantClass,
    sizeClass,
    activeClass,
    loadingClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const defaultIconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  const resolvedIconSize = iconSize || defaultIconSize;

  const isButton = Component === 'button';
  const buttonType = isButton ? type : undefined;
  const isDisabled = disabled || isLoading;

  return (
    <Component
      ref={ref}
      className={fullClassName}
      onClick={onClick}
      type={buttonType}
      disabled={isButton ? isDisabled : undefined}
      aria-disabled={!isButton && isDisabled ? 'true' : undefined}
      tabIndex={!isButton && isDisabled ? -1 : undefined}
      aria-pressed={variant === 'tab' || variant === 'toggle' ? isActive : undefined}
      {...props}
    >
      {isLoading && <span className="btn__spinner" aria-hidden="true" />}
      {!isLoading && Icon && iconPosition === 'left' && (
        <Icon className="btn__icon btn__icon--left" size={resolvedIconSize} aria-hidden="true" />
      )}
      {children && <span className="btn__text">{children}</span>}
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="btn__icon btn__icon--right" size={resolvedIconSize} aria-hidden="true" />
      )}
    </Component>
  );
});

export default Button;
