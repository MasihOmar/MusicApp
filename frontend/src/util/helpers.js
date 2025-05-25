// src/utils/helpers.js
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const truncateText = (text, length = 25) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};