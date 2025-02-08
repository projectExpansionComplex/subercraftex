import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { RootState, AppDispatch, add_notification } from '@/store/main';
import 'react-datepicker/dist/react-datepicker.css';

const UV_CustomDesignRequest: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { current_user, auth_token } = useSelector((state: RootState) => state.auth);
  const [step, setStep] = useState(1);
  const [inspirationImages, setInspirationImages] = useState<Array<{ uid: string; file: File; preview_url: string }>>([]);
  const [availableDesigners, setAvailableDesigners] = useState<Array<{ uid: string; name: string; specialty: string; availability: Array<{ date: string; time_slots: string[] }> }>>([]);
  const [selectedDesigner, setSelectedDesigner] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    fetchAvailableDesigners();
  }, []);

  const fetchAvailableDesigners = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/available-designers', {
        headers: { Authorization: `Bearer ${auth_token}` }
      });
      setAvailableDesigners(response.data);
    } catch (error) {
      console.error('Error fetching available designers:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to fetch available designers. Please try again.' }));
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      uid: Math.random().toString(36).substring(7),
      file,
      preview_url: URL.createObjectURL(file)
    }));
    setInspirationImages(prev => [...prev, ...newImages]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/*' });

  const removeImage = (uid: string) => {
    setInspirationImages(prev => prev.filter(img => img.uid !== uid));
  };

  const handleDesignerSelect = (designerUid: string) => {
    setSelectedDesigner(designerUid);
    const designer = availableDesigners.find(d => d.uid === designerUid);
    if (designer) {
      const allTimeSlots = designer.availability.flatMap(a => a.time_slots);
      setAvailableTimeSlots(allTimeSlots);
    }
  };

  const validationSchema = Yup.object().shape({
    project_description: Yup.string().required('Project description is required'),
    budget_range: Yup.string().required('Budget range is required'),
    timeline: Yup.string().required('Timeline is required'),
    consultation_date: Yup.date().required('Consultation date is required'),
    consultation_time: Yup.string().required('Consultation time is required'),
  });

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const formData = new FormData();
      formData.append('project_description', values.project_description);
      formData.append('budget_range', values.budget_range);
      formData.append('timeline', values.timeline);
      formData.append('preferred_designer_uid', selectedDesigner || '');
      formData.append('consultation_date', values.consultation_date.toISOString());
      formData.append('consultation_time', values.consultation_time);

      inspirationImages.forEach((img, index) => {
        formData.append(`inspiration_images[${index}]`, img.file);
      });

      await axios.post('http://localhost:1337/api/custom-design-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${auth_token}`
        }
      });

      dispatch(add_notification({ id: Date.now().toString(), type: 'success', message: 'Custom design request submitted successfully!' }));
      setStep(1);
    } catch (error) {
      console.error('Error submitting custom design request:', error);
      dispatch(add_notification({ id: Date.now().toString(), type: 'error', message: 'Failed to submit custom design request. Please try again.' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!current_user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Please log in to submit a custom design request.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Custom Design Request</h1>
      <Formik
        initialValues={{
          project_description: '',
          budget_range: '',
          timeline: '',
          consultation_date: null,
          consultation_time: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="space-y-8">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Step 1: Project Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="project_description" className="block text-sm font-medium text-gray-700">Project Description</label>
                    <Field
                      as="textarea"
                      id="project_description"
                      name="project_description"
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <ErrorMessage name="project_description" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700">Budget Range</label>
                    <Field
                      as="select"
                      id="budget_range"
                      name="budget_range"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a budget range</option>
                      <option value="0-1000">$0 - $1,000</option>
                      <option value="1001-5000">$1,001 - $5,000</option>
                      <option value="5001-10000">$5,001 - $10,000</option>
                      <option value="10001+">$10,001+</option>
                    </Field>
                    <ErrorMessage name="budget_range" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">Timeline</label>
                    <Field
                      as="select"
                      id="timeline"
                      name="timeline"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a timeline</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6-12 months">6-12 months</option>
                      <option value="12+ months">12+ months</option>
                    </Field>
                    <ErrorMessage name="timeline" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Next: Upload Inspiration
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Step 2: Upload Inspiration Images</h2>
                <div {...getRootProps()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input {...getInputProps()} id="file-upload" name="file-upload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {inspirationImages.map((img) => (
                    <div key={img.uid} className="relative">
                      <img src={img.preview_url} alt="Inspiration" className="h-24 w-full object-cover rounded-md" />
                      <button
                        type="button"
                        onClick={() => removeImage(img.uid)}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Next: Select Designer
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Step 3: Select Designer and Schedule Consultation</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {availableDesigners.map((designer) => (
                    <div
                      key={designer.uid}
                      className={`border rounded-lg p-4 cursor-pointer ${selectedDesigner === designer.uid ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
                      onClick={() => handleDesignerSelect(designer.uid)}
                    >
                      <h3 className="font-semibold">{designer.name}</h3>
                      <p className="text-sm text-gray-500">{designer.specialty}</p>
                    </div>
                  ))}
                </div>
                {selectedDesigner && (
                  <div className="mt-6">
                    <label htmlFor="consultation_date" className="block text-sm font-medium text-gray-700">Consultation Date</label>
                    <DatePicker
                      selected={values.consultation_date}
                      onChange={(date: Date) => setFieldValue('consultation_date', date)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <ErrorMessage name="consultation_date" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                )}
                {values.consultation_date && (
                  <div className="mt-4">
                    <label htmlFor="consultation_time" className="block text-sm font-medium text-gray-700">Consultation Time</label>
                    <Field
                      as="select"
                      id="consultation_time"
                      name="consultation_time"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a time</option>
                      {availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="consultation_time" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                )}
                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UV_CustomDesignRequest;