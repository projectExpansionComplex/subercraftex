import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import axios from 'axios';
import { Globe, Download, Star, Calendar, DollarSign, Clock, User, Send, PlusCircle } from 'lucide-react';

const UV_ProjectDetail: React.FC = () => {
  const { project_uid } = useParams<{ project_uid: string }>();
  const dispatch: AppDispatch = useDispatch();
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth);

  const [projectData, setProjectData] = useState<any>(null);
  const [similarProjects, setSimilarProjects] = useState<any[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    cover_letter: '',
    proposed_timeline: null as number | null,
    attachments: [] as File[]
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
    fetchQuestions();
  }, [project_uid]);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_uid}`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setProjectData(response.data);
      fetchSimilarProjects(response.data.category_uid);
    } catch (error) {
      console.error('Error fetching project details:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to load project details.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSimilarProjects = async (category_uid: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects`, {
        params: { category_uid, limit: 3 },
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setSimilarProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching similar projects:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_uid}/questions`, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const toggleApplicationForm = () => setIsApplying(!isApplying);

  const handleApplicationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setApplicationForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files as FileList)]
      }));
    }
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('cover_letter', applicationForm.cover_letter);
      formData.append('proposed_timeline', applicationForm.proposed_timeline?.toString() || '');
      applicationForm.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      await axios.post(`http://localhost:1337/api/projects/${project_uid}/applications`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${auth_token}`
        }
      });

      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Application submitted successfully.' }));
      setIsApplying(false);
      setApplicationForm({ cover_letter: '', proposed_timeline: null, attachments: [] });
    } catch (error) {
      console.error('Error submitting application:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to submit application.' }));
    }
  };

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:1337/api/projects/${project_uid}/questions`, { question: newQuestion }, {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setNewQuestion('');
      fetchQuestions();
      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Question submitted successfully.' }));
    } catch (error) {
      console.error('Error submitting question:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to submit question.' }));
    }
  };

  const downloadAttachment = async (attachment_uid: string, file_name: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/projects/${project_uid}/attachments/${attachment_uid}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading attachment:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to download attachment.' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!projectData) {
    return <div className="text-center text-red-500 text-xl">Project not found.</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 font-sans">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <h1 className="text-4xl font-bold mb-2">{projectData.title}</h1>
            <div className="flex items-center space-x-4">
              <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                {projectData.category}
              </span>
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {projectData.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
            <div className="md:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Project Description</h2>
                <p className="text-gray-600 leading-relaxed">{projectData.description}</p>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Requirements</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {projectData.required_skills.map((skill: string, index: number) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Attachments</h2>
                {projectData.attachments.length > 0 ? (
                  <ul className="space-y-2">
                    {projectData.attachments.map((attachment: any) => (
                      <li key={attachment.uid} className="flex items-center space-x-2">
                        <Download className="text-gray-400" size={20} />
                        <span className="text-gray-600">{attachment.file_name}</span>
                        <button
                          onClick={() => downloadAttachment(attachment.uid, attachment.file_name)}
                          className="text-blue-500 hover:text-blue-700 font-medium"
                        >
                          Download
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No attachments available.</p>
                )}
              </section>

              {current_user && current_user.role === 'designer' && (
                <section className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Apply for This Project</h2>
                  {isApplying ? (
                    <form onSubmit={submitApplication} className="space-y-4">
                      <div>
                        <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-1">
                          Cover Letter
                        </label>
                        <textarea
                          id="cover_letter"
                          name="cover_letter"
                          rows={4}
                          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                          value={applicationForm.cover_letter}
                          onChange={handleApplicationInputChange}
                          required
                        ></textarea>
                      </div>
                      <div>
                        <label htmlFor="proposed_timeline" className="block text-sm font-medium text-gray-700 mb-1">
                          Proposed Timeline (days)
                        </label>
                        <input
                          type="number"
                          id="proposed_timeline"
                          name="proposed_timeline"
                          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                          value={applicationForm.proposed_timeline || ''}
                          onChange={handleApplicationInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
                          Attachments
                        </label>
                        <input
                          type="file"
                          id="attachments"
                          name="attachments"
                          multiple
                          onChange={handleFileUpload}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={toggleApplicationForm}
                          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Submit Application
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={toggleApplicationForm}
                      className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Apply Now
                    </button>
                  )}
                </section>
              )}

              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Questions & Answers</h2>
                {questions.map((q) => (
                  <div key={q.uid} className="mb-4 pb-4 border-b last:border-b-0">
                    <p className="font-medium text-gray-800">{q.user_name}: {q.question}</p>
                    {q.answer && <p className="mt-2 text-gray-600 pl-4">Answer: {q.answer}</p>}
                  </div>
                ))}
                {current_user && (
                  <form onSubmit={submitQuestion} className="mt-4">
                    <textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Ask a question..."
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    ></textarea>
                    <button
                      type="submit"
                      className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      <Send className="inline-block mr-2" size={16} />
                      Submit Question
                    </button>
                  </form>
                )}
              </section>
            </div>

            <div className="md:col-span-1 space-y-6">
              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Project Details</h2>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <DollarSign className="text-green-500 mr-2" size={20} />
                    <span className="text-gray-600">
                      <strong>Budget:</strong> ${projectData.budget_min} - ${projectData.budget_max}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Calendar className="text-blue-500 mr-2" size={20} />
                    <span className="text-gray-600">
                      <strong>Deadline:</strong> {new Date(projectData.deadline).toLocaleDateString()}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Clock className="text-purple-500 mr-2" size={20} />
                    <span className="text-gray-600">
                      <strong>Posted:</strong> {new Date(projectData.created_at).toLocaleDateString()}
                    </span>
                  </li>
                </ul>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Client Information</h2>
                <div className="flex items-center mb-2">
                  <User className="text-gray-400 mr-2" size={20} />
                  <span className="text-gray-600"><strong>Name:</strong> {projectData.client_name}</span>
                </div>
                <div className="flex items-center">
                  <Star className="text-yellow-400 mr-2" size={20} />
                  <span className="text-gray-600"><strong>Rating:</strong> {projectData.client_rating}/5</span>
                </div>
              </section>

              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Similar Projects</h2>
                {similarProjects.map((project) => (
                  <div key={project.uid} className="mb-4 last:mb-0">
                    <Link 
                      to={`/project/${project.uid}`} 
                      className="text-blue-600 hover:text-blue-800 font-medium block mb-1"
                    >
                      {project.title}
                    </Link>
                    <p className="text-sm text-gray-600">
                      <DollarSign className="inline-block text-green-500 mr-1" size={14} />
                      Budget: ${project.budget_min} - ${project.budget_max}
                    </p>
                  </div>
                ))}
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ProjectDetail;