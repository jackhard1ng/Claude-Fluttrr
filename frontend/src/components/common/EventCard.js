import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Bookmark,
  Share2,
  Star,
  Zap,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import Avatar from './Avatar';

const categoryColors = {
  trivia: '#FFB347',
  board_games: '#00D4AA',
  music: '#FF6B6B',
  dance: '#E040FB',
  fitness: '#00D4AA',
  food_drink: '#FF8A65',
  art: '#7B61FF',
  comedy: '#FFD54F',
  networking: '#0088FF',
  workshop: '#26C6DA',
  sports: '#66BB6A',
  outdoor: '#4CAF50',
  wellness: '#80DEEA',
  karaoke: '#F06292',
  open_mic: '#FFB74D',
  happy_hour: '#FFA726',
  themed_night: '#BA68C8',
  community: '#42A5F5',
  education: '#5C6BC0',
  charity: '#EF5350',
  holiday: '#EC407A',
  special: '#AB47BC',
  other: '#78909C',
};

const formatEventDate = (startTime) => {
  const date = new Date(startTime);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === now.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}`;
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const EventCard = ({
  event,
  variant = 'default',
  showBusiness = true,
  onSave,
  onShare,
  className = '',
}) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (!event) return null;

  const categoryColor = categoryColors[event.category] || '#0088FF';
  const spotsLeft = event.max_attendees ? event.max_attendees - event.attendee_count : null;
  const isAlmostFull = spotsLeft !== null && spotsLeft <= 10 && spotsLeft > 0;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave && onSave(event.id);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare && onShare(event);
  };

  if (variant === 'featured') {
    return (
      <div
        className={`event-card event-card-featured ${className}`}
        onClick={() => navigate(`/event/${event.id}`)}
      >
        <div className="event-card-image-container">
          <div
            className="event-card-image"
            style={{
              backgroundImage: `url(${event.image_url || '/api/placeholder/800/500'})`,
            }}
          />
          <div className="event-card-image-overlay" />
          <div className="event-card-image-gradient" />

          <div className="event-card-top-badges">
            {event.is_featured && (
              <span className="badge badge-featured">
                <Zap size={12} /> Featured
              </span>
            )}
            {event.is_free ? (
              <span className="badge badge-free">Free</span>
            ) : (
              <span className="badge badge-price">
                <DollarSign size={12} />
                {parseFloat(event.price).toFixed(0)}
              </span>
            )}
          </div>

          <div className="event-card-save-btn" onClick={handleSave}>
            <Bookmark
              size={20}
              fill={isSaved ? '#0088FF' : 'none'}
              stroke={isSaved ? '#0088FF' : '#fff'}
            />
          </div>

          <div className="event-card-bottom-info">
            <span
              className="event-card-category-badge"
              style={{ backgroundColor: categoryColor + '22', color: categoryColor, borderColor: categoryColor + '44' }}
            >
              {event.category?.replace(/_/g, ' ')}
            </span>
            <h3 className="event-card-title">{event.title}</h3>
            <div className="event-card-meta-row">
              <div className="event-card-meta-item">
                <Calendar size={14} />
                <span>{formatEventDate(event.start_time)}</span>
              </div>
              <div className="event-card-meta-item">
                <Clock size={14} />
                <span>{formatTime(event.start_time)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="event-card-body">
          {showBusiness && event.Business && (
            <div className="event-card-business">
              <Avatar
                src={event.Business.logo_url}
                name={event.Business.name}
                size="xs"
              />
              <span className="event-card-business-name">{event.Business.name}</span>
              {event.Business.is_verified && (
                <Star size={12} className="verified-icon" fill="#0088FF" stroke="#0088FF" />
              )}
            </div>
          )}

          <div className="event-card-location">
            <MapPin size={14} />
            <span>{event.venue_name || event.address}</span>
          </div>

          <div className="event-card-footer">
            <div className="event-card-attendees">
              <div className="event-card-avatar-stack">
                {[...Array(Math.min(3, event.attendee_count || 0))].map((_, i) => (
                  <div
                    key={i}
                    className="event-card-avatar-stack-item"
                    style={{
                      backgroundImage: `url(/api/placeholder/32/32)`,
                      zIndex: 3 - i,
                      marginLeft: i > 0 ? '-8px' : '0',
                    }}
                  />
                ))}
              </div>
              <span className="event-card-attendee-count">
                {event.attendee_count} going
                {isAlmostFull && (
                  <span className="event-card-spots-warning">
                    · {spotsLeft} spots left!
                  </span>
                )}
                {isFull && (
                  <span className="event-card-spots-full">· Full</span>
                )}
              </span>
            </div>

            <div className="event-card-actions">
              <button className="event-card-action-btn" onClick={handleLike}>
                <Heart
                  size={16}
                  fill={isLiked ? '#FF6B6B' : 'none'}
                  stroke={isLiked ? '#FF6B6B' : 'var(--text-secondary)'}
                />
              </button>
              <button className="event-card-action-btn" onClick={handleShare}>
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`event-card-compact ${className}`}
        onClick={() => navigate(`/event/${event.id}`)}
      >
        <div
          className="event-card-compact-image"
          style={{
            backgroundImage: `url(${event.image_url || '/api/placeholder/200/200'})`,
          }}
        >
          {event.is_free && <span className="badge-mini badge-free">Free</span>}
        </div>
        <div className="event-card-compact-content">
          <span
            className="event-card-compact-category"
            style={{ color: categoryColor }}
          >
            {event.category?.replace(/_/g, ' ')}
          </span>
          <h4 className="event-card-compact-title">{event.title}</h4>
          <div className="event-card-compact-meta">
            <span className="event-card-compact-date">
              <Calendar size={12} />
              {formatEventDate(event.start_time)} · {formatTime(event.start_time)}
            </span>
          </div>
          <div className="event-card-compact-bottom">
            <span className="event-card-compact-location">
              <MapPin size={12} />
              {event.venue_name || event.city}
            </span>
            <span className="event-card-compact-attendees">
              <Users size={12} />
              {event.attendee_count}
            </span>
          </div>
        </div>
        <button className="event-card-compact-save" onClick={handleSave}>
          <Bookmark
            size={16}
            fill={isSaved ? '#0088FF' : 'none'}
            stroke={isSaved ? '#0088FF' : 'var(--text-secondary)'}
          />
        </button>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`event-card ${className}`}
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className="event-card-image-container">
        <div
          className="event-card-image"
          style={{
            backgroundImage: `url(${event.image_url || '/api/placeholder/600/400'})`,
          }}
        />
        <div className="event-card-image-overlay" />

        <div className="event-card-top-badges">
          {event.is_free ? (
            <span className="badge badge-free">Free</span>
          ) : (
            <span className="badge badge-price">${parseFloat(event.price).toFixed(0)}</span>
          )}
          {isAlmostFull && (
            <span className="badge badge-warning">
              <TrendingUp size={12} /> {spotsLeft} spots left
            </span>
          )}
        </div>

        <div className="event-card-save-btn" onClick={handleSave}>
          <Bookmark
            size={18}
            fill={isSaved ? '#0088FF' : 'none'}
            stroke={isSaved ? '#0088FF' : '#fff'}
          />
        </div>
      </div>

      <div className="event-card-body">
        <div className="event-card-header">
          <span
            className="event-card-category-badge"
            style={{ backgroundColor: categoryColor + '22', color: categoryColor, borderColor: categoryColor + '44' }}
          >
            {event.category?.replace(/_/g, ' ')}
          </span>
          {event.vibe_tags && event.vibe_tags.length > 0 && (
            <span className="event-card-vibe">
              {event.vibe_tags[0]}
            </span>
          )}
        </div>

        <h3 className="event-card-title">{event.title}</h3>

        <div className="event-card-details">
          <div className="event-card-meta-item">
            <Calendar size={14} />
            <span>{formatEventDate(event.start_time)} · {formatTime(event.start_time)}</span>
          </div>
          <div className="event-card-meta-item">
            <MapPin size={14} />
            <span>{event.venue_name || event.address}</span>
          </div>
        </div>

        {showBusiness && event.Business && (
          <div className="event-card-business">
            <Avatar src={event.Business.logo_url} name={event.Business.name} size="xs" />
            <span>{event.Business.name}</span>
          </div>
        )}

        <div className="event-card-footer">
          <div className="event-card-attendees">
            <Users size={14} />
            <span>{event.attendee_count} going</span>
          </div>
          <div className="event-card-actions">
            <button className="event-card-action-btn" onClick={handleLike}>
              <Heart
                size={16}
                fill={isLiked ? '#FF6B6B' : 'none'}
                stroke={isLiked ? '#FF6B6B' : 'currentColor'}
              />
            </button>
            <button className="event-card-action-btn" onClick={handleShare}>
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
