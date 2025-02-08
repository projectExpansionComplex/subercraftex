import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { ChevronDown, Grid, List, Loader, BookmarkPlus, BookmarkMinus, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const UV_ProjectListing: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth);

  const [projects, setProjects] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: null,
    category_uid: null,
    budget_min: null,
    budget_max: null,
    skills: [],
  });
  const [sortOption, setSortOption] = useState('created_at_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [savedProjects, setSavedProjects] = useState<string[]>([]);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:1337/api/projects', {
        params: {
          ...filters,
          sort: sortOption,
          page: currentPage,
        },
        headers: auth_token ? { Authorization: `Bearer ${auth_token}` } : {},
      });
      setProjects(response.data.projects);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching projects:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to fetch projects. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortOption, currentPage, auth_token, dispatch]);

  const debouncedFetchProjects = debounce(fetchProjects, 300);

  useEffect(() => {
    debouncedFetchProjects();
    return () => debouncedFetchProjects.cancel();
  }, [debouncedFetchProjects]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:1337/api/project-categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleQuickApply = async (projectId: string) => {
    if (!current_user) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Please log in to apply for projects.',
      }));
      return;
    }
    try {
      await axios.post(`http://localhost:1337/api/projects/${projectId}/applications`, {}, {
        headers: { Authorization: `Bearer ${auth_token}` },
      });
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Application submitted successfully!',
      }));
      fetchProjects();
    } catch (error) {
      console.error('Error applying to project:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to apply for the project. Please try again.',
      }));
    }
  };

  const handleSaveProject = async (projectId: string) => {
    if (!current_user) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Please log in to save projects.',
      }));
      return;
    }
    try {
      if (savedProjects.includes(projectId)) {
        await axios.delete(`http://localhost:1337/api/users/${current_user.uid}/saved-projects/${projectId}`, {
          headers: { Authorization: `Bearer ${auth_token}` },
        });
        setSavedProjects(prev => prev.filter(id => id !== projectId));
        dispatch(add_notification({
          id: Date.now().toString(),
          type: 'success',
          message: 'Project removed from saved list.',
        }));
      } else {
        await axios.post(`http://localhost:1337/api/users/${current_user.uid}/saved-projects/${projectId}`, {}, {
          headers: { Authorization: `Bearer ${auth_token}` },
        });
        setSavedProjects(prev => [...prev, projectId]);
        dispatch(add_notification({
          id: Date.now().toString(),
          type: 'success',
          message: 'Project saved successfully.',
        }));
      }
    } catch (error) {
      console.error('Error saving/unsaving project:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to save/unsave the project. Please try again.',
      }));
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Browse Projects</h1>
        
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={filters.category_uid || ''} onValueChange={(value) => handleFilterChange('category_uid', value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.uid} value={category.uid}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Min Budget"
              value={filters.budget_min || ''}
              onChange={(e) => handleFilterChange('budget_min', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full"
            />

            <Input
              type="number"
              placeholder="Max Budget"
              value={filters.budget_max || ''}
              onChange={(e) => handleFilterChange('budget_max', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full"
            />

            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="created_at_asc">Oldest First</SelectItem>
                <SelectItem value="budget_max_desc">Highest Budget</SelectItem>
                <SelectItem value="budget_max_asc">Lowest Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <Toggle
            pressed={viewMode === 'grid'}
            onPressedChange={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            aria-label="Toggle view mode"
          >
            {viewMode === 'grid' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Toggle>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {projects.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600">No projects found matching your criteria.</p>
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
                {projects.map((project) => (
                  <div key={project.uid} className={`bg-white rounded-lg shadow-md overflow-hidden ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row'}`}>
                    <div className={`p-6 ${viewMode === 'grid' ? 'flex-grow' : 'flex-grow w-2/3'}`}>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">{project.title}</h3>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="mb-4">
                        <span className="font-semibold text-gray-700">Budget:</span> <span className="text-green-600">${project.budget_min} - ${project.budget_max}</span>
                      </div>
                      <div className="mb-4">
                        <span className="font-semibold text-gray-700">Deadline:</span> <span className="text-blue-600">{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="mb-4">
                        <span className="font-semibold text-gray-700">Skills:</span> 
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.skills.map((skill: string, index: number) => (
                            <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={`p-6 bg-gray-50 ${viewMode === 'grid' ? '' : 'w-1/3 flex flex-col justify-center'}`}>
                      <Button
                        onClick={() => handleQuickApply(project.uid)}
                        className="w-full mb-2"
                      >
                        Quick Apply
                      </Button>
                      <Button
                        onClick={() => handleSaveProject(project.uid)}
                        variant="outline"
                        className="w-full mb-2"
                      >
                        {savedProjects.includes(project.uid) ? (
                          <><BookmarkMinus className="mr-2 h-4 w-4" /> Unsave</>
                        ) : (
                          <><BookmarkPlus className="mr-2 h-4 w-4" /> Save</>
                        )}
                      </Button>
                      <Link
                        to={`/project/${project.uid}`}
                        className="block text-center text-blue-500 hover:underline"
                      >
                        View Details <ArrowRight className="inline-block ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
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
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default UV_ProjectListing;