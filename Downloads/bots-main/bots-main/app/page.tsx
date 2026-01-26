'use client';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Fragment, useMemo, useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { models } from '@/lib/models';

import { SettingsIcon } from 'lucide-react';
import { CompleteModelSelector } from '@/components/ai-elements/model-selector';
// RenderStation composes the preview, code block and file tree.
import RenderStation from '@/components/Render Station/render-station';
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from '@/components/ai-elements/confirmation';
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought';
import { Checkpoint } from '@/components/ai-elements/checkpoint';
import {
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextContentBody,
  ContextContentFooter,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
} from '@/components/ai-elements/context';
import { Image } from '@/components/ai-elements/image';
import { InlineCitation } from '@/components/ai-elements/inline-citation';
import {
  OpenIn,
  OpenInTrigger,
  OpenInContent,
  OpenInLabel,
  OpenInChatGPT,
  OpenInClaude,
  OpenInSeparator,
  OpenInScira,
  OpenInv0,
  OpenInCursor,
} from '@/components/ai-elements/open-in-chat';
import { Plan } from '@/components/ai-elements/plan';
import { Queue } from '@/components/ai-elements/queue';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { Suggestion } from '@/components/ai-elements/suggestion';
import { Task } from '@/components/ai-elements/task';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Toggle } from '@/components/ui/toggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { useTheme } from 'next-themes';
import { ConsoleLogs, Logger } from '@/components/console-logs';
import { TavilyModal } from '@/components/tavily-modal';
import { copyToClipboard } from '@/lib/clipboard';
import { ModeToggle } from '@/components/mode-toggle';

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [consoleVisible, setConsoleVisible] = useState(false);
  const [tavilyModalOpen, setTavilyModalOpen] = useState(false);
  const { messages, sendMessage, status, regenerate, addToolResult } = useChat();
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const isThemeReady = Boolean(resolvedTheme);

  const { files, fileMap, selectedPath } = useMemo(() => {

    const lastAssistant = [...messages]
      .reverse()
      .find((message) => message.role === 'assistant');

    if (!lastAssistant) {
      return { files: [], fileMap: {}, selectedPath: null } as {
        files: { path: string }[];
        fileMap: Record<string, { code: string; language?: string }>;
        selectedPath: string | null;
      };
    }

    const combinedText = lastAssistant.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('\n');

    if (!combinedText) {
      return { files: [], fileMap: {}, selectedPath: null } as {
        files: { path: string }[];
        fileMap: Record<string, { code: string; language?: string }>;
        selectedPath: string | null;
      };
    }

    const blockRegex = /```(\w+)?(?:\s+filename=([^\n]+))?\n([\s\S]*?)```/g;
    const matches = [...combinedText.matchAll(blockRegex)];
    if (matches.length === 0) {
      return { files: [], fileMap: {}, selectedPath: null } as {
        files: { path: string }[];
        fileMap: Record<string, { code: string; language?: string }>;
        selectedPath: string | null;
      };
    }

    const fileMap: Record<string, { code: string; language?: string }> = {};
    const files: { path: string }[] = [];

    matches.forEach((match, index) => {
      const rawLanguage = (match[1] ?? '').toLowerCase();
      const filename = match[2]?.trim();
      const code = match[3]?.trim() ?? '';
      if (!code) return;

      const extension = filename?.split('.').pop()?.toLowerCase();
      const language = rawLanguage || extension;
      const path = filename || `snippet-${index + 1}`;

      fileMap[path] = { code, language };
      files.push({ path });
    });

    const selectedPath =
      selectedFile && fileMap[selectedFile]
        ? selectedFile
        : files.at(0)?.path ?? null;

    return { files, fileMap, selectedPath };
  }, [messages, selectedFile]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      Logger.warn('Submit attempted with empty message');
      return;
    }

    Logger.info('Message sent', {
      hasText,
      textLength: message.text?.length || 0,
      attachmentCount: message.files?.length || 0,
      model,
      webSearchEnabled: webSearch
    });

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files,
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      },
    );
    setInput('');
  };

  const handleTavilySubmit = async (tool: string, params: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/tavily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, params }),
      });
      const data = await res.json();
      if (data?.toolResult && typeof addToolResult === 'function') {
        addToolResult(data.toolResult);
      }
      if (data?.error) Logger.error('Tavily API error', { error: data.error });
    } catch (err) {
      Logger.error('Tavily handler error', { err });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Chat</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>AI Assistant</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-4">
          <ModeToggle />
          <Context usedTokens={1500} maxTokens={8000}>
            <ContextTrigger />
            <ContextContent>
              <ContextContentHeader />
              <ContextContentBody>
                <ContextInputUsage />
                <ContextOutputUsage />
                <ContextReasoningUsage />
              </ContextContentBody>
              <ContextContentFooter />
            </ContextContent>
          </Context>
        </div>
      </header>
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={consoleVisible ? 70 : 100}>
          <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            <ResizablePanel defaultSize={50}>
              <div className="flex flex-col h-full relative px-2 sm:px-4">
                <div className="flex-1 overflow-hidden min-h-0">
                  <Conversation className="h-full">
                    <ConversationContent className="px-1 sm:px-2">
                      {messages.map((message) => (
                        <div key={message.id}>
                          {message.role === 'assistant' &&
                            message.parts.filter((part) => part.type === 'source-url')
                              .length > 0 && (
                              <Sources>
                                <SourcesTrigger
                                  count={
                                    message.parts.filter(
                                      (part) => part.type === 'source-url',
                                    ).length
                                  }
                                />
                                {message.parts
                                  .filter((part) => part.type === 'source-url')
                                  .map((part, i) => (
                                    <SourcesContent key={`${message.id}-${i}`}>
                                      <Source
                                        key={`${message.id}-${i}`}
                                        href={part.url}
                                        title={part.url}
                                        className="break-all"
                                      />
                                    </SourcesContent>
                                  ))}
                              </Sources>
                            )}
                          {message.parts.map((part, i) => {
                            switch (part.type) {
                              case 'text':
                                return (
                                  <Message key={`${message.id}-${i}`} from={message.role}>
                                    <MessageContent>
                                      <MessageResponse>{part.text}</MessageResponse>
                                    </MessageContent>
                                    {message.role === 'assistant' && (
                                        <MessageActions>
                                          <MessageAction
                                            onClick={() => regenerate()}
                                            label="Retry"
                                          >
                                            <RefreshCcwIcon
                                              className="size-3"
                                              aria-hidden="true"
                                            />
                                          </MessageAction>
                                          <MessageAction
                                            onClick={() =>
                                              copyToClipboard(part.text)
                                            }
                                            label="Copy"
                                          >
                                            <CopyIcon
                                              className="size-3"
                                              aria-hidden="true"
                                            />
                                          </MessageAction>
                                          <OpenIn query={part.text}>
                                            <OpenInTrigger />
                                            <OpenInContent>
                                              <OpenInLabel>Share this response</OpenInLabel>
                                              <OpenInChatGPT />
                                              <OpenInClaude />
                                              <OpenInSeparator />
                                              <OpenInScira />
                                              <OpenInv0 />
                                              <OpenInCursor />
                                            </OpenInContent>
                                          </OpenIn>
                                        </MessageActions>
                                      )}
                                  </Message>
                                );
                              case 'reasoning':
                                return (
                                  <ChainOfThought key={`${message.id}-${i}`}>
                                    <ChainOfThoughtHeader>
                                      Chain of Thought
                                    </ChainOfThoughtHeader>
                                    <ChainOfThoughtContent>
                                      <ChainOfThoughtStep label="Reasoning Process">
                                        {part.text}
                                      </ChainOfThoughtStep>
                                    </ChainOfThoughtContent>
                                  </ChainOfThought>
                                );
                              case 'tool-call':
                                return (
                                  <Tool key={`${message.id}-${i}`}>
                                    <ToolHeader
                                      title={part.title || 'Tool Call'}
                                      type="tool-call"
                                      state="output-available"
                                    />
                                    <ToolContent>
                                      <ToolInput input={part.input} />
                                    </ToolContent>
                                  </Tool>
                                );
                              case 'tool-result':
                                return (
                                  <Tool key={`${message.id}-${i}`}>
                                    <ToolHeader
                                      title={part.title || 'Tool Result'}
                                      type="tool-result"
                                      state="output-available"
                                    />
                                    <ToolContent>
                                      <ToolOutput
                                        output={part.output}
                                        errorText={part.errorText}
                                      />
                                    </ToolContent>
                                  </Tool>
                                );
                              default:
                                return null;
                            }
                          })}
                        </div>
                      ))}
                      {status === 'submitted' && <Shimmer>Loading response…</Shimmer>}
                    </ConversationContent>
                    <ConversationScrollButton />
                  </Conversation>
                </div>

                <div className="flex-shrink-0 border-t bg-background m-4">
                  <PromptInput
                    onSubmit={handleSubmit}
                    globalDrop
                    multiple
                  >
                    <PromptInputHeader>
                      <PromptInputAttachments>
                        {(attachment) => <PromptInputAttachment data={attachment} />}
                      </PromptInputAttachments>
                    </PromptInputHeader>
                    <PromptInputBody>
                      <PromptInputTextarea
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        autoComplete="off"
                        spellCheck={false}
                        aria-label="Type your message here"
                      />
                    </PromptInputBody>
                    <PromptInputFooter>
                      <PromptInputTools>
                        <PromptInputButton
                          variant="ghost"
                          onClick={() => setTavilyModalOpen(true)}
                          aria-label="Open Tavily search tools"
                        >
                          <GlobeIcon size={16} aria-hidden="true" />
                          <span>Tavily</span>
                        </PromptInputButton>
                        <CompleteModelSelector
                          models={models}
                          selectedModel={model}
                          onModelSelect={setModel}
                          placeholder="Select a model..."
                        />
                        <Toggle
                          pressed={consoleVisible}
                          onPressedChange={setConsoleVisible}
                          aria-label="Toggle console panel"
                        >
                          Console
                        </Toggle>
                      </PromptInputTools>
                      <PromptInputSubmit disabled={!input && !status} status={status} />
                    </PromptInputFooter>
                  </PromptInput>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        {consoleVisible && <ResizableHandle withHandle className="h-8" />}
        {consoleVisible && (
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full bg-muted/50 border-t p-4">
              <ConsoleLogs
                model={model}
                messages={messages}
                status={status}
                webSearch={webSearch}
                isVisible={consoleVisible}
              />
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

      <TavilyModal
        open={tavilyModalOpen}
        onOpenChange={setTavilyModalOpen}
        onSubmit={handleTavilySubmit}
      />
    </div>
  );
};
export default ChatBot;
