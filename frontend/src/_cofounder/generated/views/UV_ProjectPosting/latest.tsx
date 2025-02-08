import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react';

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const UV_ProjectPosting: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth);

  const [projectDetails, setProjectDetails] = useState({
    title: '',
    description: '',
    category: '',
    budgetType: 'fixed' as 'fixed' | 'range',
    budgetFixed: 0,
    budgetMin: 0,
    budgetMax: 0,
    deadline: '',
    skills: [] as string[],
    attachments: [] as File[]
  });

  const [categories, setCategories] = useState<Array<{ uid: string; name: string }>>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (!auth_token) {
      navigate('/login');
      return;
    }

    fetchCategories();
    loadDraft();
  }, [auth_token, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/project-categories', {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to load project categories. Please try again.'
      }));
    }
  };

  const loadDraft = () => {
    const savedDraft = localStorage.getItem('projectDraft');
    if (savedDraft) {
      setProjectDetails(JSON.parse(savedDraft));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectDetails(prev => ({ ...prev, [name]: value }));
    debouncedAutoSave({ ...projectDetails, [name]: value });
  };

  const toggleBudgetType = () => {
    setProjectDetails(prev => ({
      ...prev,
      budgetType: prev.budgetType === 'fixed' ? 'range' : 'fixed'
    }));
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSkill(e.target.value);
  };

  const addSkill = () => {
    if (newSkill && !projectDetails.skills.includes(newSkill)) {
      setProjectDetails(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProjectDetails(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setProjectDetails(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setProjectDetails(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, index) => index !== indexToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!projectDetails.title.trim()) errors.title = 'Title is required';
    if (!projectDetails.description.trim()) errors.description = 'Description is required';
    if (!projectDetails.category) errors.category = 'Category is required';
    if (projectDetails.budgetType === 'fixed' && projectDetails.budgetFixed <= 0) {
      errors.budget = 'Please enter a valid budget';
    }
    if (projectDetails.budgetType === 'range') {
      if (projectDetails.budgetMin <= 0) errors.budgetMin = 'Minimum budget is required';
      if (projectDetails.budgetMax <= 0) errors.budgetMax = 'Maximum budget is required';
      if (projectDetails.budgetMax <= projectDetails.budgetMin) {
        errors.budgetMax = 'Maximum budget must be greater than minimum budget';
      }
    }
    if (!projectDetails.deadline) errors.deadline = 'Deadline is required';
    if (projectDetails.skills.length === 0) errors.skills = 'At least one skill is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const debouncedAutoSave = useCallback(
    debounce((data) => {
      localStorage.setItem('projectDraft', JSON.stringify(data));
    }, 1000),
    []
  );

  const submitProject = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const formData = new FormData();

    Object.entries(projectDetails).forEach(([key, value]) => {
      if (key === 'attachments') {
        value.forEach((file: File) => {
          formData.append('attachments', file);
        });
      } else if (key === 'skills') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    });

    try {
      const response = await axios.post('http://localhost:1337/api/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${auth_token}`
        }
      });

      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Project posted successfully!'
      }));

      localStorage.removeItem('projectDraft');
      navigate(`/project/${response.data.uid}`);
    } catch (error) {
      console.error('Failed to post project:', error);
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to post project. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePreviewMode = () => {
    if (!previewMode && !validateForm()) return;
    setPreviewMode(!previewMode);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-purple-800">Post a New Project</h1>

        {previewMode ? (
          <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-semibold mb-4 text-purple-700">{projectDetails.title}</h2>
            <p className="mb-6 text-gray-700">{projectDetails.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-purple-600">Category</h3>
                <p>{categories.find(c => c.uid === projectDetails.category)?.name}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-purple-600">Budget</h3>
                <p>{projectDetails.budgetType === 'fixed' 
                  ? `$${projectDetails.budgetFixed}` 
                  : `$${projectDetails.budgetMin} - $${projectDetails.budgetMax}`}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-purple-600">Deadline</h3>
                <p>{projectDetails.deadline}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-purple-600">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {projectDetails.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-purple-600">Attachments</h3>
              <ul className="list-disc list-inside">
                {projectDetails.attachments.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
            <Button
              onClick={togglePreviewMode}
              className="mt-8"
            >
              Edit Project
            </Button>
          </div>
        ) : (
          <form className="bg-white shadow-lg rounded-lg p-8">
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={projectDetails.title}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                  className={formErrors.title ? 'border-red-500' : ''}
                />
                {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={projectDetails.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project"
                  rows={4}
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={projectDetails.category}
                  onValueChange={(value) => handleInputChange({ target: { name: 'category', value } } as React.ChangeEvent<HTMLSelectElement>)}
                >
                  <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.uid} value={category.uid}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
              </div>

              <div>
                <Label>Budget</Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="fixed-budget"
                    checked={projectDetails.budgetType === 'fixed'}
                    onCheckedChange={toggleBudgetType}
                  />
                  <label htmlFor="fixed-budget" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Fixed Price
                  </label>
                </div>
                {projectDetails.budgetType === 'fixed' ? (
                  <Input
                    type="number"
                    name="budgetFixed"
                    value={projectDetails.budgetFixed}
                    onChange={handleInputChange}
                    placeholder="Enter fixed budget"
                    className={formErrors.budget ? 'border-red-500' : ''}
                  />
                ) : (
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      name="budgetMin"
                      value={projectDetails.budgetMin}
                      onChange={handleInputChange}
                      placeholder="Min budget"
                      className={formErrors.budgetMin ? 'border-red-500' : ''}
                    />
                    <Input
                      type="number"
                      name="budgetMax"
                      value={projectDetails.budgetMax}
                      onChange={handleInputChange}
                      placeholder="Max budget"
                      className={formErrors.budgetMax ? 'border-red-500' : ''}
                    />
                  </div>
                )}
                {formErrors.budget && <p className="text-red-500 text-xs mt-1">{formErrors.budget}</p>}
                {formErrors.budgetMin && <p className="text-red-500 text-xs mt-1">{formErrors.budgetMin}</p>}
                {formErrors.budgetMax && <p className="text-red-500 text-xs mt-1">{formErrors.budgetMax}</p>}
              </div>

              <div>
                <Label htmlFor="deadline">Project Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!projectDetails.deadline && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {projectDetails.deadline ? format(new Date(projectDetails.deadline), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={projectDetails.deadline ? new Date(projectDetails.deadline) : undefined}
                      onSelect={(date) => handleInputChange({ target: { name: 'deadline', value: date ? date.toISOString().split('T')[0] : '' } } as React.ChangeEvent<HTMLInputElement>)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.deadline && <p className="text-red-500 text-xs mt-1">{formErrors.deadline}</p>}
              </div>

              <div>
                <Label>Required Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={newSkill}
                    onChange={handleSkillChange}
                    placeholder="Enter a skill"
                  />
                  <Button type="button" onClick={addSkill} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {projectDetails.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {formErrors.skills && <p className="text-red-500 text-xs mt-1">{formErrors.skills}</p>}
              </div>

              <div>
                <Label>Attachments</Label>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {projectDetails.attachments.map((file, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {file.name}
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6">
                <Button
                  type="button"
                  onClick={togglePreviewMode}
                  variant="outline"
                >
                  Preview
                </Button>
                <Button
                  type="button"
                  onClick={submitProject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Project'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default UV_ProjectPosting;