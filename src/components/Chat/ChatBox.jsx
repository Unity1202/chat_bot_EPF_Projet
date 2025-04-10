import Message from "./Message";

export default function ChatBox({ messages }) {
    return (
        <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg) => (
                <Message 
                    key={msg.id} 
                    text={msg.text} 
                    sender={msg.sender} 
                    file={msg.file}
                />
            ))}
        </div>
    );
}