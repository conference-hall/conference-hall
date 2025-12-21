import { arrow, FloatingArrow, flip, offset, type Placement, shift, useFloating } from '@floating-ui/react';
import type React from 'react';
import { useRef, useState } from 'react';

interface TooltipProps {
  text: string | React.ReactNode;
  placement?: Placement;
  as?: React.ElementType;
  children: React.ReactNode;
}

export function Tooltip({ text, placement = 'top', as: Tag = 'div', children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    placement,
    middleware: [offset(8), flip(), shift(), arrow({ element: arrowRef })],
  });

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  return (
    <Tag ref={refs.setReference} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} className="inline">
      {children}
      {isVisible && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-50 max-w-sm rounded-sm bg-gray-800 p-3 py-2 font-medium text-white text-xs"
        >
          {text}
          <FloatingArrow ref={arrowRef} context={context} fill="#1F2937" />
        </div>
      )}
    </Tag>
  );
}
