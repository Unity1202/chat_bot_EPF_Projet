export default function Message({ text, sender, file }) {
    const isUser = sender === "user";

    const renderFilePreview = () => {
        if (!file) return null;

        const fileType = file.type.split('/')[0];

        switch (fileType) {
            case 'image':
                return (
                    <div className="mb-2">
                        <img 
                            src={URL.createObjectURL(file)} 
                            alt="Preview" 
                            className="max-w-xs rounded-lg"
                        />
                    </div>
                );
            case 'application':
            case 'text':
                return (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded-lg">
                        <span className="text-2xl">📄</span>
                        <span className="text-sm overflow-hidden text-ellipsis">
                            {file.name}
                        </span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📎</span>
                        <span className="text-sm">{file.name}</span>
                    </div>
                );
        }
    };

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
            <div className={`p-3 rounded-lg max-w-[70%] ${
                isUser ? "bg-[#F0F0F0] text-flex-1" : "bg-background text-flex-1"
            }`}>
                {file && renderFilePreview()}
                {text}
            </div>
        </div>
    );
}
