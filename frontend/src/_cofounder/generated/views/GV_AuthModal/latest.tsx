import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_auth, add_notification, login } from '@/store/main';
import axios from 'axios';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link } from "react-router-dom";
import './auth.css'
import axiosInstance from '@/utils/axiosInstance';

const GV_AuthModal: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: false });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'individual' as 'individual' | 'designer' | 'business'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);

  const { auth_token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (auth_token) {
      setIsOpen(false);
    }
  }, [auth_token]);

  useEffect(() => {
    if (isSubmitting) {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 200);
      return () => clearInterval(timer);
    } else {
      setProgress(0);
    }
  }, [isSubmitting]);

  const validateForm = (form: 'login' | 'register') => {
    const errors: Record<string, string> = {};
    if (form === 'login') {
      if (!loginForm.email) errors.email = 'Email is required';
      if (!loginForm.password) errors.password = 'Password is required';
    } else {
      if (!registerForm.firstName) errors.firstName = 'First name is required';
      if (!registerForm.lastName) errors.lastName = 'Last name is required';

      if (!registerForm.email) errors.email = 'Email is required';
      if (!registerForm.password) errors.password = 'Password is required';
      if (registerForm.password !== registerForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm('login')) return;

    setIsSubmitting(true);
    try {
      

      const results = await dispatch(login({
        email: loginForm.email,
        password: loginForm.password
      }));
     console.log(results,"this is results data in form login")

      if(results.payload.auth_token){setIsOpen(false);}
    } catch (error) {
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: error.response.data.message ? error.response.data.message :'Login failed. Please check your credentials.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm('register')) return;

    setIsSubmitting(true);
    try {
    
      const response = await axiosInstance.post('/api/users/register', {
        first_name: registerForm.firstName,
        last_name: registerForm.lastName,
        email: registerForm.email,
        password: registerForm.password,
        user_type: registerForm.userType
      });

      console.log(response,"this is response data in form registration")
      dispatch(set_auth(response.data));
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Registration successful!'
      }));
      setIsOpen(false);
    } catch (error) {
      
      dispatch(add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: error.response.data.message ? error.response.data.message :"Registration failed. Please try again."
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Implement social login logic here
    console.log(`Social login with ${provider}`);
  };

  const handleForgotPassword = () => {
    // Implement forgot password logic here
    console.log('Forgot password');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="overflow-auto  bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
        <Progress value={progress} className="authProgress absolute top-0 left-0 right-0 h-1" />
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-center mb-6 font-serif text-purple-800">
          {activeTab === 'login' ? 'Welcome Back' : 'Join Us'}
        </h2>

        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className='formContainer'>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className={formErrors.password ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="rememberMe"
                    checked={loginForm.rememberMe}
                    onCheckedChange={(checked) => setLoginForm({ ...loginForm, rememberMe: checked as boolean })}
                  />
                  <Label htmlFor="rememberMe" className="ml-2">Remember me</Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className='formContainer'>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  type="text"
                  id="firstName"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                  className={formErrors.firstName ? 'border-red-500' : ''}
                />
                {formErrors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  type="text"
                  id="lastName"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  className={formErrors.lastName ? 'border-red-500' : ''}
                />
                {formErrors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="registerEmail">Email</Label>
                <Input
                  type="email"
                  id="registerEmail"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="registerPassword">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="registerPassword"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className={formErrors.password ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  className={formErrors.confirmPassword ? 'border-red-500' : ''}
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>
              <div>
                <Label htmlFor="userType">User Type</Label>
                <RadioGroup
                  value={registerForm.userType}
                  onValueChange={(value) => setRegisterForm({ ...registerForm, userType: value as 'individual' | 'designer' | 'business' })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual">Individual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="designer" id="designer" />
                    <Label htmlFor="designer">Designer/Artisan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business">Business</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600 mb-4">Or continue with</p>
          <div className="flex justify-center space-x-4 socialButton">
            <Button
              onClick={() => handleSocialLogin('google')}
              variant="outline"
              className="flex items-center justify-center"
            >
              <FaGoogle className="mr-2" /> Google
            </Button>
            <Button
              onClick={() => handleSocialLogin('facebook')}
              variant="outline"
              className="flex items-center justify-center"
            >
              <FaFacebook className="mr-2" /> Facebook
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default GV_AuthModal;