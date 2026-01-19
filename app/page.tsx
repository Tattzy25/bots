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
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
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
import { Fragment, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { models } from '@/lib/models';
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector';
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactActions,
  ArtifactAction,
  ArtifactContent,
} from '@/components/ai-elements/artifact';
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block';
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from '@/components/ai-elements/web-preview';
import { Separator } from '@/components/ui/separator';
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

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [artifactView, setArtifactView] = useState<'preview' | 'code'>('preview');
  const { messages, sendMessage, status, regenerate } = useChat();
  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    sendMessage(
      { 
        text: message.text || 'Sent with attachments',
        files: message.files 
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
  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1 h-screen">
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
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
            </header>
            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
              <ResizablePanel defaultSize={50}>
                <div className="flex flex-col h-full">
          <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === 'source-url',
                        ).length
                      }
                    />
                    {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
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
                            <MessageResponse>
                              {part.text}
                            </MessageResponse>
                          </MessageContent>
                          {message.role === 'assistant' && i === messages.length - 1 && (
                            <MessageActions>
                <MessageAction
                  onClick={() => regenerate()}
                  label="Retry"
                >
                  <RefreshCcwIcon className="size-3" aria-hidden="true" />
                </MessageAction>
                <MessageAction
                  onClick={() =>
                    navigator.clipboard.writeText(part.text)
                  }
                  label="Copy"
                >
                  <CopyIcon className="size-3" aria-hidden="true" />
                </MessageAction>
                            </MessageActions>
                          )}
                        </Message>
                      );
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === 'submitted' && <Loader aria-label="Loading response…" />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

          <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
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
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputButton
                  variant={webSearch ? 'default' : 'ghost'}
                  onClick={() => setWebSearch(!webSearch)}
                  aria-label={webSearch ? 'Disable web search' : 'Enable web search'}
                  aria-pressed={webSearch}
                >
                  <GlobeIcon size={16} aria-hidden="true" />
                  <span>Search</span>
                </PromptInputButton>
                <ModelSelector>
                  <ModelSelectorTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start">
                      {models.find(m => m.value === model)?.name || 'Select Model'}
                    </Button>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      {models.map((modelItem) => (
                        <ModelSelectorItem
                          key={modelItem.value}
                          onSelect={() => setModel(modelItem.value)}
                          className="flex items-center gap-2"
                        >
                          <ModelSelectorLogoGroup>
                            {modelItem.providers.slice(0, 3).map((provider) => (
                              <ModelSelectorLogo key={provider} provider={provider as "openai" | "anthropic" | "google" | "xai" | "mistral" | "deepseek" | "meta" | "vercel"} />
                            ))}
                          </ModelSelectorLogoGroup>
                          <ModelSelectorName>{modelItem.name}</ModelSelectorName>
                        </ModelSelectorItem>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
        </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                  <div className="h-full flex flex-col">
                    <Artifact className="flex-1 m-4">
                      <ArtifactHeader>
                        <ArtifactTitle>Generated Webpage</ArtifactTitle>
                        <ArtifactActions>
                          <Button
                            variant={artifactView === 'preview' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setArtifactView('preview')}
                          >
                            Preview
                          </Button>
                          <Button
                            variant={artifactView === 'code' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setArtifactView('code')}
                          >
                            Code
                          </Button>
                          <ArtifactAction tooltip="Download HTML" icon={CopyIcon} />
                        </ArtifactActions>
                      </ArtifactHeader>
                      <ArtifactContent className="h-full">
                        {artifactView === 'preview' ? (
                          <WebPreview className="h-full">
                            <WebPreviewNavigation>
                              <WebPreviewUrl />
                            </WebPreviewNavigation>
                            <WebPreviewBody className="flex-1" />
                          </WebPreview>
                        ) : (
                          <CodeBlock
                            code=""
                            language="html"
                          >
                            <CodeBlockCopyButton />
                          </CodeBlock>
                        )}
                      </ArtifactContent>
                    </Artifact>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </SidebarInset>
          </div>
        </SidebarProvider>
    );
  };
export default ChatBot;
