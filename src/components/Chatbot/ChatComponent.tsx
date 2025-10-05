import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChatContext } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatInput } from "./ChatInput";
import { MobileRecipePanel } from "@/components/Recipe/MobileRecipePanel";

// Helper function to format markdown content for better readability
function formatMarkdown(content: string): string {
  if (!content) return content;
  
  let formatted = content;
  
  // Remove standalone asterisks that are formatting artifacts
  formatted = formatted.replace(/^\*\*\s*$/gm, '');
  formatted = formatted.replace(/^\*\s*$/gm, '');
  
  // Add double newlines before key recipe sections
  formatted = formatted.replace(/(Recipe Title:)/gi, '## $1');
  formatted = formatted.replace(/(Ingredients List with Quantities:)/gi, '\n### $1\n');
  formatted = formatted.replace(/(Cooking Instructions:)/gi, '\n### $1\n');
  formatted = formatted.replace(/(Step[- ]by[- ]Step Cooking Instructions:)/gi, '\n### $1\n');
  formatted = formatted.replace(/(Nutritional Information[^:]*:)/gi, '\n### $1\n');
  formatted = formatted.replace(/(Estimated Cooking[^:]*Time:[^\n]*)/gi, '\n**$1**\n');
  formatted = formatted.replace(/(Serving Size:[^\n]*)/gi, '**$1**\n');
  
  // Fix nutritional info - replace asterisks between items with newlines
  formatted = formatted.replace(/(Calories:\d+)\*\s*/gi, '$1\n- ');
  formatted = formatted.replace(/(Protein:[^\*]+)\*\s*/gi, '$1\n- ');
  formatted = formatted.replace(/(Carbohydrates:[^\*]+)\*\s*/gi, '$1\n- ');
  formatted = formatted.replace(/(Fat:[^\*]+)\*\s*/gi, '$1\n- ');
  formatted = formatted.replace(/(Fiber:[^\*\n]+)/gi, '$1');
  
  // Format list items - handle asterisks that are at the start of lines
  formatted = formatted.replace(/^\*\s+([^\n]+)/gm, '- $1');
  
  // Format numbered lists
  formatted = formatted.replace(/^(\d+)\.\s+/gm, '$1. ');
  
  // Add newline after closing parentheses in ingredient lists
  formatted = formatted.replace(/\)([A-Z])/g, ')\n$1');
  
  // Add newlines before capital letters that follow lowercase (new sentences)
  formatted = formatted.replace(/([a-z\)])([A-Z][a-z])/g, '$1\n\n$2');
  
  // Clean up multiple newlines (max 2)
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // Remove empty bullet points
  formatted = formatted.replace(/^[-*]\s*$/gm, '');
  
  // Trim leading/trailing whitespace
  formatted = formatted.trim();
  
  return formatted;
}

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
                <ReactMarkdown 
                  className="markdown text-sm break-words"
                  remarkPlugins={[remarkGfm]}
                >
                  {formatMarkdown(entry.content)}
                </ReactMarkdown>
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
                    <ReactMarkdown 
                      className="markdown text-sm break-words"
                      remarkPlugins={[remarkGfm]}
                    >
                      {formatMarkdown(responseStream)}
                    </ReactMarkdown>
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
