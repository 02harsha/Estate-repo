import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Loader2, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
});

export default function Login() {
  const { signIn, signUp, sendOtp, verifyOtp, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Login/Signup States
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', fullName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Forgot Password States
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '' });
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setIsLoading(false);

    if (error) {
      setErrors({ email: error.message || 'Failed to login' });
      toast.error(error.message || 'Failed to login');
    } else {
      toast.success('Logged in successfully');
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(signupData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupData.email, signupData.password, signupData.fullName);
    setIsLoading(false);

    if (error) {
      setErrors({ email: error.message || 'Failed to sign up' });
      toast.error(error.message || 'Failed to sign up');
    } else {
      toast.success('Account created successfully');
      setActiveTab('login');
      setLoginData({ email: signupData.email, password: '' });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrors({});

    if (!resetData.email) {
      setResetErrors({ email: 'Email is required' });
      return;
    }

    setIsLoading(true);
    const { error } = await sendOtp(resetData.email);
    setIsLoading(false);

    if (error) {
      setResetErrors({ email: error.message || 'Failed to send OTP' });
      // toast.error(error.message);
    } else {
      toast.success('OTP sent to your email');
      setForgotPasswordStep('otp');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrors({});

    if (!resetData.otp) {
      setResetErrors({ otp: 'OTP is required' });
      return;
    }

    setIsLoading(true);
    const { error } = await verifyOtp(resetData.email, resetData.otp);
    setIsLoading(false);

    if (error) {
      setResetErrors({ otp: error.message || 'Invalid OTP' });
    } else {
      toast.success('OTP verified');
      setForgotPasswordStep('reset');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrors({});

    if (!resetData.newPassword || resetData.newPassword.length < 6) {
      setResetErrors({ newPassword: 'Password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(resetData.email, resetData.otp, resetData.newPassword);
    setIsLoading(false);

    if (error) {
      setResetErrors({ newPassword: error.message || 'Failed to reset password' });
    } else {
      toast.success('Password reset successful! Please login.');
      setForgotPasswordMode(false);
      setForgotPasswordStep('email');
      setResetData({ email: '', otp: '', newPassword: '' });
      setActiveTab('login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative animate-fade-in">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">100CRORECLUB MNC</CardTitle>
          <CardDescription>
            {forgotPasswordMode ? 'Reset your password' : 'Sign in to access the admin panel'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {forgotPasswordMode ? (
            <div className="space-y-4">
              {forgotPasswordStep === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Enter your Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={resetData.email}
                        onChange={(e) => { setResetData({ ...resetData, email: e.target.value }); if (resetErrors.email) setResetErrors({ ...resetErrors, email: '' }); }}
                        className={`pl-10 ${resetErrors.email ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {resetErrors.email && <p className="text-destructive text-sm mt-1">{resetErrors.email}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send OTP'}
                  </Button>
                </form>
              )}

              {forgotPasswordStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-otp">Enter OTP</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-otp"
                        type="text"
                        placeholder="Enter OTP"
                        value={resetData.otp}
                        onChange={(e) => { setResetData({ ...resetData, otp: e.target.value }); if (resetErrors.otp) setResetErrors({ ...resetErrors, otp: '' }); }}
                        className={`pl-10 ${resetErrors.otp ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {resetErrors.otp && <p className="text-destructive text-sm mt-1">{resetErrors.otp}</p>}
                    <p className="text-xs text-muted-foreground">OTP sent to {resetData.email}</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify OTP'}
                  </Button>
                </form>
              )}

              {forgotPasswordStep === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-password"
                        type="password"
                        placeholder="New Password"
                        value={resetData.newPassword}
                        onChange={(e) => { setResetData({ ...resetData, newPassword: e.target.value }); if (resetErrors.newPassword) setResetErrors({ ...resetErrors, newPassword: '' }); }}
                        className={`pl-10 ${resetErrors.newPassword ? 'border-destructive' : ''}`}
                        required
                        minLength={6}
                      />
                    </div>
                    {resetErrors.newPassword && <p className="text-destructive text-sm mt-1">{resetErrors.newPassword}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reset Password'}
                  </Button>
                </form>
              )}

              <Button variant="ghost" className="w-full mt-2" onClick={() => { setForgotPasswordMode(false); setForgotPasswordStep('email'); setResetData({ email: '', otp: '', newPassword: '' }); setResetErrors({}); }}>
                Back to Login
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setErrors({}); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => { setLoginData({ ...loginData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: '' }); }}
                        className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <button type="button" onClick={() => setForgotPasswordMode(true)} className="text-sm text-primary hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => { setLoginData({ ...loginData, password: e.target.value }); if (errors.password) setErrors({ ...errors, password: '' }); }}
                        className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupData.fullName}
                        onChange={(e) => { setSignupData({ ...signupData, fullName: e.target.value }); if (errors.fullName) setErrors({ ...errors, fullName: '' }); }}
                        className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChange={(e) => { setSignupData({ ...signupData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: '' }); }}
                        className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => { setSignupData({ ...signupData, password: e.target.value }); if (errors.password) setErrors({ ...errors, password: '' }); }}
                        className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                        required
                        minLength={6}
                      />
                    </div>
                    {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
