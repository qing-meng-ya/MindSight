import React from 'react';
import { useParticleNavigate } from './Layout';

const TransitionLink = ({
  to,
  className,
  children,
  onClick,
  disabled = false,
  ariaLabel,
}) => {
  const { navigateWithParticles } = useParticleNavigate();

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    }
    if (event.defaultPrevented || disabled) {
      return;
    }
    navigateWithParticles(to);
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default TransitionLink;
