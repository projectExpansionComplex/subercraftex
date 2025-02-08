import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronRight, Upload, ThumbsUp } from "lucide-react";

const UV_DesignChallenges: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth);
  const { language, timezone } = useSelector((state: RootState) => state.preferences);

  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [pastChallenges, setPastChallenges] = useState<any[]>([]);
  const [userSubmission, setUserSubmission] = useState<any>(null);
  const [votingResults, setVotingResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submissionForm, setSubmissionForm] = useState({
    designTitle: '',
    designDescription: '',
    fileUrls: [] as string[],
  });

  useEffect(() => {
    fetchActiveChallenges();
    fetchPastChallenges();
  }, []);

  const fetchActiveChallenges = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:1337/api/design-challenges/active');
      setActiveChallenges(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching active challenges:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to load active challenges. Please try again.',
      }));
      setLoading(false);
    }
  };

  const fetchPastChallenges = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/design-challenges/past');
      setPastChallenges(response.data);
    } catch (error) {
      console.error('Error fetching past challenges:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to load past challenges. Please try again.',
      }));
    }
  };

  const selectChallenge = async (challengeUid: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/design-challenges/${challengeUid}`);
      setSelectedChallenge(response.data);
      if (current_user) {
        fetchUserSubmission(challengeUid);
      }
      fetchVotingResults(challengeUid);
    } catch (error) {
      console.error('Error fetching challenge details:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to load challenge details. Please try again.',
      }));
    }
  };

  const fetchUserSubmission = async (challengeUid: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/design-challenges/${challengeUid}/submission`, {
        headers: { Authorization: `Bearer ${auth_token}` },
      });
      setUserSubmission(response.data);
    } catch (error) {
      console.error('Error fetching user submission:', error);
      setUserSubmission(null);
    }
  };

  const fetchVotingResults = async (challengeUid: string) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/design-challenges/${challengeUid}/votes`);
      setVotingResults(response.data);
    } catch (error) {
      console.error('Error fetching voting results:', error);
      setVotingResults(null);
    }
  };

  const handleSubmissionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSubmissionForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const response = await axios.post('http://localhost:1337/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${auth_token}` },
          });
          return response.data.url;
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        setSubmissionForm(prev => ({ ...prev, fileUrls: [...prev.fileUrls, ...uploadedUrls] }));
      } catch (error) {
        console.error('Error uploading files:', error);
        dispatch(add_notification({
          id: Date.now().toString(),
          type: 'error',
          message: 'Failed to upload files. Please try again.',
        }));
      }
    }
  };

  const submitEntry = async () => {
    if (!selectedChallenge || !current_user) return;
    try {
      const response = await axios.post(`http://localhost:1337/api/design-challenges/${selectedChallenge.challengeUid}/submit`, submissionForm, {
        headers: { Authorization: `Bearer ${auth_token}` },
      });
      setUserSubmission(response.data);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Your entry has been submitted successfully!',
      }));
      setSubmissionForm({ designTitle: '', designDescription: '', fileUrls: [] });
    } catch (error) {
      console.error('Error submitting entry:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to submit your entry. Please try again.',
      }));
    }
  };

  const voteForEntry = async (submissionUid: string) => {
    if (!selectedChallenge || !current_user) return;
    try {
      await axios.post(`http://localhost:1337/api/design-challenges/${selectedChallenge.challengeUid}/vote`, { submissionUid }, {
        headers: { Authorization: `Bearer ${auth_token}` },
      });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Your vote has been recorded!',
      }));
      fetchVotingResults(selectedChallenge.challengeUid);
    } catch (error) {
      console.error('Error voting for entry:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to record your vote. Please try again.',
      }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    });
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-purple-900">Design Challenges</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-900"></div>
          </div>
        ) : (
          <>
            <section className="mb-16">
              <h2 className="text-3xl font-semibold mb-6 text-blue-800">Active Challenges</h2>
              <Carousel className="w-full">
                <CarouselContent>
                  {activeChallenges.map((challenge) => (
                    <CarouselItem key={challenge.challengeUid} className="md:basis-1/2 lg:basis-1/3">
                      <div className="bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-500 hover:scale-105">
                        <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-48 object-cover" />
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2 text-purple-900">{challenge.title}</h3>
                          <p className="text-gray-600 mb-4">{challenge.description}</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                              Deadline: {formatDate(challenge.endDate)}
                            </Badge>
                            <Button
                              onClick={() => selectChallenge(challenge.challengeUid)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              View Details <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </section>

            {selectedChallenge && (
              <section className="mb-16">
                <h2 className="text-3xl font-semibold mb-6 text-purple-900">{selectedChallenge.title}</h2>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <img src={selectedChallenge.imageUrl} alt={selectedChallenge.title} className="w-full h-64 object-cover" />
                  <div className="p-8">
                    <p className="text-gray-700 mb-6 text-lg">{selectedChallenge.description}</p>
                    <Accordion type="single" collapsible className="w-full mb-8">
                      <AccordionItem value="rules">
                        <AccordionTrigger className="text-blue-800">Rules</AccordionTrigger>
                        <AccordionContent>{selectedChallenge.rules}</AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="guidelines">
                        <AccordionTrigger className="text-blue-800">Submission Guidelines</AccordionTrigger>
                        <AccordionContent>{selectedChallenge.submissionGuidelines}</AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="prizes">
                        <AccordionTrigger className="text-blue-800">Prizes</AccordionTrigger>
                        <AccordionContent>{selectedChallenge.prizeDetails}</AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <Badge variant="outline" className="mb-6">Deadline: {formatDate(selectedChallenge.endDate)}</Badge>
                    
                    {current_user && !userSubmission && (
                      <div className="mt-8">
                        <h3 className="text-2xl font-semibold mb-4 text-purple-900">Submit Your Entry</h3>
                        <form onSubmit={(e) => { e.preventDefault(); submitEntry(); }} className="space-y-6">
                          <div>
                            <label htmlFor="designTitle" className="block text-sm font-medium text-gray-700">Design Title</label>
                            <input
                              type="text"
                              id="designTitle"
                              name="designTitle"
                              value={submissionForm.designTitle}
                              onChange={handleSubmissionChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                          </div>
                          <div>
                            <label htmlFor="designDescription" className="block text-sm font-medium text-gray-700">Design Description</label>
                            <textarea
                              id="designDescription"
                              name="designDescription"
                              value={submissionForm.designDescription}
                              onChange={handleSubmissionChange}
                              required
                              rows={4}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            ></textarea>
                          </div>
                          <div>
                            <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700">Upload Files</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                              <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label htmlFor="fileUpload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>Upload files</span>
                                    <input
                                      id="fileUpload"
                                      type="file"
                                      onChange={handleFileUpload}
                                      multiple
                                      className="sr-only"
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            </div>
                          </div>
                          {submissionForm.fileUrls.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                              <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
                                {submissionForm.fileUrls.map((url, index) => (
                                  <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                    <div className="w-0 flex-1 flex items-center">
                                      <span className="ml-2 flex-1 w-0 truncate">{url.split('/').pop()}</span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            Submit Entry
                          </Button>
                        </form>
                      </div>
                    )}

                    {userSubmission && (
                      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-2xl font-semibold mb-4 text-purple-900">Your Submission</h3>
                        <div>
                          <h4 className="font-semibold text-lg text-blue-800">{userSubmission.designTitle}</h4>
                          <p className="text-gray-700 mt-2">{userSubmission.designDescription}</p>
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700">Submitted Files:</p>
                            <ul className="mt-2 grid grid-cols-2 gap-4">
                              {userSubmission.fileUrls.map((url: string, index: number) => (
                                <li key={index} className="relative">
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                                    <img src={url} alt={`Submitted file ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                      <span className="text-white text-sm">View Full Size</span>
                                    </div>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {votingResults && (
                      <div className="mt-8">
                        <h3 className="text-2xl font-semibold mb-4 text-purple-900">Voting Results</h3>
                        <p className="text-lg mb-4">Total Votes: {votingResults.totalVotes}</p>
                        <ul className="space-y-4">
                          {votingResults.topEntries.map((entry: any) => (
                            <li key={entry.submissionUid} className="bg-white shadow-md rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${entry.designerName}`} alt={entry.designerName} />
                                    <AvatarFallback>{entry.designerName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">{entry.designTitle}</p>
                                    <p className="text-sm text-gray-500">by {entry.designerName}</p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-2xl font-semibold text-blue-600 mr-4">{entry.votes}</span>
                                  {current_user && (
                                    <Button
                                      onClick={() => voteForEntry(entry.submissionUid)}
                                      className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                                      size="sm"
                                    >
                                      <ThumbsUp className="mr-2 h-4 w-4" />
                                      Vote
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <Progress value={(entry.votes / votingResults.totalVotes) * 100} className="mt-2" />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-3xl font-semibold mb-6 text-blue-800">Past Challenges</h2>
              <Carousel className="w-full">
                <CarouselContent>
                  {pastChallenges.map((challenge) => (
                    <CarouselItem key={challenge.challengeUid} className="md:basis-1/2 lg:basis-1/3">
                      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <img src={challenge.imageUrl} alt={challenge.title} className="w-full h-48 object-cover" />
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2 text-purple-900">{challenge.title}</h3>
                          <Badge variant="secondary" className="mb-4">Ended: {formatDate(challenge.endDate)}</Badge>
                          <div className="mt-4">
                            <p className="font-semibold text-gray-700">Winner:</p>
                            <div className="flex items-center mt-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${challenge.winnerName}`} alt={challenge.winnerName} />
                                <AvatarFallback>{challenge.winnerName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="ml-2 text-sm text-gray-600">{challenge.winnerName}</span>
                            </div>
                            <Link
                              to={`/designer/${challenge.winnerUid}`}
                              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                            >
                              View Winner's Profile
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </section>
          </>
        )}
      </div>
    </>
  );
};

export default UV_DesignChallenges;