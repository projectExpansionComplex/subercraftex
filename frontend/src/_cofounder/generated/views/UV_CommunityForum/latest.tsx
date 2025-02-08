import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';
import { io, Socket } from 'socket.io-client';

const UV_CommunityForum: React.FC = () => {
  const { topic_uid } = useParams<{ topic_uid?: string }>();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.preferences);

  const [forumTopics, setForumTopics] = useState<Array<{
    uid: string;
    title: string;
    author: { uid: string; name: string; avatar_url: string };
    category: string;
    replies_count: number;
    last_activity: number;
  }>>([]);
  const [currentTopic, setCurrentTopic] = useState<{
    uid: string;
    title: string;
    content: string;
    author: { uid: string; name: string; avatar_url: string };
    category: string;
    created_at: number;
    updated_at: number;
    replies: Array<{
      uid: string;
      content: string;
      author: { uid: string; name: string; avatar_url: string };
      created_at: number;
      updated_at: number;
    }>;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState<string>('');
  const [newTopicContent, setNewTopicContent] = useState<string>('');
  const [newReplyContent, setNewReplyContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchForumTopics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:1337/api/forum-topics`, {
        params: {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          page: currentPage,
          search: searchQuery,
        },
      });
      setForumTopics(response.data.data);
      setTotalPages(response.data.pagination.total_pages);
    } catch (err) {
      setError('Failed to fetch forum topics. Please try again later.');
      console.error('Error fetching forum topics:', err);
    }
    setIsLoading(false);
  }, [selectedCategory, currentPage, searchQuery]);

  const fetchTopicDetails = useCallback(async (topicUid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:1337/api/forum-topics/${topicUid}`);
      setCurrentTopic(response.data);
    } catch (err) {
      setError('Failed to fetch topic details. Please try again later.');
      console.error('Error fetching topic details:', err);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (topic_uid) {
      fetchTopicDetails(topic_uid);
    } else {
      fetchForumTopics();
    }
  }, [topic_uid, fetchForumTopics, fetchTopicDetails]);

  useEffect(() => {
    let socket: Socket;

    if (auth_token) {
      socket = io('http://localhost:1337', {
        auth: { token: auth_token },
      });

      socket.on('new_forum_reply', (data) => {
        if (currentTopic && data.topic_uid === currentTopic.uid) {
          setCurrentTopic((prevTopic) => ({
            ...prevTopic!,
            replies: [...prevTopic!.replies, data.reply],
          }));
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [auth_token, currentTopic]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth_token) {
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'You must be logged in to create a topic.' }));
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:1337/api/forum-topics',
        { title: newTopicTitle, content: newTopicContent, category: selectedCategory },
        { headers: { Authorization: `Bearer ${auth_token}` } }
      );
      setNewTopicTitle('');
      setNewTopicContent('');
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Topic created successfully!' }));
      navigate(`/forum/${response.data.uid}`);
    } catch (err) {
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to create topic. Please try again.' }));
      console.error('Error creating topic:', err);
    }
  };

  const handleReplyToTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth_token || !currentTopic) {
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'You must be logged in to reply.' }));
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:1337/api/forum-replies',
        { topic_uid: currentTopic.uid, content: newReplyContent },
        { headers: { Authorization: `Bearer ${auth_token}` } }
      );
      setNewReplyContent('');
      setCurrentTopic((prevTopic) => ({
        ...prevTopic!,
        replies: [...prevTopic!.replies, response.data],
      }));
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Reply posted successfully!' }));
    } catch (err) {
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to post reply. Please try again.' }));
      console.error('Error posting reply:', err);
    }
  };

  const handleUpvote = async (postUid: string) => {
    if (!auth_token) {
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'You must be logged in to upvote.' }));
      return;
    }
    try {
      await axios.post(
        `http://localhost:1337/api/forum-posts/${postUid}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${auth_token}` } }
      );
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Upvote recorded!' }));
      // Refresh topic details to reflect the new upvote count
      if (currentTopic) {
        fetchTopicDetails(currentTopic.uid);
      }
    } catch (err) {
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to upvote. Please try again.' }));
      console.error('Error upvoting:', err);
    }
  };

  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-6">Community Forum</h1>
      
      {!topic_uid && (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`border rounded px-3 py-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search topics..."
                onChange={handleSearchChange}
                className={`border rounded px-3 py-2 w-full md:w-64 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          {isLoading ? (
            <p className="text-center">Loading topics...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="space-y-4">
              {forumTopics.map((topic) => (
                <div key={topic.uid} className={`border rounded p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                  <Link to={`/forum/${topic.uid}`} className="text-xl font-semibold hover:underline">
                    {topic.title}
                  </Link>
                  <p className="text-sm mt-2">
                    Posted by {topic.author.name} in {topic.category} • {topic.replies_count} replies
                  </p>
                  <p className="text-sm mt-1">
                    Last activity: {new Date(topic.last_activity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } disabled:opacity-50`}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } disabled:opacity-50`}
            >
              Next
            </button>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Create New Topic</h2>
            <form onSubmit={handleCreateTopic}>
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Topic Title"
                className={`w-full border rounded px-3 py-2 mb-4 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
                required
              />
              <textarea
                value={newTopicContent}
                onChange={(e) => setNewTopicContent(e.target.value)}
                placeholder="Topic Content"
                className={`w-full border rounded px-3 py-2 mb-4 h-32 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
                required
              ></textarea>
              <button
                type="submit"
                className={`px-4 py-2 rounded ${
                  theme === 'dark'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                Create Topic
              </button>
            </form>
          </div>
        </>
      )}

      {topic_uid && currentTopic && (
        <div>
          <Link to="/forum" className="text-blue-500 hover:underline mb-4 inline-block">
            ← Back to Topics
          </Link>
          <h2 className="text-2xl font-bold mb-4">{currentTopic.title}</h2>
          <div className={`border rounded p-4 mb-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
            <div className="flex items-center mb-2">
              <img
                src={currentTopic.author.avatar_url || 'https://via.placeholder.com/40'}
                alt={currentTopic.author.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold">{currentTopic.author.name}</p>
                <p className="text-sm">{new Date(currentTopic.created_at).toLocaleString()}</p>
              </div>
            </div>
            <p className="mt-2">{currentTopic.content}</p>
            <button
              onClick={() => handleUpvote(currentTopic.uid)}
              className={`mt-4 px-3 py-1 rounded ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Upvote
            </button>
          </div>

          <h3 className="text-xl font-bold mb-4">Replies</h3>
          {currentTopic.replies.map((reply) => (
            <div key={reply.uid} className={`border rounded p-4 mb-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
              <div className="flex items-center mb-2">
                <img
                  src={reply.author.avatar_url || 'https://via.placeholder.com/40'}
                  alt={reply.author.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <p className="font-semibold">{reply.author.name}</p>
                  <p className="text-sm">{new Date(reply.created_at).toLocaleString()}</p>
                </div>
              </div>
              <p className="mt-2">{reply.content}</p>
              <button
                onClick={() => handleUpvote(reply.uid)}
                className={`mt-2 px-3 py-1 rounded ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Upvote
              </button>
            </div>
          ))}

          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Post a Reply</h3>
            <form onSubmit={handleReplyToTopic}>
              <textarea
                value={newReplyContent}
                onChange={(e) => setNewReplyContent(e.target.value)}
                placeholder="Your reply"
                className={`w-full border rounded px-3 py-2 mb-4 h-32 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
                required
              ></textarea>
              <button
                type="submit"
                className={`px-4 py-2 rounded ${
                  theme === 'dark'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                Post Reply
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UV_CommunityForum;