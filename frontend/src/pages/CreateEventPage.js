import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Camera,
  X,
  Plus,
  Check,
  ChevronDown,
  Tag,
  FileText,
  Image,
  Globe,
  Accessibility,
  Car,
  Train,
  Eye,
  Save,
  Send,
  Sparkles,
  Info,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const EVENT_CATEGORIES = [
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

const VIBE_TAGS = [
  'social', 'competitive', 'casual', 'fun', 'energetic', 'chill',
  'creative', 'romantic', 'educational', 'adventurous', 'cozy',
  'party', 'artsy', 'mindful', 'productive', 'family-friendly',
];

const AGE_OPTIONS = ['All Ages', '18+', '21+'];

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const STEPS = [
  { num: 1, label: 'Basic Info' },
  { num: 2, label: 'Details' },
  { num: 3, label: 'Location' },
  { num: 4, label: 'Review' },
];

// ---------------------------------------------------------------------------
// Helper: format date string for display
// ---------------------------------------------------------------------------
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(h), parseInt(m));
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// ---------------------------------------------------------------------------
// CreateEventPage Component
// ---------------------------------------------------------------------------
const CreateEventPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // Step 2 state
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFreeEvent, setIsFreeEvent] = useState(true);
  const [price, setPrice] = useState('');
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [maxAttendees, setMaxAttendees] = useState('');
  const [ageRestriction, setAgeRestriction] = useState('All Ages');
  const [difficultyLevel, setDifficultyLevel] = useState('All Levels');
  const [selectedVibes, setSelectedVibes] = useState([]);

  // Step 3 state
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [useBusinessAddress, setUseBusinessAddress] = useState(false);
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualUrl, setVirtualUrl] = useState('');
  const [whatToBring, setWhatToBring] = useState([]);
  const [bringInput, setBringInput] = useState('');
  const [accessibility, setAccessibility] = useState({
    wheelchair: false,
    parking: false,
    publicTransit: false,
  });

  // -------------------------------------------------------------------
  // Validation per step
  // -------------------------------------------------------------------
  const isStep1Valid = title.trim() && category && shortDescription.trim();
  const isStep2Valid = startDate && startTime;
  const isStep3Valid = isVirtual ? virtualUrl.trim() : venueName.trim() && city.trim();

  const canProceed = () => {
    switch (currentStep) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Tag management
  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // What to bring management
  const addBringItem = () => {
    const trimmed = bringInput.trim();
    if (trimmed && !whatToBring.includes(trimmed)) {
      setWhatToBring([...whatToBring, trimmed]);
      setBringInput('');
    }
  };

  const removeBringItem = (item) => setWhatToBring(whatToBring.filter((i) => i !== item));

  const handleBringKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBringItem();
    }
  };

  // Vibe toggle
  const toggleVibe = (vibe) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  // Auto-fill business address
  const handleUseBusinessAddress = (checked) => {
    setUseBusinessAddress(checked);
    if (checked) {
      setVenueName('BrewHaus ATX');
      setAddress('1200 E 6th St');
      setCity('Austin');
      setState('Texas');
      setZipCode('78702');
    }
  };

  // Simulated image upload
  const handleImageUpload = () => {
    setImagePreview('/api/placeholder/800/500');
  };

  // Get category label
  const getCategoryLabel = () => {
    const cat = EVENT_CATEGORIES.find((c) => c.id === category);
    return cat ? `${cat.emoji} ${cat.label}` : '';
  };

  // -------------------------------------------------------------------
  // Styles
  // -------------------------------------------------------------------
  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#0A0E27',
      paddingBottom: 100,
      fontFamily: "'Inter', sans-serif",
    },
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      backgroundColor: '#0A0E27',
      borderBottom: '1px solid #1E2448',
      padding: '16px 20px 16px',
    },
    headerInner: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: '#1A1F44',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#E8EAFF',
      transition: 'background-color 0.2s',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: '#FFFFFF',
      margin: 0,
      flex: 1,
    },
    stepIndicator: {
      fontSize: 13,
      color: '#8A8FB5',
      fontWeight: 500,
    },
    progressContainer: {
      padding: '20px 20px 0',
    },
    progressSteps: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
    },
    stepDot: (isActive, isComplete) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      zIndex: 1,
    }),
    stepCircle: (isActive, isComplete) => ({
      width: 36,
      height: 36,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 700,
      backgroundColor: isComplete
        ? '#0088FF'
        : isActive
        ? '#0088FF'
        : '#1A1F44',
      color: isComplete || isActive ? '#FFFFFF' : '#5A5F7D',
      border: isActive && !isComplete ? '2px solid #0088FF' : '2px solid transparent',
      transition: 'all 0.3s',
    }),
    stepLabel: (isActive) => ({
      fontSize: 11,
      fontWeight: isActive ? 600 : 400,
      color: isActive ? '#E8EAFF' : '#5A5F7D',
      whiteSpace: 'nowrap',
    }),
    progressLine: {
      position: 'absolute',
      top: 18,
      left: '12%',
      right: '12%',
      height: 2,
      backgroundColor: '#1A1F44',
      zIndex: 0,
    },
    progressLineFill: {
      height: '100%',
      backgroundColor: '#0088FF',
      borderRadius: 2,
      transition: 'width 0.4s ease',
    },
    formBody: {
      padding: '24px 20px',
    },
    fieldGroup: {
      marginBottom: 20,
    },
    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: '#E8EAFF',
      marginBottom: 8,
    },
    required: {
      color: '#FF6B6B',
      marginLeft: 2,
    },
    input: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: 12,
      backgroundColor: '#1A1F44',
      border: '1px solid #1E2448',
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: 12,
      backgroundColor: '#1A1F44',
      border: '1px solid #1E2448',
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      outline: 'none',
      resize: 'vertical',
      minHeight: 80,
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: 12,
      backgroundColor: '#1A1F44',
      border: '1px solid #1E2448',
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      outline: 'none',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%238A8FB5\' stroke-width=\'2\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 14px center',
      boxSizing: 'border-box',
    },
    tagContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '6px 12px',
      borderRadius: 20,
      backgroundColor: 'rgba(0,136,255,0.15)',
      color: '#0088FF',
      fontSize: 12,
      fontWeight: 500,
    },
    tagRemove: {
      background: 'none',
      border: 'none',
      color: '#0088FF',
      cursor: 'pointer',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
    },
    imageUpload: {
      width: '100%',
      height: 180,
      borderRadius: 16,
      border: '2px dashed #1E2448',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      cursor: 'pointer',
      backgroundColor: '#1A1F44',
      transition: 'border-color 0.2s, background-color 0.2s',
      position: 'relative',
      overflow: 'hidden',
    },
    imageUploadText: {
      fontSize: 13,
      color: '#8A8FB5',
      textAlign: 'center',
    },
    toggleRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
    },
    toggleLabel: {
      fontSize: 14,
      color: '#E8EAFF',
      fontWeight: 500,
    },
    toggle: (isOn) => ({
      width: 48,
      height: 26,
      borderRadius: 13,
      backgroundColor: isOn ? '#0088FF' : '#1A1F44',
      border: isOn ? 'none' : '1px solid #1E2448',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background-color 0.2s',
      flexShrink: 0,
    }),
    toggleKnob: (isOn) => ({
      width: 22,
      height: 22,
      borderRadius: '50%',
      backgroundColor: '#FFFFFF',
      position: 'absolute',
      top: 2,
      left: isOn ? 24 : 2,
      transition: 'left 0.2s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    }),
    vibeGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
    },
    vibeChip: (isSelected) => ({
      padding: '8px 16px',
      borderRadius: 20,
      backgroundColor: isSelected ? 'rgba(0,136,255,0.2)' : '#1A1F44',
      border: isSelected ? '1px solid #0088FF' : '1px solid #1E2448',
      color: isSelected ? '#0088FF' : '#8A8FB5',
      fontSize: 13,
      fontWeight: isSelected ? 600 : 400,
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontFamily: "'Inter', sans-serif",
    }),
    checkboxRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 0',
      cursor: 'pointer',
    },
    checkbox: (isChecked) => ({
      width: 22,
      height: 22,
      borderRadius: 6,
      backgroundColor: isChecked ? '#0088FF' : '#1A1F44',
      border: isChecked ? 'none' : '1px solid #1E2448',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.2s',
    }),
    checkboxLabel: {
      fontSize: 14,
      color: '#E8EAFF',
    },
    halfRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
    },
    footer: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '16px 20px',
      backgroundColor: '#0A0E27',
      borderTop: '1px solid #1E2448',
      display: 'flex',
      gap: 12,
      zIndex: 20,
    },
    btnSecondary: {
      flex: 1,
      padding: '14px',
      borderRadius: 12,
      backgroundColor: '#1A1F44',
      border: '1px solid #1E2448',
      color: '#E8EAFF',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'background-color 0.2s',
    },
    btnPrimary: (disabled) => ({
      flex: 2,
      padding: '14px',
      borderRadius: 12,
      background: disabled
        ? '#1A1F44'
        : 'linear-gradient(135deg, #0066CC, #0088FF)',
      border: 'none',
      color: disabled ? '#5A5F7D' : '#FFFFFF',
      fontSize: 15,
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'opacity 0.2s',
      opacity: disabled ? 0.5 : 1,
    }),
    // Review step styles
    reviewCard: {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
      marginBottom: 16,
    },
    reviewSection: {
      padding: '16px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    reviewLabel: {
      fontSize: 11,
      fontWeight: 600,
      color: '#5A5F7D',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    reviewValue: {
      fontSize: 15,
      color: '#E8EAFF',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    reviewMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      color: '#8A8FB5',
      marginTop: 4,
    },
    previewCard: {
      backgroundColor: '#0F1336',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
    },
    previewImage: {
      width: '100%',
      height: 160,
      backgroundColor: '#1A1F44',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    previewBody: {
      padding: 16,
    },
    previewTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: '#E8EAFF',
      margin: '0 0 8px',
    },
    previewDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      color: '#8A8FB5',
      marginBottom: 4,
    },
  };

  // -------------------------------------------------------------------
  // Step renderers
  // -------------------------------------------------------------------
  const renderStep1 = () => (
    <>
      {/* Title */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          Event Title<span style={styles.required}>*</span>
        </label>
        <input
          style={styles.input}
          type="text"
          placeholder="Give your event a catchy name..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
          onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
        />
        <div style={{ textAlign: 'right', fontSize: 11, color: '#5A5F7D', marginTop: 4 }}>
          {title.length}/100
        </div>
      </div>

      {/* Category */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          Category<span style={styles.required}>*</span>
        </label>
        <select
          style={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select a category...</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.emoji} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Short Description */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          Short Description<span style={styles.required}>*</span>
        </label>
        <textarea
          style={{ ...styles.textarea, minHeight: 60 }}
          placeholder="A brief one-liner about your event..."
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          maxLength={200}
          onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
          onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
        />
        <div style={{ textAlign: 'right', fontSize: 11, color: '#5A5F7D', marginTop: 4 }}>
          {shortDescription.length}/200
        </div>
      </div>

      {/* Full Description */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Full Description</label>
        <textarea
          style={{ ...styles.textarea, minHeight: 120 }}
          placeholder="Tell people everything they need to know about your event..."
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
          onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
        />
      </div>

      {/* Tags */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          <Tag size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Tags
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ ...styles.input, flex: 1 }}
            type="text"
            placeholder="Type a tag and press Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
            onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
          />
          <button
            style={{
              ...styles.btnSecondary,
              flex: 'none',
              width: 44,
              padding: 0,
            }}
            onClick={addTag}
          >
            <Plus size={18} />
          </button>
        </div>
        {tags.length > 0 && (
          <div style={styles.tagContainer}>
            {tags.map((tag) => (
              <span key={tag} style={styles.tag}>
                #{tag}
                <button style={styles.tagRemove} onClick={() => removeTag(tag)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          <Image size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Cover Image
        </label>
        <div
          style={styles.imageUpload}
          onClick={handleImageUpload}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0088FF';
            e.currentTarget.style.backgroundColor = 'rgba(0,136,255,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1E2448';
            e.currentTarget.style.backgroundColor = '#1A1F44';
          }}
        >
          {imagePreview ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${imagePreview})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : (
            <>
              <Camera size={32} color="#5A5F7D" />
              <span style={styles.imageUploadText}>
                Click to upload a cover image<br />
                <span style={{ fontSize: 11 }}>Recommended: 800x500px, JPG or PNG</span>
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      {/* Date & Time */}
      <div style={styles.halfRow}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Start Date<span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
            onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
          />
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Start Time<span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input}
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
            onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
          />
        </div>
      </div>

      <div style={styles.halfRow}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>End Date</label>
          <input
            style={styles.input}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
            onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
          />
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>End Time</label>
          <input
            style={styles.input}
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
            onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
          />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '8px 0 20px' }} />

      {/* Price */}
      <div style={styles.fieldGroup}>
        <div style={styles.toggleRow}>
          <span style={styles.toggleLabel}>
            <DollarSign size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Free Event
          </span>
          <div
            style={styles.toggle(isFreeEvent)}
            onClick={() => setIsFreeEvent(!isFreeEvent)}
          >
            <div style={styles.toggleKnob(isFreeEvent)} />
          </div>
        </div>
        {!isFreeEvent && (
          <div style={{ marginTop: 8 }}>
            <input
              style={styles.input}
              type="number"
              placeholder="Ticket price ($)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
              onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
            />
          </div>
        )}
      </div>

      {/* Max Attendees */}
      <div style={styles.fieldGroup}>
        <div style={styles.toggleRow}>
          <span style={styles.toggleLabel}>
            <Users size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Unlimited Attendees
          </span>
          <div
            style={styles.toggle(isUnlimited)}
            onClick={() => setIsUnlimited(!isUnlimited)}
          >
            <div style={styles.toggleKnob(isUnlimited)} />
          </div>
        </div>
        {!isUnlimited && (
          <div style={{ marginTop: 8 }}>
            <input
              style={styles.input}
              type="number"
              placeholder="Maximum number of attendees"
              value={maxAttendees}
              onChange={(e) => setMaxAttendees(e.target.value)}
              min="1"
              onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
              onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
            />
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '8px 0 20px' }} />

      {/* Age Restriction */}
      <div style={styles.halfRow}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Age Restriction</label>
          <select
            style={styles.select}
            value={ageRestriction}
            onChange={(e) => setAgeRestriction(e.target.value)}
          >
            {AGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Difficulty Level</label>
          <select
            style={styles.select}
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value)}
          >
            {DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vibe Tags */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Vibe Tags
        </label>
        <div style={styles.vibeGrid}>
          {VIBE_TAGS.map((vibe) => (
            <button
              key={vibe}
              style={styles.vibeChip(selectedVibes.includes(vibe))}
              onClick={() => toggleVibe(vibe)}
            >
              {vibe}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      {/* Virtual Toggle */}
      <div style={styles.fieldGroup}>
        <div style={styles.toggleRow}>
          <span style={styles.toggleLabel}>
            <Globe size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Virtual Event
          </span>
          <div
            style={styles.toggle(isVirtual)}
            onClick={() => setIsVirtual(!isVirtual)}
          >
            <div style={styles.toggleKnob(isVirtual)} />
          </div>
        </div>
      </div>

      {isVirtual ? (
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Event URL<span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input}
            type="url"
            placeholder="https://zoom.us/j/123456789"
            value={virtualUrl}
            onChange={(e) => setVirtualUrl(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
            onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
          />
        </div>
      ) : (
        <>
          {/* Business address checkbox */}
          <div
            style={styles.checkboxRow}
            onClick={() => handleUseBusinessAddress(!useBusinessAddress)}
          >
            <div style={styles.checkbox(useBusinessAddress)}>
              {useBusinessAddress && <Check size={14} color="#FFFFFF" />}
            </div>
            <span style={styles.checkboxLabel}>Same as business address</span>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Venue Name<span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              type="text"
              placeholder="Where is it happening?"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
              onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Address</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Street address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
              onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
            />
          </div>

          <div style={styles.halfRow}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                City<span style={styles.required}>*</span>
              </label>
              <input
                style={styles.input}
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
                onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>State</label>
              <input
                style={styles.input}
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
                onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Zip Code</label>
            <input
              style={{ ...styles.input, maxWidth: 160 }}
              type="text"
              placeholder="Zip code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
              onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
            />
          </div>
        </>
      )}

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '8px 0 20px' }} />

      {/* What to Bring */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>What to Bring</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ ...styles.input, flex: 1 }}
            type="text"
            placeholder="e.g., Yoga mat, Water bottle..."
            value={bringInput}
            onChange={(e) => setBringInput(e.target.value)}
            onKeyDown={handleBringKeyDown}
            onFocus={(e) => (e.target.style.borderColor = '#0088FF')}
            onBlur={(e) => (e.target.style.borderColor = '#1E2448')}
          />
          <button
            style={{
              ...styles.btnSecondary,
              flex: 'none',
              width: 44,
              padding: 0,
            }}
            onClick={addBringItem}
          >
            <Plus size={18} />
          </button>
        </div>
        {whatToBring.length > 0 && (
          <div style={styles.tagContainer}>
            {whatToBring.map((item) => (
              <span key={item} style={{ ...styles.tag, backgroundColor: 'rgba(0,212,170,0.15)', color: '#00D4AA' }}>
                {item}
                <button
                  style={{ ...styles.tagRemove, color: '#00D4AA' }}
                  onClick={() => removeBringItem(item)}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Accessibility */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          <Accessibility size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Accessibility
        </label>
        <div
          style={styles.checkboxRow}
          onClick={() =>
            setAccessibility({ ...accessibility, wheelchair: !accessibility.wheelchair })
          }
        >
          <div style={styles.checkbox(accessibility.wheelchair)}>
            {accessibility.wheelchair && <Check size={14} color="#FFFFFF" />}
          </div>
          <Accessibility size={16} color="#8A8FB5" />
          <span style={styles.checkboxLabel}>Wheelchair Accessible</span>
        </div>
        <div
          style={styles.checkboxRow}
          onClick={() =>
            setAccessibility({ ...accessibility, parking: !accessibility.parking })
          }
        >
          <div style={styles.checkbox(accessibility.parking)}>
            {accessibility.parking && <Check size={14} color="#FFFFFF" />}
          </div>
          <Car size={16} color="#8A8FB5" />
          <span style={styles.checkboxLabel}>Parking Available</span>
        </div>
        <div
          style={styles.checkboxRow}
          onClick={() =>
            setAccessibility({ ...accessibility, publicTransit: !accessibility.publicTransit })
          }
        >
          <div style={styles.checkbox(accessibility.publicTransit)}>
            {accessibility.publicTransit && <Check size={14} color="#FFFFFF" />}
          </div>
          <Train size={16} color="#8A8FB5" />
          <span style={styles.checkboxLabel}>Near Public Transit</span>
        </div>
      </div>
    </>
  );

  const renderStep4 = () => (
    <>
      <div style={{ marginBottom: 20 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#E8EAFF',
            margin: '0 0 4px',
          }}
        >
          Review Your Event
        </h3>
        <p style={{ fontSize: 13, color: '#8A8FB5', margin: 0 }}>
          Make sure everything looks good before publishing.
        </p>
      </div>

      {/* Event Preview Card */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#5A5F7D', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <Eye size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Card Preview
        </div>
        <div style={styles.previewCard}>
          <div
            style={{
              ...styles.previewImage,
              backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
            }}
          >
            {!imagePreview && (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5A5F7D',
                }}
              >
                <Camera size={32} />
              </div>
            )}
          </div>
          <div style={styles.previewBody}>
            {category && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(0,136,255,0.15)',
                  color: '#0088FF',
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                {getCategoryLabel()}
              </span>
            )}
            <h4 style={styles.previewTitle}>{title || 'Event Title'}</h4>
            {startDate && (
              <div style={styles.previewDetail}>
                <Calendar size={14} />
                {formatDateDisplay(startDate)}
                {startTime && ` at ${formatTimeDisplay(startTime)}`}
              </div>
            )}
            <div style={styles.previewDetail}>
              <MapPin size={14} />
              {isVirtual ? 'Virtual Event' : venueName || 'Venue'}
              {city && !isVirtual && `, ${city}`}
            </div>
            {!isFreeEvent && price && (
              <div style={styles.previewDetail}>
                <DollarSign size={14} />
                ${parseFloat(price).toFixed(2)}
              </div>
            )}
            {isFreeEvent && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(0,212,170,0.15)',
                  color: '#00D4AA',
                  fontSize: 11,
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                Free
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Review */}
      <div style={styles.reviewCard}>
        <div style={styles.reviewSection}>
          <div style={styles.reviewLabel}>Basic Info</div>
          <div style={styles.reviewValue}>{title}</div>
          <div style={styles.reviewMeta}>
            {getCategoryLabel()}
          </div>
          {shortDescription && (
            <div style={{ ...styles.reviewMeta, marginTop: 8, color: '#A0A6C0' }}>
              {shortDescription}
            </div>
          )}
        </div>

        <div style={styles.reviewSection}>
          <div style={styles.reviewLabel}>Date & Time</div>
          <div style={styles.reviewMeta}>
            <Calendar size={14} />
            {startDate ? formatDateDisplay(startDate) : 'Not set'}
            {startTime && ` at ${formatTimeDisplay(startTime)}`}
          </div>
          {(endDate || endTime) && (
            <div style={styles.reviewMeta}>
              <Clock size={14} />
              Ends: {endDate ? formatDateDisplay(endDate) : formatDateDisplay(startDate)}
              {endTime && ` at ${formatTimeDisplay(endTime)}`}
            </div>
          )}
        </div>

        <div style={styles.reviewSection}>
          <div style={styles.reviewLabel}>Details</div>
          <div style={styles.reviewMeta}>
            <DollarSign size={14} />
            {isFreeEvent ? 'Free Event' : `$${parseFloat(price || 0).toFixed(2)}`}
          </div>
          <div style={styles.reviewMeta}>
            <Users size={14} />
            {isUnlimited ? 'Unlimited attendees' : maxAttendees ? `Max ${maxAttendees} attendees` : 'No limit set'}
          </div>
          <div style={styles.reviewMeta}>
            Age: {ageRestriction} | Level: {difficultyLevel}
          </div>
        </div>

        <div style={styles.reviewSection}>
          <div style={styles.reviewLabel}>Location</div>
          <div style={styles.reviewMeta}>
            <MapPin size={14} />
            {isVirtual
              ? `Virtual: ${virtualUrl || 'URL not set'}`
              : `${venueName || 'Not set'}${address ? `, ${address}` : ''}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}${zipCode ? ` ${zipCode}` : ''}`}
          </div>
        </div>

        {(selectedVibes.length > 0 || tags.length > 0) && (
          <div style={{ ...styles.reviewSection, borderBottom: 'none' }}>
            <div style={styles.reviewLabel}>Tags & Vibes</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {tags.map((tag) => (
                <span key={tag} style={styles.tag}>#{tag}</span>
              ))}
              {selectedVibes.map((vibe) => (
                <span
                  key={vibe}
                  style={{
                    ...styles.tag,
                    backgroundColor: 'rgba(123,97,255,0.15)',
                    color: '#7B61FF',
                  }}
                >
                  {vibe}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );

  // -------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <button
            style={styles.backBtn}
            onClick={() => {
              if (currentStep > 1) {
                handleBack();
              } else {
                navigate(-1);
              }
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222855')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1A1F44')}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 style={styles.headerTitle}>Create Event</h1>
          <span style={styles.stepIndicator}>Step {currentStep} of 4</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={styles.progressContainer}>
        <div style={styles.progressSteps}>
          <div style={styles.progressLine}>
            <div
              style={{
                ...styles.progressLineFill,
                width: `${((currentStep - 1) / 3) * 100}%`,
              }}
            />
          </div>
          {STEPS.map((step) => {
            const isActive = currentStep === step.num;
            const isComplete = currentStep > step.num;
            return (
              <div key={step.num} style={styles.stepDot(isActive, isComplete)}>
                <div style={styles.stepCircle(isActive, isComplete)}>
                  {isComplete ? <Check size={16} /> : step.num}
                </div>
                <span style={styles.stepLabel(isActive || isComplete)}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Body */}
      <div style={styles.formBody}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Footer Navigation */}
      <div style={styles.footer}>
        {currentStep > 1 && (
          <button
            style={styles.btnSecondary}
            onClick={handleBack}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222855')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1A1F44')}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}

        {currentStep < 4 ? (
          <button
            style={styles.btnPrimary(!canProceed())}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight size={16} />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12, flex: 1 }}>
            <button
              style={styles.btnSecondary}
              onClick={() => alert('Event saved as draft!')}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222855')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1A1F44')}
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              style={styles.btnPrimary(false)}
              onClick={() => {
                alert('Event published!');
                navigate('/dashboard');
              }}
            >
              <Send size={16} />
              Publish Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEventPage;
