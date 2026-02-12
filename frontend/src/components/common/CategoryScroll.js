import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Events', emoji: '✨' },
  { id: 'trivia', label: 'Trivia', emoji: '🧠' },
  { id: 'board_games', label: 'Board Games', emoji: '🎲' },
  { id: 'music', label: 'Live Music', emoji: '🎵' },
  { id: 'dance', label: 'Dance', emoji: '💃' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'food_drink', label: 'Food & Drink', emoji: '🍕' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'comedy', label: 'Comedy', emoji: '😂' },
  { id: 'networking', label: 'Networking', emoji: '🤝' },
  { id: 'workshop', label: 'Workshop', emoji: '🛠️' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'karaoke', label: 'Karaoke', emoji: '🎤' },
  { id: 'open_mic', label: 'Open Mic', emoji: '🎙️' },
  { id: 'happy_hour', label: 'Happy Hour', emoji: '🍻' },
  { id: 'themed_night', label: 'Themed Night', emoji: '🌙' },
  { id: 'community', label: 'Community', emoji: '👥' },
];

const CategoryScroll = ({ selected = 'all', onSelect, className = '' }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={`category-scroll-container ${className}`}>
      <button
        className="category-scroll-arrow category-scroll-arrow-left"
        onClick={() => scroll('left')}
      >
        <ChevronLeft size={16} />
      </button>

      <div className="category-scroll" ref={scrollRef}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip ${selected === cat.id ? 'category-chip-active' : ''}`}
            onClick={() => onSelect && onSelect(cat.id)}
          >
            <span className="category-chip-emoji">{cat.emoji}</span>
            <span className="category-chip-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <button
        className="category-scroll-arrow category-scroll-arrow-right"
        onClick={() => scroll('right')}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export { categories };
export default CategoryScroll;
