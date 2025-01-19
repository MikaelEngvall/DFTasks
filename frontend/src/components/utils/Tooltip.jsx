// utils/Tooltip.jsx

import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";

const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

const Tooltip = ({ children, text, position = "bottom", space = 5 }) => {
  // Ensure children is an array for consistent processing
  const childArray = React.Children.toArray(children);

  // State to manage tooltip visibility
  const [open, setOpen] = useState(false);

  // Refs for the tooltip and the element it is attached to
  const tooltipRef = useRef();
  const elementRefs = useRef([]);

  // Function to handle mouse enter event
  const handleMouseEnter = (index) => {
    setOpen(true);
    const { x, y } = getPoint(
      elementRefs.current[index],
      tooltipRef.current,
      position,
      space
    );
    tooltipRef.current.style.left = `${x}px`;
    tooltipRef.current.style.top = `${y}px`;
  };

  // Function to calculate tooltip position
  const getPoint = (element, tooltip, position, space) => {
    const eleRect = element.getBoundingClientRect();
    const pt = { x: 0, y: 0 };
    switch (position) {
      case "bottom":
        pt.x = eleRect.left + (element.offsetWidth - tooltip.offsetWidth) / 2;
        pt.y = eleRect.bottom + space;
        break;
      case "left":
        pt.x = eleRect.left - (tooltip.offsetWidth + space);
        pt.y = eleRect.top + (element.offsetHeight - tooltip.offsetHeight) / 2;
        break;
      case "right":
        pt.x = eleRect.right + space;
        pt.y = eleRect.top + (element.offsetHeight - tooltip.offsetHeight) / 2;
        break;
      case "top":
        pt.x = eleRect.left + (element.offsetWidth - tooltip.offsetWidth) / 2;
        pt.y = eleRect.top - (tooltip.offsetHeight + space);
        break;
      default:
        break;
    }
    return pt;
  };

  // Tailwind CSS classes for the tooltip
  const tooltipClasses = `fixed transition-opacity duration-200 ${
    open ? "opacity-100" : "opacity-0"
  } pointer-events-none z-50 rounded-md bg-black text-white px-4 py-2 text-center w-max max-w-xs
  ${
    position === "top" &&
    "after:content-[''] after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-t-black"
  }
  ${
    position === "bottom" &&
    "after:content-[''] after:absolute after:left-1/2 after:bottom-full after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-b-black"
  }
  ${
    position === "left" &&
    "after:content-[''] after:absolute after:top-1/2 after:left-full after:-translate-y-1/2 after:border-[5px] after:border-transparent after:border-l-black"
  }
  ${
    position === "right" &&
    "after:content-[''] after:absolute after:top-1/2 after:right-full after:-translate-y-1/2 after:border-[5px] after:border-transparent after:border-r-black"
  }`;

  return (
    <>
      {childArray.map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onMouseEnter: () => handleMouseEnter(index),
            onMouseLeave: () => setOpen(false),
            ref: (el) => (elementRefs.current[index] = el),
            key: index,
          });
        }
        return child;
      })}

      <Portal>
        <div ref={tooltipRef} className={tooltipClasses}>
          {text}
        </div>
      </Portal>
    </>
  );
};

export default Tooltip;
