import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';

interface OrderChatProps {
  orderId: string;
  otherUserId: string;
  otherUserName: string;
}

const OrderChat = ({ orderId, otherUserId, otherUserName }: OrderChatProps) => {
  const { user } = useAuth();
  const { data: messages, isLoading } = useMessages(orderId);
  const sendMessage = useSendMessage();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await sendMessage.mutateAsync({
      orderId,
      receiverId: otherUserId,
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Chat with {otherUserName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto border rounded-lg p-3 mb-3 space-y-2 bg-muted/30">
          {isLoading && <p className="text-sm text-muted-foreground text-center">Loading...</p>}
          {messages?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start a conversation!</p>
          )}
          {messages?.map(msg => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isMe ? 'bg-primary text-primary-foreground' : 'bg-card border'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {format(new Date(msg.created_at!), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <Button size="icon" onClick={handleSend} disabled={sendMessage.isPending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderChat;
