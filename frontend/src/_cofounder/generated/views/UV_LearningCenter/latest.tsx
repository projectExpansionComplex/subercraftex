import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Star, Search, PlusCircle } from 'lucide-react';
import baseUrl from '../../../../utils/baseURL.js';
import axiosInstance from '@/utils/axiosInstance';

const UV_LearningCenter: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { current_user } = useSelector((state: RootState) => state.auth);
  const { language, theme } = useSelector((state: RootState) => state.preferences);

  const [tutorials, setTutorials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [skillLevels, setSkillLevels] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState<any | null>(null);

  const fetchTutorials = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/api/educational-resources', {
        params: {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          skill_level: selectedSkillLevel !== 'all' ? selectedSkillLevel : undefined,
          page: currentPage,
          limit: 12,
          search: searchQuery,
        },
      });
      setTutorials(response.data.resources);
      setTotalPages(Math.ceil(response.data.total_count / 12));
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to load tutorials. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedSkillLevel, currentPage, searchQuery, dispatch]);

  // Debounce the fetchTutorials function
  const debouncedFetchTutorials = useCallback(debounce(fetchTutorials, 300), [fetchTutorials]);

  // Fetch tutorials when filters or pagination change
  useEffect(() => {
    debouncedFetchTutorials();
    return () => debouncedFetchTutorials.cancel(); // Cancel debounce on unmount
  }, [debouncedFetchTutorials]);

  // Fetch categories and skill levels on mount
  useEffect(() => {
    const fetchCategoriesAndSkillLevels = async () => {
      try {
        const [categoriesResponse, skillLevelsResponse] = await Promise.all([
          axiosInstance.get('/api/tutorial-categories'),
          axiosInstance.get('/api/skill-levels'),
        ]);
        setCategories(categoriesResponse.data);
        setSkillLevels(skillLevelsResponse.data);
      } catch (error) {
        console.error('Error fetching categories and skill levels:', error);
      }
    };
    fetchCategoriesAndSkillLevels();
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSkillLevelChange = (skillLevel: string) => {
    setSelectedSkillLevel(skillLevel);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTutorialSelect = async (tutorialId: string) => {
    try {
      const response = await axiosInstance.get(`/api/educational-resources/${tutorialId}`);
      setSelectedTutorial(response.data);
    } catch (error) {
      console.error('Error fetching tutorial details:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to load tutorial details. Please try again.',
      }));
    }
  };

  const handleRateTutorial = async (tutorialId: string, rating: number) => {
    if (!current_user) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'info',
        message: 'Please log in to rate tutorials.',
      }));
      return;
    }
    try {
      await axiosInstance.post(`/api/educational-resources/${tutorialId}/rate`, { rating, userId: current_user._id });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Thank you for rating this tutorial!',
      }));
      fetchTutorials();
    } catch (error) {
      console.error('Error rating tutorial:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to submit rating. Please try again.',
      }));
    }
  };

  const handleUpdateProgress = async (tutorialId: string, progress: number) => {
    if (!current_user) return;
    try {
      await axiosInstance.put(`/api/educational-resources/${tutorialId}/progress`, { progress, userId: current_user._id });
      fetchTutorials();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <>
      <div className={`min-h-screen bg-gray-100 ${theme === 'dark' ? 'dark' : ''}`}>
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-purple-800 dark:text-purple-400">Learning Center</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search tutorials..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Suggest Tutorial
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row">
          <aside className="w-full md:w-64 mb-8 md:mb-0 md:mr-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Filters</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skill Level</label>
                  <Select value={selectedSkillLevel} onValueChange={handleSkillLevelChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skill Levels</SelectItem>
                      {skillLevels.map((level) => (
                        <SelectItem key={level._id} value={level._id}>{level.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => { setSelectedCategory('all'); setSelectedSkillLevel('all'); }}>
                    Reset
                  </Button>
                  <Button onClick={fetchTutorials}>Apply</Button>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {tutorials.map((tutorial) => (
                    <div key={tutorial._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                      <img
                        src={tutorial.thumbnail ? baseUrl + tutorial.thumbnail : `https://picsum.photos/seed/${tutorial._id}/400/225`}
                        alt={tutorial.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h2 className="text-xl font-semibold mb-2 dark:text-white">{tutorial.title}</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{tutorial.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary">{tutorial.category?.name}</Badge>
                          <Badge variant="outline">{tutorial.skill_level?.name}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                onClick={() => handleRateTutorial(tutorial._id, star)}
                                className={`cursor-pointer ${
                                  star <= tutorial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                                size={20}
                              />
                            ))}
                          </div>
                          <Button onClick={() => handleTutorialSelect(tutorial._id)}>
                            Start Learning
                          </Button>
                        </div>
                        {current_user && tutorial.user_progress && (
                          <div className="mt-4">
                            <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div
                                className="bg-purple-600 h-2.5 rounded-full"
                                style={{ width: `${tutorial.user_progress.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{tutorial.user_progress.progress}% complete</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination className="mt-8">
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                      </PaginationItem>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </>
            )}
          </main>
        </div>

        {selectedTutorial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-full overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">{selectedTutorial.title}</h2>
                {selectedTutorial.type === 'video' ? (
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <iframe
                      src={selectedTutorial.videoType === 'youtube' ? selectedTutorial.videoUrl : baseUrl + selectedTutorial.videoFile}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                ) : (
                  <div className="prose max-w-none mb-4 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: selectedTutorial.description }}></div>
                )}
                {current_user && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Update Progress</label>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedTutorial.user_progress?.progress || 0}
                      onChange={(e) => handleUpdateProgress(selectedTutorial._id, parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{selectedTutorial.user_progress?.progress || 0}% complete</span>
                  </div>
                )}
                <Button onClick={() => setSelectedTutorial(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Suggest a New Tutorial Topic</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            dispatch(add_notification({
              id: Date.now().toString(),
              type: 'success',
              message: 'Thank you for your suggestion! We\'ll review it shortly.',
            }));
          }} className="space-y-4">
            <Input
              type="text"
              placeholder="Tutorial title"
              className="w-full"
              required
            />
            <textarea
              placeholder="Brief description of the tutorial"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              rows={4}
              required
            ></textarea>
            <Button type="submit" className="bg-green-500 hover:bg-green-600">
              Submit Suggestion
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UV_LearningCenter;