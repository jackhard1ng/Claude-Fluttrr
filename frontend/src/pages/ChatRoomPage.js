import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Info,
  Plus,
  Smile,
  Send,
  Check,
  CheckCheck,
  Users,
  Image,
  Camera,
  Paperclip,
  Mic,
} from 'lucide-react';
import Avatar from '../components/common/Avatar';

const mockMessages = [
  {
    id: 'm1',
    sender_id: 'u1',
    sender: { display_name: 'Sarah Chen', avatar_url: '/api/placeholder/40/40' },
    content: 'Hey everyone! So excited for trivia tomorrow! \u{1F389}',
    type: 'text',
    created_at: new Date(Date.now() - 7200000),
  },
  {
    id: 'm2',
    sender_id: 'u4',
    sender: { display_name: 'James Park', avatar_url: '/api/placeholder/40/40' },
    content: "Same here! I've been studying pop culture all week \u{1F602}",
    type: 'text',
    created_at: new Date(Date.now() - 7000000),
  },
  {
    id: 'sys1',
    type: 'system',
    content: 'Luna Martinez joined the chat',
    created_at: new Date(Date.now() - 6000000),
  },
  {
    id: 'm3',
    sender_id: 'u5',
    sender: { display_name: 'Luna Martinez', avatar_url: '/api/placeholder/40/40' },
    content: 'Hey! First time at this trivia night. Is it usually packed?',
    type: 'text',
    created_at: new Date(Date.now() - 5400000),
  },
  {
    id: 'm4',
    sender_id: 'u1',
    sender: { display_name: 'Sarah Chen', avatar_url: '/api/placeholder/40/40' },
    content:
      "It gets busy! I'd recommend arriving by 6:30 to get a good table. Teams can be up to 6 people.",
    type: 'text',
    created_at: new Date(Date.now() - 5000000),
  },
  {
    id: 'm5',
    sender_id: 'demo',
    sender: { display_name: 'You', avatar_url: '/api/placeholder/40/40' },
    content: "Can't wait for tomorrow! Anyone need a team?",
    type: 'text',
    created_at: new Date(Date.now() - 120000),
    read_by: ['u1', 'u4'],
  },
  {
    id: 'm6',
    sender_id: 'u4',
    sender: { display_name: 'James Park', avatar_url: '/api/placeholder/40/40' },
    content: "I'm in! We could form a team together. I'm decent at movies and music.",
    type: 'text',
    created_at: new Date(Date.now() - 60000),
  },
  {
    id: 'sys2',
    type: 'system',
    content: '\u{1F4C5} Event starts tomorrow at 7:00 PM',
    created_at: new Date(Date.now() - 30000),
  },
];

const mockRoomInfo = {
  id: 'r1',
  name: 'Tuesday Trivia Night Chat',
  type: 'event',
  avatar_url: '/api/placeholder/100/100',
  member_count: 67,
  isOnline: false,
};

const DEMO_USER_ID = 'demo';

const formatMessageTime = (date) => {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const formatDateSeparator = (date) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

const shouldShowDateSeparator = (messages, index) => {
  if (index === 0) return true;
  const current = new Date(messages[index].created_at);
  const previous = new Date(messages[index - 1].created_at);
  return current.toDateString() !== previous.toDateString();
};

const shouldShowSenderInfo = (messages, index) => {
  const msg = messages[index];
  if (msg.type === 'system' || msg.sender_id === DEMO_USER_ID) return false;
  if (index === 0) return true;
  const prev = messages[index - 1];
  if (prev.type === 'system') return true;
  return prev.sender_id !== msg.sender_id;
};

const TypingIndicator = () => {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      padding: '4px 20px 8px',
    },
    bubble: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#1A1F44',
      borderRadius: '18px 18px 18px 4px',
      padding: '12px 16px',
    },
    dot: (delay) => ({
      width: 7,
      height: 7,
      borderRadius: '50%',
      backgroundColor: '#6B7194',
      animation: `typingBounce 1.4s ease-in-out ${delay}s infinite`,
    }),
  };

  return (
    <div style={styles.container}>
      <Avatar name="Luna Martinez" size="xs" />
      <div style={styles.bubble}>
        <div style={styles.dot(0)} />
        <div style={styles.dot(0.2)} />
        <div style={styles.dot(0.4)} />
      </div>
    </div>
  );
};

const ChatRoomPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const roomInfo = mockRoomInfo;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: `m${Date.now()}`,
      sender_id: DEMO_USER_ID,
      sender: { display_name: 'You', avatar_url: '/api/placeholder/40/40' },
      content: inputText.trim(),
      type: 'text',
      created_at: new Date(),
      read_by: [],
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setShowAttachments(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const styles = {
    page: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#0A0E27',
      fontFamily: "'Inter', sans-serif",
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      backgroundColor: '#0F1336',
      borderBottom: '1px solid #1E2448',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: 'transparent',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#FFFFFF',
      transition: 'background-color 0.2s',
      flexShrink: 0,
    },
    headerInfo: {
      flex: 1,
      minWidth: 0,
      cursor: 'pointer',
    },
    headerName: {
      fontSize: 16,
      fontWeight: 700,
      color: '#FFFFFF',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    headerMeta: {
      fontSize: 12,
      color: '#A0A6C0',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      backgroundColor: '#00D68F',
    },
    infoBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: 'transparent',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#A0A6C0',
      transition: 'background-color 0.2s',
      flexShrink: 0,
    },
    messagesArea: {
      flex: 1,
      overflowY: 'auto',
      paddingTop: 8,
      paddingBottom: 8,
    },
    dateSeparator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 20px 8px',
    },
    dateSeparatorText: {
      fontSize: 12,
      fontWeight: 500,
      color: '#6B7194',
      backgroundColor: '#0F1336',
      padding: '4px 14px',
      borderRadius: 12,
      border: '1px solid #1E2448',
    },
    systemMessage: {
      textAlign: 'center',
      padding: '8px 20px',
    },
    systemText: {
      fontSize: 13,
      color: '#6B7194',
      fontStyle: 'italic',
    },
    messageRow: (isSelf) => ({
      display: 'flex',
      flexDirection: isSelf ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
      padding: '2px 20px',
      marginBottom: 2,
    }),
    messageRowWithSender: {
      marginTop: 12,
    },
    senderName: {
      fontSize: 12,
      fontWeight: 600,
      color: '#A0A6C0',
      marginBottom: 4,
      marginLeft: 48,
      padding: '0 20px',
    },
    messageBubble: (isSelf) => ({
      maxWidth: '75%',
      padding: '10px 14px',
      borderRadius: isSelf ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      background: isSelf
        ? 'linear-gradient(135deg, #0088FF, #0066CC)'
        : '#1A1F44',
      color: '#FFFFFF',
      fontSize: 15,
      lineHeight: 1.45,
      wordBreak: 'break-word',
    }),
    messageTime: (isSelf) => ({
      fontSize: 11,
      color: '#6B7194',
      margin: isSelf ? '4px 48px 0 0' : '4px 0 0 48px',
      padding: '0 20px',
      textAlign: isSelf ? 'right' : 'left',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isSelf ? 'flex-end' : 'flex-start',
      gap: 4,
    }),
    readReceipt: {
      color: '#0088FF',
    },
    inputArea: {
      borderTop: '1px solid #1E2448',
      backgroundColor: '#0F1336',
      padding: '12px 16px',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
    },
    attachmentMenu: {
      display: 'flex',
      gap: 12,
      padding: '0 4px 12px',
      overflowX: 'auto',
    },
    attachmentBtn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '10px 14px',
      borderRadius: 12,
      backgroundColor: '#1A1F44',
      border: 'none',
      cursor: 'pointer',
      color: '#A0A6C0',
      fontSize: 11,
      fontFamily: "'Inter', sans-serif",
      transition: 'background-color 0.2s',
      minWidth: 70,
    },
    inputRow: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
    },
    plusBtn: {
      width: 38,
      height: 38,
      borderRadius: '50%',
      backgroundColor: '#1A1F44',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#A0A6C0',
      flexShrink: 0,
      transition: 'all 0.2s',
    },
    inputContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      backgroundColor: '#1A1F44',
      borderRadius: 22,
      padding: '8px 12px',
      border: '1px solid #1E2448',
      transition: 'border-color 0.2s',
    },
    textInput: {
      flex: 1,
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      color: '#FFFFFF',
      fontSize: 15,
      fontFamily: "'Inter', sans-serif",
      lineHeight: 1.4,
      maxHeight: 100,
      resize: 'none',
      padding: 0,
    },
    emojiBtn: {
      background: 'none',
      border: 'none',
      color: '#6B7194',
      cursor: 'pointer',
      padding: 2,
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      transition: 'color 0.2s',
    },
    sendBtn: (hasText) => ({
      width: 38,
      height: 38,
      borderRadius: '50%',
      backgroundColor: hasText ? '#0088FF' : '#1A1F44',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: hasText ? 'pointer' : 'default',
      color: hasText ? '#FFFFFF' : '#6B7194',
      flexShrink: 0,
      transition: 'all 0.2s',
      transform: hasText ? 'scale(1)' : 'scale(0.9)',
    }),
    avatarPlaceholder: {
      width: 28,
      minWidth: 28,
      flexShrink: 0,
    },
    // Keyframe animation style tag
    keyframes: `
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-6px); opacity: 1; }
      }
    `,
  };

  return (
    <div style={styles.page}>
      {/* Inject keyframes */}
      <style>{styles.keyframes}</style>

      {/* Header */}
      <div style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() => navigate('/chat')}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A1F44')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ArrowLeft size={22} />
        </button>
        <Avatar
          src={roomInfo.avatar_url}
          name={roomInfo.name}
          size="md"
          showOnlineIndicator={roomInfo.type === 'direct'}
          isOnline={roomInfo.isOnline}
        />
        <div style={styles.headerInfo}>
          <h2 style={styles.headerName}>{roomInfo.name}</h2>
          <p style={styles.headerMeta}>
            {roomInfo.type === 'direct' ? (
              <>
                {roomInfo.isOnline && <span style={styles.onlineDot} />}
                {roomInfo.isOnline ? 'Online' : 'Last seen recently'}
              </>
            ) : (
              <>
                <Users size={12} />
                {roomInfo.member_count} members
              </>
            )}
          </p>
        </div>
        <button
          style={styles.infoBtn}
          onClick={() => {}}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A1F44')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Info size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={styles.messagesArea} ref={messagesContainerRef}>
        {messages.map((msg, index) => {
          const isSelf = msg.sender_id === DEMO_USER_ID;
          const showDate = shouldShowDateSeparator(messages, index);
          const showSender =
            msg.type !== 'system' && !isSelf && shouldShowSenderInfo(messages, index);

          // Check if the next message is from the same sender (to decide when to show timestamp)
          const nextMsg = messages[index + 1];
          const isLastInGroup =
            !nextMsg ||
            nextMsg.type === 'system' ||
            nextMsg.sender_id !== msg.sender_id ||
            shouldShowDateSeparator(messages, index + 1);

          return (
            <React.Fragment key={msg.id}>
              {/* Date separator */}
              {showDate && (
                <div style={styles.dateSeparator}>
                  <span style={styles.dateSeparatorText}>
                    {formatDateSeparator(msg.created_at)}
                  </span>
                </div>
              )}

              {/* System message */}
              {msg.type === 'system' ? (
                <div style={styles.systemMessage}>
                  <span style={styles.systemText}>{msg.content}</span>
                </div>
              ) : (
                <>
                  {/* Sender name */}
                  {showSender && (
                    <div style={styles.senderName}>{msg.sender.display_name}</div>
                  )}

                  {/* Message bubble */}
                  <div
                    style={{
                      ...styles.messageRow(isSelf),
                      ...(showSender ? styles.messageRowWithSender : {}),
                    }}
                  >
                    {!isSelf && showSender ? (
                      <Avatar
                        src={msg.sender.avatar_url}
                        name={msg.sender.display_name}
                        size="xs"
                      />
                    ) : !isSelf ? (
                      <div style={styles.avatarPlaceholder} />
                    ) : null}
                    <div style={styles.messageBubble(isSelf)}>{msg.content}</div>
                  </div>

                  {/* Timestamp + read receipt */}
                  {isLastInGroup && (
                    <div style={styles.messageTime(isSelf)}>
                      {formatMessageTime(msg.created_at)}
                      {isSelf && msg.read_by && msg.read_by.length > 0 && (
                        <CheckCheck size={14} style={styles.readReceipt} />
                      )}
                      {isSelf && (!msg.read_by || msg.read_by.length === 0) && (
                        <Check size={14} />
                      )}
                    </div>
                  )}
                </>
              )}
            </React.Fragment>
          );
        })}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={styles.inputArea}>
        {/* Attachment menu */}
        {showAttachments && (
          <div style={styles.attachmentMenu}>
            {[
              { icon: Image, label: 'Photo', color: '#7B61FF' },
              { icon: Camera, label: 'Camera', color: '#FF6B6B' },
              { icon: Paperclip, label: 'File', color: '#0088FF' },
              { icon: Mic, label: 'Audio', color: '#00D68F' },
            ].map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                style={styles.attachmentBtn}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222855')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1A1F44')}
              >
                <Icon size={20} color={color} />
                {label}
              </button>
            ))}
          </div>
        )}

        <div style={styles.inputRow}>
          <button
            style={{
              ...styles.plusBtn,
              transform: showAttachments ? 'rotate(45deg)' : 'rotate(0deg)',
              color: showAttachments ? '#0088FF' : '#A0A6C0',
            }}
            onClick={() => setShowAttachments(!showAttachments)}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222855')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1A1F44')}
          >
            <Plus size={20} />
          </button>

          <div style={styles.inputContainer}>
            <textarea
              ref={inputRef}
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
            />
            <button
              style={styles.emojiBtn}
              onClick={() => {}}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFB347')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7194')}
            >
              <Smile size={20} />
            </button>
          </div>

          <button
            style={styles.sendBtn(inputText.trim().length > 0)}
            onClick={handleSend}
            disabled={!inputText.trim()}
            onMouseEnter={(e) => {
              if (inputText.trim()) {
                e.currentTarget.style.backgroundColor = '#0077E6';
                e.currentTarget.style.transform = 'scale(1.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (inputText.trim()) {
                e.currentTarget.style.backgroundColor = '#0088FF';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;
