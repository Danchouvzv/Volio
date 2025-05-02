'use client';

import React, { useState, useRef } from 'react'; // Added useRef
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MessageSquare, Users, Calendar, Send, Paperclip, Mic, Smile, ThumbsUp, Reply, X } from 'lucide-react'; // Added Mic, Smile, ThumbsUp, Reply
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // For Emoji picker

// Placeholder data - replace with actual data fetching via React Query
const chats = [
  { id: 'event1', type: 'event', name: 'Community Cleanup Drive', lastMessage: 'See you all Saturday!', timestamp: '10:30 AM', unread: 2, icon: Calendar, members: ['user1', 'user2', 'friend1'] },
  { id: 'friend1', type: 'direct', name: 'Alice Smith', lastMessage: 'Sounds good!', timestamp: 'Yesterday', unread: 0, avatar: 'https://picsum.photos/seed/alice/40/40', members: ['user1', 'friend1'] },
  { id: 'group1', type: 'group', name: 'Organizing Committee', lastMessage: 'Meeting at 5 PM today.', timestamp: '9:15 AM', unread: 1, icon: Users, members: ['user1', 'user3', 'user4'] },
  { id: 'friend2', type: 'direct', name: 'Bob Johnson', lastMessage: 'Okay, thanks!', timestamp: 'Monday', unread: 0, avatar: 'https://picsum.photos/seed/bob/40/40', members: ['user1', 'friend2'] },
];

const messages = {
  event1: [ { id: 'm1', sender: 'Organizer', text: 'Remember to bring gloves!', timestamp: '10:00 AM', reactions: { '👍': ['user2'] } }, { id: 'm2', sender: 'You', text: 'See you all Saturday!', timestamp: '10:30 AM', seenBy: ['user2', 'friend1'] } ],
  friend1: [ { id: 'm3', sender: 'Alice Smith', text: 'Hey! Are you going to the event?', timestamp: 'Yesterday' }, { id: 'm4', sender: 'You', text: 'Sounds good!', timestamp: 'Yesterday' } ],
  group1: [ { id: 'm5', sender: 'Charlie', text: 'Meeting at 5 PM today.', timestamp: '9:15 AM' } ],
  friend2: [ { id: 'm6', sender: 'You', text: 'Can you send the file?', timestamp: 'Monday'}, { id: 'm7', sender: 'Bob Johnson', text: 'Okay, thanks!', timestamp: 'Monday', seenBy: ['user1']}],
};

// --- Chat Message Component ---
const ChatMessageItem = ({ msg, onReply, onReact }: { msg: any, onReply: (msgId: string) => void, onReact: (msgId: string, emoji: string) => void }) => {
    const isYou = msg.sender === 'You';
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log("Uploading file:", file.name);
            // TODO: Implement actual file upload logic
        }
    };

    return (
        <motion.div
            key={msg.id}
            className={cn(
                "flex group items-end gap-2", // Added group for hover effects
                isYou ? 'justify-end' : 'justify-start'
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Message Actions (Hover) - appear left for received, right for sent */}
            {!isYou && (
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    <TooltipProvider>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onReply(msg.id)}><Reply className="h-3 w-3"/></Button></TooltipTrigger><TooltipContent><p>Reply</p></TooltipContent></Tooltip>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><Smile className="h-3 w-3"/></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-1">
                                {/* Placeholder Emoji Picker */}
                                <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onReact(msg.id, '👍')}><ThumbsUp className="h-4 w-4"/></Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onReact(msg.id, '❤️')}>❤️</Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onReact(msg.id, '😂')}>😂</Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onReact(msg.id, '😮')}>😮</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </TooltipProvider>
                </div>
            )}
            {/* Message Bubble */}
            <div className={cn(
                 "max-w-xs lg:max-w-md p-3 rounded-lg shadow-sm relative", // Added relative for reactions
                 isYou ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card neumorphism-inset rounded-bl-none'
            )}>
                {!isYou && <p className="text-xs font-semibold mb-1">{msg.sender}</p>}
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                 {/* Timestamp and Read Receipt */}
                 <div className="flex justify-end items-center mt-1">
                     <p className="text-xs opacity-70 mr-1">{msg.timestamp}</p>
                      {isYou && msg.seenBy && (
                          <TooltipProvider>
                              <Tooltip>
                                  <TooltipTrigger><Users className="h-3 w-3 text-blue-300" /></TooltipTrigger>
                                  <TooltipContent><p>Seen by {msg.seenBy.length} people</p></TooltipContent>
                              </Tooltip>
                          </TooltipProvider>
                      )}
                       {isYou && !msg.seenBy && <Users className="h-3 w-3 opacity-50" /> /* Placeholder for sent */}
                 </div>
                  {/* Reactions */}
                   {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                     <div className="absolute -bottom-3 right-2 flex gap-1 bg-card border rounded-full px-1.5 py-0.5 shadow-sm">
                       {Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => (
                         <span key={emoji} className="text-xs cursor-default" title={`${users.length} reaction${users.length > 1 ? 's' : ''}`}>
                             {emoji} <span className="text-muted-foreground">{users.length > 1 ? users.length : ''}</span>
                         </span>
                       ))}
                     </div>
                   )}
            </div>
            {/* Message Actions (Hover) - appear right for sent */}
            {isYou && (
                 <div className="flex opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                     <TooltipProvider>
                         <Popover>
                             <PopoverTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-6 w-6"><Smile className="h-3 w-3"/></Button>
                             </PopoverTrigger>
                             <PopoverContent className="w-auto p-1">
                                 <div className="flex gap-1">
                                     <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onReact(msg.id, '👍')}><ThumbsUp className="h-4 w-4"/></Button>
                                     {/* Add other emojis */}
                                 </div>
                             </PopoverContent>
                         </Popover>
                         <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onReply(msg.id)}><Reply className="h-3 w-3"/></Button></TooltipTrigger><TooltipContent><p>Reply</p></TooltipContent></Tooltip>
                     </TooltipProvider>
                 </div>
            )}
             {/* Hidden file input */}
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
         </motion.div>
     );
 };

export default function ChatPage() {
  const { user, loading } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chats[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // State for replying message ID
  const [isRecording, setIsRecording] = useState(false); // State for voice recording
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for scroll area
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input button

  const isLoading = loading; // Combine with React Query loading states

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const currentMessages = selectedChatId ? (messages as any)[selectedChatId] || [] : [];

    // Scroll to bottom when messages change or chat is selected
    React.useEffect(() => {
        if (scrollAreaRef.current) {
            // Find the viewport element within the ScrollArea
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if(viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [currentMessages, selectedChatId]);


   const handleSendMessage = () => {
       if (!newMessage.trim() || !selectedChatId) return;
       console.log(`Sending message to ${selectedChatId}: ${newMessage}` + (replyingTo ? ` (replying to ${replyingTo})` : ''));
       // TODO: Implement actual message sending logic using useMutation
       (messages as any)[selectedChatId]?.push({
            id: `m${Date.now()}`, // temp id
            sender: 'You',
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            replyTo: replyingTo, // Add replyTo field if present
       });
       setNewMessage('');
       setReplyingTo(null); // Clear reply state
   };

   const handleReply = (msgId: string) => {
       setReplyingTo(msgId);
       // Optionally focus the input field here
   };

    const handleReact = (msgId: string, emoji: string) => {
        console.log(`Reacting to ${msgId} with ${emoji}`);
        // TODO: Implement actual reaction logic (update message in DB/state)
         const chatMessages = (messages as any)[selectedChatId!];
         const msgIndex = chatMessages.findIndex((m:any) => m.id === msgId);
         if(msgIndex > -1) {
             const msg = chatMessages[msgIndex];
             if (!msg.reactions) msg.reactions = {};
             if (!msg.reactions[emoji]) msg.reactions[emoji] = [];
             // Simple toggle for demo: add/remove 'You' user ID
             if(msg.reactions[emoji].includes('user1')) { // Assuming 'user1' is current user
                 msg.reactions[emoji] = msg.reactions[emoji].filter((uid: string) => uid !== 'user1');
                  if(msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
             } else {
                 msg.reactions[emoji].push('user1');
             }
             // Force re-render (in real app, state update would handle this)
              setSelectedChatId(selectedChatId); // Hacky way to trigger re-render
         }
    };

   const handleRecordVoice = () => {
       setIsRecording(!isRecording);
       console.log(isRecording ? "Stopping recording" : "Starting recording");
       // TODO: Implement actual voice recording logic (MediaRecorder API)
   };

    const handleAttachFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log("Uploading file:", file.name);
            // TODO: Implement actual file upload logic
            // In a real app, this would upload to Firebase Storage
            // and add a message with the file URL
        }
    };

  if (isLoading) {
      return (
         <div className="h-screen flex border rounded-lg overflow-hidden m-4">
             <div className="w-1/3 lg:w-1/4 border-r p-4 space-y-4">
                 <Skeleton className="h-10 w-full mb-4" />
                 <Skeleton className="h-16 w-full rounded-lg" />
                 <Skeleton className="h-16 w-full rounded-lg" />
                 <Skeleton className="h-16 w-full rounded-lg" />
             </div>
             <div className="flex-1 flex flex-col">
                 <Skeleton className="h-16 border-b p-4" />
                 <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      <Skeleton className="h-10 w-3/4 self-end rounded-lg" />
                      <Skeleton className="h-10 w-3/4 self-start rounded-lg" />
                      <Skeleton className="h-12 w-1/2 self-end rounded-lg" />
                 </div>
                 <Skeleton className="h-20 border-t p-4" /> {/* Increased height for potential reply bar */}
             </div>
         </div>
      );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please log in to view your chats.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

   const filteredChats = chats.filter(chat =>
       chat.name.toLowerCase().includes(searchTerm.toLowerCase())
   );

  return (
    <div className="flex h-[calc(100vh-var(--header-height,56px))] border-t">
      <aside className="w-full md:w-1/3 lg:w-1/4 border-r flex flex-col bg-card">
        <div className="p-4 border-b">
           <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                   type="search"
                   placeholder="Search chats..."
                   className="pl-10"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
               />
           </div>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {filteredChats.length === 0 && <p className="text-sm text-muted-foreground text-center p-4">No chats found.</p>}
            {filteredChats.map(chat => (
              <motion.button
                key={chat.id}
                className={cn(
                  "flex items-center w-full p-3 rounded-md text-left hover:bg-accent transition-colors",
                  selectedChatId === chat.id ? "bg-accent text-accent-foreground" : ""
                )}
                onClick={() => setSelectedChatId(chat.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="h-9 w-9 mr-3">
                   {chat.avatar ? <AvatarImage src={chat.avatar} data-ai-hint="person avatar"/> : chat.icon ? React.createElement(chat.icon, { className: "h-5 w-5 text-muted-foreground" }) : <MessageSquare className="h-5 w-5 text-muted-foreground" />}
                  <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{chat.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                 <div className="text-right ml-2">
                     <p className="text-xs text-muted-foreground mb-1">{chat.timestamp}</p>
                     {chat.unread > 0 && <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">{chat.unread}</span>}
                 </div>
              </motion.button>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col bg-background">
        {selectedChat ? (
          <>
            <header className="flex items-center p-4 border-b h-16">
              <Avatar className="h-9 w-9 mr-3">
                 {selectedChat.avatar ? <AvatarImage src={selectedChat.avatar} data-ai-hint="person avatar"/> : selectedChat.icon ? React.createElement(selectedChat.icon, { className: "h-5 w-5 text-muted-foreground" }) : <MessageSquare className="h-5 w-5 text-muted-foreground" />}
                <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-lg">{selectedChat.name}</h2>
              {/* TODO: Add more actions like view members, leave group etc. */}
            </header>

            <ScrollArea className="flex-1 p-4 bg-muted/20" ref={scrollAreaRef}>
                <div className="space-y-6 pb-4"> {/* Add padding bottom */}
                    {currentMessages.map((msg: any) => (
                        <ChatMessageItem key={msg.id} msg={msg} onReply={handleReply} onReact={handleReact}/>
                    ))}
                 </div>
             </ScrollArea>

            <footer className="p-4 border-t bg-background">
                {/* Reply Preview Bar */}
                {replyingTo && (
                    <div className="mb-2 p-2 border-l-4 border-primary bg-muted/50 rounded flex justify-between items-center">
                        <div>
                            <p className="text-xs font-medium text-primary">Replying to message...</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                                {/* Placeholder: Fetch original message text */}
                                "{messages[selectedChatId as keyof typeof messages]?.find(m => m.id === replyingTo)?.text || 'Original message...'}"
                            </p>
                         </div>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                              <X className="h-4 w-4"/>
                         </Button>
                    </div>
                )}
               <div className="flex items-center gap-2">
                  <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleAttachFile}>
                                <Paperclip className="h-5 w-5" />
                                <span className="sr-only">Attach file</span>
                            </Button>
                         </TooltipTrigger>
                         <TooltipContent><p>Attach File</p></TooltipContent>
                      </Tooltip>
                       <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" onClick={handleRecordVoice} className={cn(isRecording && "text-destructive")}>
                                 <Mic className="h-5 w-5" />
                                 <span className="sr-only">{isRecording ? "Stop Recording" : "Record Voice"}</span>
                             </Button>
                         </TooltipTrigger>
                         <TooltipContent><p>{isRecording ? "Stop Recording" : "Record Voice Note"}</p></TooltipContent>
                       </Tooltip>
                  </TooltipProvider>
                  {/* Hidden file input triggered by button */}
                 <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                 <Input
                   placeholder="Type your message..."
                   className="flex-1"
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                 />
                 <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                     <Send className="h-5 w-5" />
                      <span className="sr-only">Send message</span>
                  </Button>
               </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </main>
    </div>
  );
}
