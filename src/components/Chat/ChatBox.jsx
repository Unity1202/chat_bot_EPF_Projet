import Message from "./Message";

export default function ChatBox({ messages, isLoading }) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((msg) => (
        <Message key={msg.id} text={msg.text} sender={msg.sender} sources={msg.sources} />
      ))}
      
      {isLoading && (
        <div className="flex justify-start mb-2">
          <div className="p-3 rounded-lg bg-background text-flex-1">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}