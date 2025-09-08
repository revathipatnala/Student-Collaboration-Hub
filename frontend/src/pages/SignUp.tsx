import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Calendar, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FormData {
  fullName: string;
  email: string;
  dateOfBirth: string;
  otp: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  dateOfBirth?: string;
  otp?: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    dateOfBirth: '',
    otp: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [, setOtpSent] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z]+\.23\.[a-zA-Z]{2,3}@anits\.edu\.in$/.test(formData.email)) {
      newErrors.email = 'Email must be in the format name.23.xx@anits.edu.in or name.23.xxx@anits.edu.in';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 13 || age > 120) {
        newErrors.dateOfBirth = 'Age must be between 13 and 120 years';
      }
    }

    if (step === 2 && !formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authAPI.sendSignupOTP({
        email: formData.email,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth
      });
      
      setOtpSent(true);
      setStep(2);
      toast.success('OTP sent successfully! Check your email.');
    } catch (error: any) {
      let errorMessage = 'Failed to send OTP';
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authAPI.verifySignupOTP(formData);
      
      login(response.data.user);
      toast.success('Account created successfully!');
      
      // Navigate to the page user was trying to access, or dashboard by default
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      let errorMessage = 'Invalid OTP';
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
      setErrors({ otp: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await authAPI.sendSignupOTP({
        email: formData.email,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth
      });
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
       <div className="absolute top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 z-50">
        
          <svg
            width="1209"
            height="32"
            viewBox="0 0 1200 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.1424 0.843087L16.9853 0L14.3248 9.89565L11.9228 0.961791L8.76555 1.80488L11.3608 11.4573L4.8967 5.01518L2.58549 7.31854L9.67576 14.3848L0.845959 12.0269L0 15.1733L9.64767 17.7496C9.53721 17.2748 9.47877 16.7801 9.47877 16.2717C9.47877 12.6737 12.4055 9.75685 16.0159 9.75685C19.6262 9.75685 22.5529 12.6737 22.5529 16.2717C22.5529 16.7768 22.4952 17.2685 22.3861 17.7405L31.1541 20.0818L32 16.9354L22.314 14.3489L31.1444 11.9908L30.2984 8.84437L20.6128 11.4308L27.0768 4.98873L24.7656 2.68538L17.7737 9.65357L20.1424 0.843087Z"
              fill="#367AFF"
            />
            <path
              d="M22.3776 17.7771C22.1069 18.9176 21.5354 19.9421 20.7513 20.763L27.1033 27.0935L29.4145 24.7901L22.3776 17.7771Z"
              fill="#367AFF"
            />
            <path
              d="M20.6872 20.8292C19.8936 21.637 18.8907 22.2398 17.7661 22.5504L20.0775 31.1472L23.2346 30.3041L20.6872 20.8292Z"
              fill="#367AFF"
            />
            <path
              d="M17.6482 22.5819C17.1264 22.7156 16.5795 22.7866 16.0159 22.7866C15.4121 22.7866 14.8274 22.705 14.2723 22.5523L11.9589 31.1569L15.116 32L17.6482 22.5819Z"
              fill="#367AFF"
            />
            <path
              d="M14.1607 22.5205C13.0532 22.1945 12.0682 21.584 11.2908 20.7739L4.92322 27.1199L7.23442 29.4233L14.1607 22.5205Z"
              fill="#367AFF"
            />
            <path
              d="M11.2377 20.7178C10.4737 19.9026 9.91718 18.8917 9.65228 17.7688L0.855713 20.1179L1.70167 23.2643L11.2377 20.7178Z"
              fill="#367AFF"
            />
            <path
    d="M20.1424 0.843087L16.9853 0L14.3248 9.89565L11.9228 0.961791L8.76555 1.80488L11.3608 11.4573L4.8967 5.01518L2.58549 7.31854L9.67576 14.3848L0.845959 12.0269L0 15.1733L9.64767 17.7496C9.53721 17.2748 9.47877 16.7801 9.47877 16.2717C9.47877 12.6737 12.4055 9.75685 16.0159 9.75685C19.6262 9.75685 22.5529 12.6737 22.5529 16.2717C22.5529 16.7768 22.4952 17.2685 22.3861 17.7405L31.1541 20.0818L32 16.9354L22.314 14.3489L31.1444 11.9908L30.2984 8.84437L20.6128 11.4308L27.0768 4.98873L24.7656 2.68538L17.7737 9.65357L20.1424 0.843087Z"
    fill="#367AFF"
  />
  <text
    x="50"
    y="25"
    fontFamily="Arial, sans-serif"
    fontSize="20"
    fontWeight="bold"
    fill="#232323"
  >
    STUDENT COLLABORATION HUB
  </text>
          
        </svg>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
           
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign up</h1>
          <p className="text-gray-600">Sign up to enjoy the features of Student Hub</p>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <Input
              label="Enter Username"
              type="text"
              placeholder="Username"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              error={errors.fullName}
              icon={<User className="w-5 h-5" />}
            />

            <Input
              label="Enter Date"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              error={errors.dateOfBirth}
              icon={<Calendar className="w-5 h-5" />}
            />

            <Input
              label="Enter Email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              icon={<Mail className="w-5 h-5" />}
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Get OTP
            </Button>

            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                We've sent a verification code to
              </p>
              <p className="font-medium text-gray-900">{formData.email}</p>
            </div>

            <Input
              label="OTP"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={formData.otp}
              onChange={(e) => handleInputChange('otp', e.target.value)}
              error={errors.otp}
              maxLength={6}
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Sign up
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend OTP
              </button>
              <div>
                <span className="text-gray-600">Already have an account? </span>
                <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default SignUp;