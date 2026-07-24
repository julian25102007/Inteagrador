import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onDone, duration = 2500 }) {
  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  if (!message) return null;

  return <div className={`toast ${type === 'error' ? 'error' : ''}`}>{message}</div>;
}
