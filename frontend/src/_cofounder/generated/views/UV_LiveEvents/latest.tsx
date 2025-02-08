import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import ReactPlayer from 'react-player';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ChevronRight, Users, Send, MessageSquare } from "lucide-react";

interface Event {
  id: string;
  title: string;
  host: string;
  dateTime: string;
  description: string;
  thumbnail: string;
  registrationCount: number;
  streamUrl?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface Question {
  id: string;
  userId: string;
  userName: string;
  question: string;
  timestamp: string;
  status: 'pending' | 'answered' | 'skipped';
}

const UV_LiveEvents: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.preferences);

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentPage, setCurrentPage] = useState<number>(1);

  const socketRef = useRef<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const eventsPerPage = 5;

  useEffect(() => {
    fetchUpcomingEvents();
    const interval = setInterval(fetchUpcomingEvents, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/live-events');
      setUpcomingEvents(response.data);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to fetch upcoming events. Please try again later.',
      }));
    }
  };

  const registerForEvent = async (eventId: string) => {
    if (!auth_token) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Please log in to register for events.',
      }));
      return;
    }

    try {
      await axios.post(`http://localhost:1337/api/live-events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Successfully registered for the event!',
      }));
      fetchUpcomingEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to register for the event. Please try again.',
      }));
    }
  };

  const joinLiveEvent = (event: Event) => {
    setCurrentEvent(event);
    setIsLive(true);
    connectToEventSocket(event.id);
  };

  const connectToEventSocket = (eventId: string) => {
    socketRef.current = io(`http://localhost:1337/live-events/${eventId}`, {
      auth: { token: auth_token }
    });

    socketRef.current.on('chat_message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    socketRef.current.on('question', (question: Question) => {
      setUserQuestions(prev => [...prev, question]);
    });

    socketRef.current.on('event_ended', () => {
      setIsLive(false);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'info',
        message: 'The live event has ended.',
      }));
    });
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.emit('chat_message', {
      message: newMessage,
      userId: current_user?.uid,
      userName: current_user?.full_name
    });
    setNewMessage('');
  };

  const submitQuestion = () => {
    if (!newQuestion.trim() || !socketRef.current) return;

    socketRef.current.emit('submit_question', {
      question: newQuestion,
      userId: current_user?.uid,
      userName: current_user?.full_name
    });
    setNewQuestion('');
  };

  const leaveEvent = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setIsLive(false);
    setCurrentEvent(null);
    setChatMessages([]);
    setUserQuestions([]);
  };

  const submitFeedback = async () => {
    if (!currentEvent || !feedback.trim()) return;

    try {
      await axios.post(`http://localhost:1337/api/events/${currentEvent.id}/feedback`, 
        { feedback },
        { headers: { Authorization: `Bearer ${auth_token}` } }
      );
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Thank you for your feedback!',
      }));
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to submit feedback. Please try again.',
      }));
    }
  };

  const filteredEvents = selectedDate
    ? upcomingEvents.filter(event => new Date(event.dateTime).toDateString() === selectedDate.toDateString())
    : upcomingEvents;

  const paginatedEvents = filteredEvents.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage);

  return (
    <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h1 className="text-4xl font-bold mb-8 text-center">Live Events</h1>

      {!isLive && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-semibold mb-4">Select Date</h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
            {paginatedEvents.map((event) => (
              <div key={event.id} className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <Badge variant="outline">{new Date(event.dateTime) <= new Date() ? 'Live' : 'Upcoming'}</Badge>
                </div>
                <p className="text-sm mt-2">Host: {event.host}</p>
                <p className="text-sm">Date: {format(new Date(event.dateTime), 'PPP')}</p>
                <p className="text-sm mt-2">{event.description}</p>
                <div className="flex items-center mt-4">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">{event.registrationCount} registered</span>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button onClick={() => registerForEvent(event.id)} variant="outline">
                    Register
                  </Button>
                  {new Date(event.dateTime) <= new Date() && (
                    <Button onClick={() => joinLiveEvent(event)} variant="default">
                      Join Live
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {Array.from({ length: Math.ceil(filteredEvents.length / eventsPerPage) }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredEvents.length / eventsPerPage)))}
                    className={currentPage === Math.ceil(filteredEvents.length / eventsPerPage) ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {isLive && currentEvent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">{currentEvent.title}</h2>
            <ReactPlayer
              url={currentEvent.streamUrl}
              playing
              controls
              width="100%"
              height="400px"
              className="rounded-lg overflow-hidden"
            />
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>1.2k watching</span>
              </div>
              <Button onClick={leaveEvent} variant="destructive">
                Leave Event
              </Button>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className="text-xl font-semibold mb-2">Event Information</h3>
              <p className="text-sm">Host: {currentEvent.host}</p>
              <p className="text-sm">Date: {format(new Date(currentEvent.dateTime), 'PPP')}</p>
              <p className="text-sm mt-2">{currentEvent.description}</p>
              <Badge variant="outline" className="mt-2">Live</Badge>
            </div>
            <Tabs defaultValue="chat" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="qa">Q&A</TabsTrigger>
              </TabsList>
              <TabsContent value="chat">
                <div ref={chatContainerRef} className={`h-60 overflow-y-auto mb-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="mb-2">
                      <span className="font-semibold">{msg.userName}: </span>
                      <span>{msg.message}</span>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow mr-2"
                  />
                  <Button onClick={sendChatMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="qa">
                <div className={`h-60 overflow-y-auto mb-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {userQuestions.map((q) => (
                    <div key={q.id} className="mb-2">
                      <span className="font-semibold">{q.userName}: </span>
                      <span>{q.question}</span>
                      <Badge variant="outline" className={`ml-2 ${
                        q.status === 'answered' ? 'bg-green-500' : 
                        q.status === 'skipped' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}>
                        {q.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <Input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-grow mr-2"
                  />
                  <Button onClick={submitQuestion} size="icon">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {!isLive && currentEvent && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Event Feedback</h2>
          <Input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please share your thoughts about the event..."
            className="mb-4"
          />
          <Button onClick={submitFeedback} variant="default">
            Submit Feedback
          </Button>
        </div>
      )}
    </div>
  );
};

export default UV_LiveEvents;