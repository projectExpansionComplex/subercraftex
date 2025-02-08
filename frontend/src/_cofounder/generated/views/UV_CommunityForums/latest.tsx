import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { RootState } from '@/store/main';
import { add_notification } from '@/store/main';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MessageSquare, Eye, ThumbsUp, Users, Hash } from 'lucide-react';

const UV_CommunityForums: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { topicUid } = useParams<{ topicUid?: string }>();
  const { auth_token, current_user } = useSelector((state: RootState) => state.auth);
  const { language } = useSelector((state: RootState) => state.preferences);

  const [forumCategories, setForumCategories] = useState<any[]>([]);
  const [topicList, setTopicList] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [editorContent, setEditorContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTopics: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForumCategories();
    if (topicUid) {
      selectTopic(topicUid);
    } else {
      fetchTopics();
    }
  }, [topicUid]);

  const fetchForumCategories = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/forum-categories');
      setForumCategories(response.data);
    } catch (err) {
      console.error('Error fetching forum categories:', err);
      setError('Failed to load forum categories. Please try again later.');
    }
  };

  const fetchTopics = async (page = 1, category = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:1337/api/forum-topics`, {
        params: { page, category, search: searchQuery }
      });
      setTopicList(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        totalPages: response.data.total_pages,
        totalTopics: response.data.total_topics,
      });
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Failed to load topics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const selectTopic = async (topicUid: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:1337/api/forum-topics/${topicUid}`);
      setSelectedTopic(response.data);
    } catch (err) {
      console.error('Error fetching topic details:', err);
      setError('Failed to load topic details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async (categoryUid: string) => {
    if (!auth_token) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'You must be logged in to create a topic.'
      }));
      return;
    }

    try {
      const response = await axios.post('http://localhost:1337/api/forum-topics', {
        title: 'New Topic',
        content: editorContent,
        category_uid: categoryUid
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setTopicList([response.data, ...topicList]);
      setEditorContent('');
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Topic created successfully!'
      }));
    } catch (err) {
      console.error('Error creating topic:', err);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to create topic. Please try again.'
      }));
    }
  };

  const replyToTopic = async () => {
    if (!auth_token || !selectedTopic) return;

    try {
      const response = await axios.post(`http://localhost:1337/api/forum-replies`, {
        topic_uid: selectedTopic.uid,
        content: editorContent
      }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setSelectedTopic({
        ...selectedTopic,
        replies: [...selectedTopic.replies, response.data]
      });
      setEditorContent('');
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Reply posted successfully!'
      }));
    } catch (err) {
      console.error('Error posting reply:', err);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to post reply. Please try again.'
      }));
    }
  };

  const upvotePost = async (postUid: string, isReply: boolean) => {
    if (!auth_token) return;

    try {
      await axios.post(`http://localhost:1337/api/forum-${isReply ? 'replies' : 'topics'}/${postUid}/upvote`, {}, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      if (isReply) {
        setSelectedTopic({
          ...selectedTopic,
          replies: selectedTopic.replies.map((reply: any) =>
            reply.uid === postUid ? { ...reply, upvotes: reply.upvotes + 1 } : reply
          )
        });
      } else {
        setSelectedTopic({ ...selectedTopic, upvotes: selectedTopic.upvotes + 1 });
      }
    } catch (err) {
      console.error('Error upvoting post:', err);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to upvote. Please try again.'
      }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTopics(1);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'PPP', { locale: language });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-3/4">
          <h1 className="text-3xl font-bold mb-6">Community Forums</h1>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow flex">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search forums..."
                className="flex-grow rounded-r-none"
              />
              <Button type="submit" className="rounded-l-none">Search</Button>
            </form>
            {auth_token && (
              <Button onClick={() => createTopic(forumCategories[0]?.uid)} className="bg-green-500 hover:bg-green-600">
                New Topic
              </Button>
            )}
          </div>

          {!selectedTopic && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {forumCategories.map((category) => (
                  <div key={category.uid} className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Hash className="w-4 h-4" />
                        {category.topic_count}
                      </Badge>
                      <Button
                        onClick={() => createTopic(category.uid)}
                        className="bg-blue-500 hover:bg-blue-600"
                        size="sm"
                      >
                        New Topic
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold mb-4">Recent Topics</h2>
              {loading ? (
                <p>Loading topics...</p>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  {topicList.map((topic) => (
                    <div key={topic.uid} className="border-b last:border-b-0 p-4 hover:bg-gray-50">
                      <Link to={`/forum/${topic.uid}`} className="block">
                        <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>By {topic.author_name}</span>
                          <span>{formatDate(topic.created_at)}</span>
                        </div>
                        <div className="mt-2 flex gap-4 text-sm">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {topic.reply_count}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {topic.view_count}
                          </Badge>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              {pagination.totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => fetchTopics(pagination.currentPage - 1)} />
                    </PaginationItem>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => fetchTopics(page)}
                          isActive={page === pagination.currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext onClick={() => fetchTopics(pagination.currentPage + 1)} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}

          {selectedTopic && (
            <div className="bg-white shadow rounded-lg p-6">
              <Button onClick={() => navigate('/forum')} variant="ghost" className="mb-4">
                &larr; Back to Forums
              </Button>
              <h2 className="text-2xl font-bold mb-4">{selectedTopic.title}</h2>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{selectedTopic.author_name}</span>
                  <span className="text-sm text-gray-500">{formatDate(selectedTopic.created_at)}</span>
                </div>
                <div dangerouslySetInnerHTML={{ __html: selectedTopic.content }} />
                <div className="mt-4 flex justify-between items-center">
                  <Button
                    onClick={() => upvotePost(selectedTopic.uid, false)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Upvote ({selectedTopic.upvotes})
                  </Button>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {selectedTopic.view_count}
                  </Badge>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-4">Replies</h3>
              {selectedTopic.replies.map((reply: any) => (
                <div key={reply.uid} className="mb-4 p-4 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{reply.author_name}</span>
                    <span className="text-sm text-gray-500">{formatDate(reply.created_at)}</span>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: reply.content }} />
                  <div className="mt-2">
                    <Button
                      onClick={() => upvotePost(reply.uid, true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Upvote ({reply.upvotes})
                    </Button>
                  </div>
                </div>
              ))}

              {auth_token && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Post a Reply</h3>
                  <ReactQuill value={editorContent} onChange={setEditorContent} className="mb-4" />
                  <Button
                    onClick={replyToTopic}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Post Reply
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:w-1/4">
          {auth_token && current_user && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar>
                  <AvatarImage src={current_user.avatar_url} alt={current_user.username} />
                  <AvatarFallback>{current_user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{current_user.username}</h3>
                  <p className="text-sm text-gray-500">Reputation: {current_user.reputation}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {current_user.badges.map((badge: string) => (
                  <Badge key={badge} variant="secondary">{badge}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Trending Topics</h3>
            {topicList.slice(0, 3).map((topic) => (
              <div key={topic.uid} className="mb-4">
                <Link to={`/forum/${topic.uid}`} className="font-medium hover:underline">
                  {topic.title}
                </Link>
                <div className="flex gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {topic.reply_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {topic.view_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!auth_token && !selectedTopic && (
        <div className="mt-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Note:</p>
          <p>You must be logged in to create topics or post replies. <Link to="/login" className="underline">Log in</Link> or <Link to="/register" className="underline">register</Link> to join the discussion.</p>
        </div>
      )}
    </div>
  );
};

export default UV_CommunityForums;