import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, ChevronRight } from 'lucide-react';
import Avatar from './Avatar';

const categoryIcons = {
  restaurant: '🍽️',
  bar: '🍺',
  cafe: '☕',
  gym: '💪',
  bowling: '🎳',
  arcade: '🕹️',
  bookstore: '📚',
  gallery: '🎨',
  theater: '🎭',
  music_venue: '🎵',
  sports: '⚽',
  wellness: '🧘',
  retail: '🛍️',
  coworking: '💻',
  park: '🌳',
  library: '📖',
  community_center: '🏛️',
  other: '📍',
};

const BusinessCard = ({ business, variant = 'default', className = '' }) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  if (!business) return null;

  const categoryIcon = categoryIcons[business.category] || '📍';

  if (variant === 'compact') {
    return (
      <div
        className={`business-card-compact ${className}`}
        onClick={() => navigate(`/business/${business.id}`)}
      >
        <Avatar
          src={business.logo_url}
          name={business.name}
          size="md"
        />
        <div className="business-card-compact-info">
          <div className="business-card-compact-header">
            <h4 className="business-card-compact-name">
              {business.name}
              {business.is_verified && (
                <Star size={12} className="verified-icon" fill="#0088FF" stroke="#0088FF" />
              )}
            </h4>
          </div>
          <span className="business-card-compact-category">
            {categoryIcon} {business.category?.replace(/_/g, ' ')}
          </span>
          <span className="business-card-compact-location">
            <MapPin size={12} /> {business.city}
          </span>
        </div>
        <ChevronRight size={18} className="text-tertiary" />
      </div>
    );
  }

  return (
    <div
      className={`business-card ${className}`}
      onClick={() => navigate(`/business/${business.id}`)}
    >
      <div
        className="business-card-cover"
        style={{
          backgroundImage: `url(${business.cover_photo_url || '/api/placeholder/600/300'})`,
        }}
      >
        <div className="business-card-cover-overlay" />
        {business.is_featured && (
          <span className="badge badge-featured-sm">Featured</span>
        )}
      </div>

      <div className="business-card-body">
        <div className="business-card-header">
          <Avatar
            src={business.logo_url}
            name={business.name}
            size="lg"
            className="business-card-avatar"
          />
          <div className="business-card-info">
            <h3 className="business-card-name">
              {business.name}
              {business.is_verified && (
                <Star size={14} className="verified-icon" fill="#0088FF" stroke="#0088FF" />
              )}
            </h3>
            <span className="business-card-category">
              {categoryIcon} {business.category?.replace(/_/g, ' ')}
            </span>
          </div>
          <button
            className={`btn btn-sm ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsFollowing(!isFollowing);
            }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        <p className="business-card-description">
          {business.short_description || business.description?.substring(0, 120)}
        </p>

        <div className="business-card-meta">
          <div className="business-card-meta-item">
            <MapPin size={14} />
            <span>{business.address}, {business.city}</span>
          </div>
          {business.rating > 0 && (
            <div className="business-card-meta-item">
              <Star size={14} fill="#FFB347" stroke="#FFB347" />
              <span>{parseFloat(business.rating).toFixed(1)} ({business.review_count})</span>
            </div>
          )}
        </div>

        <div className="business-card-stats">
          <div className="business-card-stat">
            <Users size={14} />
            <span>{business.follower_count} followers</span>
          </div>
          <div className="business-card-stat">
            <Calendar size={14} />
            <span>{business.total_events} events</span>
          </div>
          {business.price_range && (
            <div className="business-card-stat">
              <span className="price-range">{business.price_range}</span>
            </div>
          )}
        </div>

        {business.amenities && business.amenities.length > 0 && (
          <div className="business-card-amenities">
            {business.amenities.slice(0, 4).map((amenity) => (
              <span key={amenity} className="tag tag-sm">
                {amenity.replace(/_/g, ' ')}
              </span>
            ))}
            {business.amenities.length > 4 && (
              <span className="tag tag-sm tag-more">+{business.amenities.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessCard;
