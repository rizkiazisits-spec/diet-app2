export default function ChatBubble({ role, children }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary-container text-white rounded-br-md'
            : 'glass-card rounded-bl-md'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
