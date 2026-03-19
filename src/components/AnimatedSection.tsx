import React, { useEffect, useRef } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'fade';
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (ref.current) {
              ref.current.style.opacity = '1';
              ref.current.style.transform = 'translateY(0) translateX(0)';
            }
          }, delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const initialStyles: React.CSSProperties = {
    opacity: 0,
    transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
    transform:
      direction === 'up' ? 'translateY(30px)' :
      direction === 'left' ? 'translateX(-30px)' :
      direction === 'right' ? 'translateX(30px)' :
      'none',
  };

  return (
    <div ref={ref} style={initialStyles} className={className}>
      {children}
    </div>
  );
};

export default AnimatedSection;
