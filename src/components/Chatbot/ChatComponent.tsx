import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChatContext } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { ChatInput } from "./ChatInput";
import { MobileRecipePanel } from "@/components/Recipe/MobileRecipePanel";
import { TTSButton } from "@/components/common/TTSButton";
import MDEditor from '@uiw/react-md-editor';

// Markdown cleaning function
function cleanLLMMarkdown(raw: string) {
  let text = raw;

  // Ensure bold headings (e.g., **Heading:**) are always surrounded by blank lines, even if consecutive
  text = text.replace(/\*\*([^\*]+?:)\*\*/g, '\n\n**$1**\n\n');

  // Add blank line after markdown tables so following text is not included in the table
  // Find lines that start with '|' and are followed by a line that does not start with '|', and insert a blank line
  text = text.replace(/((?:^|\n)(?:\|.+\|\n)+)([^\|\n])/gm, '$1\n$2');

  // Split + into new lines for ingredients
  text = text.replace(/\+ ?/g, "\n- ");

  // Ensure numbered steps have line breaks
  text = text.replace(/(\d\.)/g, "\n$1 ");

  // Add line breaks before markdown tables (lines starting with |)
  text = text.replace(/(\n)?(\|.+\|)/g, "\n$2");

  // Add line breaks before headings (###, ##, #)
  text = text.replace(/(#+ )/g, "\n$1");

  // Remove duplicate empty lines
  text = text.replace(/\n{3,}/g, "\n\n");

  // Trim leading/trailing spaces
  return text.trim();
}

// Component to render cleaned markdown
const MarkdownRenderer = ({ content }: { content: string }) => {
  const cleanedContent = cleanLLMMarkdown(content);
  
  return (
    <div className="markdown-content">
      <MDEditor.Markdown 
        source={cleanedContent}
        style={{ 
          backgroundColor: 'transparent',
          color: 'inherit'
        }}
        data-color-mode="auto"
      />
    </div>
  );
};

export const ChatComponent = () => {
  const {
    prompt,
    setPrompt,
    handleAskPrompt,
    handleKeyDown,
    userPromptPlaceholder,
    responseStream,
    responseStreamLoading,
    conversationHistory,
    messagesEndRef,
  }: any = useChatContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory, responseStream, userPromptPlaceholder]);

  const messagesStartRef = useRef<HTMLDivElement>(null);
  const scrollToTop = () => {
    messagesStartRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative bg-background flex flex-col h-full">
      <MobileRecipePanel />
      <div className="overflow-y-auto flex-1">
        <div ref={messagesStartRef} className="max-w-5xl mx-auto p-4 space-y-4">
          {!conversationHistory.length && !responseStreamLoading && (
            <ChatbotWelcome />
          )}
          {conversationHistory.map((entry: any, index: any) => (
            <div key={index} className="mb-4">
              <Card
                className={cn(
                  "max-w-[80%] w-fit",
                  entry.role === "user"
                    ? "ml-auto bg-primary/10"
                    : "mr-auto border-none shadow-none"
                )}
              >
                <CardContent className="p-4">
                  {entry.role === "user" ? (
                    <div className="text-sm break-words whitespace-pre-wrap">
                      {entry.content}
                    </div>
                  ) : (
                    <>
                      <div className="text-sm">
                        <MarkdownRenderer content={entry.content} />
                      </div>
                      {/* Raw/plain text version for debugging */}
                      <div className="text-xs mt-2 p-2 bg-muted/50 rounded border border-dashed border-border text-muted-foreground font-mono whitespace-pre-wrap">
                        {entry.content}
                      </div>
                    </>
                  )}
                  {entry.role === "assistant" && (
                    <div className="mt-3 flex justify-start">
                      <TTSButton 
                        text={entry.content} 
                        messageId={`message-${index}`}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}

          {responseStreamLoading && (
            <>
              <div className="mb-4">
                <Card className="ml-auto max-w-[80%] bg-primary/10 w-fit">
                  <CardContent className="p-4">
                    <div className="text-sm break-words whitespace-pre-wrap">
                      {userPromptPlaceholder}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-start space-x-4 mb-4">
                <div className="pt-4 flex-shrink-0">
                  <Loader2 className="size-5 animate-spin" />
                </div>
                <Card className="max-w-[80%] border-none shadow-none w-fit">
                  <CardContent className="p-4">
                    <div className="text-sm">
                      <MarkdownRenderer content={responseStream} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Always render ChatInput at the bottom */}
      <div className="z-50 shrink-0 bg-gradient-to-t from-background via-background to-background/0">
        <div className="max-w-5xl mx-auto p-4">
          <ChatInput />
        </div>
      </div>

      <Button
        className="absolute bottom-0 right-0 m-2 text-foreground"
        onClick={scrollToTop}
        size={"icon"}
        variant={"outline"}
      >
        <ArrowUp className="size-4" />
      </Button>
    </div>
  );
};

export const ChatbotWelcome = () => {
  return (
    <div className="absolute left-0 right-0 top-0 bottom-32 flex items-center justify-center">
      <div className="text-center flex flex-col gap-6 px-8">
        <h1 className="text-4xl md:text-5xl font-bold break-words whitespace-pre-wrap text-foreground">
          AI Recipe Assistant
        </h1>
        <p className="max-w-[600px] mx-auto text-center text-lg md:text-xl break-words whitespace-pre-wrap text-muted-foreground leading-relaxed">
          Your intelligent culinary companion for creating delicious recipes with whatever ingredients you have on hand. 
          Get personalized recipes with nutritional information, all powered by local AI models.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="bg-muted/50 px-3 py-1 rounded-full">🥗 Custom Recipes</span>
          <span className="bg-muted/50 px-3 py-1 rounded-full">📊 Nutrition Info</span>
          <span className="bg-muted/50 px-3 py-1 rounded-full">🥬 Dietary Options</span>
          <span className="bg-muted/50 px-3 py-1 rounded-full">👨‍🍳 Cooking Tips</span>
        </div>
        <p className="text-lg font-semibold break-words whitespace-pre-wrap text-primary">
          Add ingredients below and let's cook something amazing!
        </p>
      </div>
    </div>
  );
};
