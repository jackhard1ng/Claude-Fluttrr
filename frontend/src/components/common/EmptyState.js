import React from 'react';
import { Calendar, Search, MessageCircle, MapPin, Users, Bookmark, Star } from 'lucide-react';

const iconMap = {
  events: Calendar,
  search: Search,
  chat: MessageCircle,
  location: MapPin,
  people: Users,
  saved: Bookmark,
  reviews: Star,
};

const EmptyState = ({
  icon = 'events',
  title = 'Nothing here yet',
  message = '',
  actionLabel,
  onAction,
  className = '',
}) => {
  const Icon = iconMap[icon] || Calendar;

  return (
    <div
      className={`empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0, 136, 255, 0.1), rgba(0, 212, 170, 0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Icon size={36} color="#0088FF" strokeWidth={1.5} />
      </div>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#fff',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      {message && (
        <p
          style={{
            fontSize: '14px',
            color: '#8B8FAE',
            maxWidth: '280px',
            lineHeight: '1.5',
            marginBottom: actionLabel ? '20px' : '0',
          }}
        >
          {message}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          className="btn btn-primary"
          onClick={onAction}
          style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #0088FF, #00D4AA)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
