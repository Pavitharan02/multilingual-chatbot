import { ThemeProvider } from "@/contexts/ThemeContext";
import { useChatContext, ChatProvider } from "@/contexts/ChatContext";
import { FileUploadProvider } from "@/contexts/FileUploadContext";
import { TTSProvider } from "@/contexts/TTSContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FileUploadProvider>
        <ChatProvider>
          <TTSProvider>
            {children}
          </TTSProvider>
        </ChatProvider>
      </FileUploadProvider>
    </ThemeProvider>
  );
}
