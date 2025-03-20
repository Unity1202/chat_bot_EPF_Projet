export default function Message({ text, sender }) {
    const isUser = sender === "user";
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
        <div className={`p-3 rounded-lg ${isUser ? "bg-background text-flex-1" : "bg-background text-flex-1"}`}>
          {text}
        </div>
      </div>
    );
}
