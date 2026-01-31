import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Smartphone,
  Mail,
  Key,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Security() {
  // Mock data - in production this would come from admin_settings
  const securitySettings = {
    twoFactorEnabled: true,
    twoFactorMethod: 'email',
    lastPasswordChange: new Date().toISOString(),
  };
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<"password" | "email" | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const openPopup = (type: "password" | "email") => {
    setActionType(type);
    setStep(1);
    setOpen(true);
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setNewEmail("");
  };

  const handleVerifyEmail = async () => {
    if (!email) return toast.error("Please enter your email");

    try {
      const res = await fetch('http://localhost:3000/api/admin/security/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Please enter OTP");

    try {
      const res = await fetch('http://localhost:3000/api/admin/security/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    }
  };

  const closePopup = () => {
    setOpen(false);
    setStep(1);
    setActionType(null);
  };


  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    try {
      const res = await fetch('http://localhost:3000/api/admin/security/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Password updated successfully");
      closePopup();
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) return toast.error("Enter new email");

    try {
      const res = await fetch('http://localhost:3000/api/admin/security/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Email updated successfully");
      closePopup();
    } catch (err: any) {
      toast.error(err.message || "Failed to update email");
    }
  };

  return (
    <AdminLayout
      title="Security"
      description="Manage authentication and security settings"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 2FA Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">2FA Status</p>
                <p className="text-sm text-muted-foreground">
                  Required for all admin actions
                </p>
              </div>
              <Badge variant="default" className="bg-success text-success-foreground">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground">
                Authentication Methods
              </p>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email OTP</p>
                    <p className="text-sm text-muted-foreground">
                      Receive codes via email
                    </p>
                  </div>
                </div>
                {/* <Switch checked={securitySettings.twoFactorMethod === 'email'} /> */}
              </div>

              {/* <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">
                      Google Authenticator, Authy, etc.
                    </p>
                  </div>
                </div>
                <Switch checked={securitySettings.twoFactorMethod === 'app'} />
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Password Settings</CardTitle>
                <CardDescription>
                  Manage your admin credentials
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last password change</p>
                  <p className="font-medium">
                    {format(new Date(securitySettings.lastPasswordChange), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div> */}

            <div className="space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => openPopup("password")}
              >
                Change Password
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => openPopup("email")}
              >
                Change Email
              </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {actionType === "password" ? "Change Password" : "Change Email"}
                  </DialogTitle>
                  <DialogDescription>
                    Secure verification required
                  </DialogDescription>
                </DialogHeader>

                {/* STEP 1: Email Verification */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <Button className="w-full" onClick={handleVerifyEmail}>
                      Verify Email
                    </Button>
                  </div>
                )}

                {/* STEP 2: OTP */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>OTP</Label>
                      <Input
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>

                    <Button className="w-full" onClick={handleVerifyOtp}>
                      Verify OTP
                    </Button>
                  </div>
                )}

                {/* STEP 3: Update */}
                {step === 3 && actionType === "password" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

                    <Button className="w-full" onClick={handleUpdatePassword}>
                      Update Password
                    </Button>
                  </div>
                )}

                {step === 3 && actionType === "email" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>New Email</Label>
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>

                    <Button className="w-full" onClick={handleUpdateEmail}>
                      Update Email
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">
                  Security Recommendation
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Change your password regularly to maintain account security.
                  We recommend updating it every 90 days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        {/* <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Devices currently logged into your admin account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-muted-foreground">
                      This device • Started {format(new Date(), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-success border-success">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </AdminLayout>
  );
}