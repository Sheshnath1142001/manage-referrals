import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  UserCircle,
  Lock,
  IdCard,
  Edit,
  Save,
  X,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/services/api/auth";

const Profile = () => {
  const { toast } = useToast();
  const { user, isAuthChecked, setUser } = useAuth();
  // Debug: log user value on every render
  console.log('Profile page user context:', user);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [profileKey, setProfileKey] = useState(0);

  useEffect(() => {
    setProfileKey((k) => k + 1);
  }, [user]);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">User not found.</p>
        </div>
      </div>
    );
  }

  const [editData, setEditData] = useState({
    name: user.name || "",
    phone: user.phone_no || "",
    gender: user.gender || "",
  });
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Sync editData with user whenever user changes
  useEffect(() => {
    setEditData({
      name: user.name || "",
      phone: user.phone_no || "",
      gender: user.gender || "",
    });
  }, [user]);

  const handleEditOpen = () => {
    setEditData({
      name: user.name || "",
      phone: user.phone_no || "",
      gender: user.gender || "",
    });
    setEditOpen(true);
  };
  const handleEditChange = (e: any) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };
  const handleGenderChange = (value: string) => {
    setEditData((prev) => ({ ...prev, gender: value }));
  };
  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await authApi.updateProfile(user.id, {
        name: editData.name,
        phone_no: editData.phone,
        gender: editData.gender,
      });
      // Fetch the latest user info and update context/localStorage
      const meRes = await authApi.getMe();
      if (meRes && meRes.data && meRes.data.user) {
        const adminData = localStorage.getItem('Admin');
        if (adminData) {
          const admin = JSON.parse(adminData);
          admin.user = meRes.data.user;
          localStorage.setItem('Admin', JSON.stringify(admin));
        }
        setUser({ ...meRes.data.user });
        console.log('Set user after refresh:', meRes.data.user);
      }
      setEditOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordOpen = () => {
    setPasswordData({ current: "", new: "", confirm: "" });
    setPasswordOpen(true);
  };
  const handlePasswordChange = (e: any) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };
  const handlePasswordSubmit = async (e: any) => {
    e.preventDefault();
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.setPassword(passwordData.current, passwordData.new);
      setPasswordOpen(false);
      toast({ title: "Password changed", description: "Your password has been updated." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to update password.",
        variant: "destructive"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRefreshProfile = async () => {
    setRefreshLoading(true);
    try {
      const meRes = await authApi.getMe();
      if (meRes && meRes.data && meRes.data.user) {
        const adminData = localStorage.getItem('Admin');
        if (adminData) {
          const admin = JSON.parse(adminData);
          admin.user = meRes.data.user;
          localStorage.setItem('Admin', JSON.stringify(admin));
        }
        setUser({ ...meRes.data.user });
        console.log('Set user after refresh:', meRes.data.user);
      }
      toast({ title: "Profile refreshed", description: "Your profile information has been updated." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to refresh profile.",
        variant: "destructive"
      });
    } finally {
      setRefreshLoading(false);
    }
  };

  return (
    <div key={profileKey} className="min-h-screen bg-background flex flex-col items-center justify-start py-8 px-2 sm:px-4">
      <div className="w-full max-w-5xl">
        <div className="flex justify-end mb-6">
          <Button 
            variant="outline"
            className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
            onClick={handleRefreshProfile}
            disabled={refreshLoading}
          >
            <RefreshCw className="h-4 w-4" />
            {refreshLoading ? "Refreshing..." : "Refresh Profile"}
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <Card className="bg-white rounded-xl shadow border border-gray-200">
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 h-24" />
              <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-white p-1 shadow mb-4">
                  <div className="h-full w-full rounded-full bg-purple-100 flex items-center justify-center">
                    <UserCircle className="h-16 w-16 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <Badge className="bg-primary/10 text-primary mt-1">{user.roles?.role || "Admin"}</Badge>
                <div className="w-full mt-6 space-y-3">
                  <Button 
                    onClick={handleEditOpen}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button 
                    onClick={handlePasswordOpen}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  >
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          <div className="w-full md:w-2/3">
            <Card className="bg-white rounded-xl shadow border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <UserCircle className="h-4 w-4 text-primary" /> Username
                    </Label>
                    <div className="p-3 rounded-md bg-gray-50 border border-gray-100">
                      <p className="text-gray-900">{user.username}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <User className="h-4 w-4 text-primary" /> Name
                    </Label>
                    <div className="p-3 rounded-md bg-gray-50 border border-gray-100">
                      <p className="text-gray-900">{user.name}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <Briefcase className="h-4 w-4 text-primary" /> Role
                    </Label>
                    <div className="p-3 rounded-md bg-gray-50 border border-gray-100">
                      <p className="text-gray-900">{user.roles?.role || "Admin"}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <User className="h-4 w-4 text-primary" /> Gender
                    </Label>
                    <div className="p-3 rounded-md bg-gray-50 border border-gray-100">
                      <p className="text-gray-900">{user.gender}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <Phone className="h-4 w-4 text-primary" /> Phone Number
                    </Label>
                    <div className="p-3 rounded-md bg-gray-50 border border-gray-100">
                      <p className="text-gray-900">{user.phone_no}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <Mail className="h-4 w-4 text-primary" /> Email
                    </Label>
                    <div className="p-3 rounded-md bg-gray-50 border border-gray-100">
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <IdCard className="h-4 w-4 text-primary" /> Client ID
                    </Label>
                    <div className="p-3 rounded-md bg-gray-50 border border-gray-100">
                      <p className="text-gray-900">{user.restaurant_id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-700">Name*</Label>
                <Input name="name" value={editData.name} onChange={handleEditChange} required disabled={editLoading} />
              </div>
              <div>
                <Label className="text-gray-700">Phone no.*</Label>
                <Input name="phone" value={editData.phone} onChange={handleEditChange} required disabled={editLoading} />
              </div>
              <div>
                <Label className="text-gray-700">Gender</Label>
                <Select value={editData.gender} onValueChange={handleGenderChange} disabled={editLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={editLoading}>
                  {editLoading ? "Updating..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Label className="text-gray-700">Current Password*</Label>
                <Input
                  name="current"
                  type={showCurrent ? "text" : "password"}
                  value={passwordData.current}
                  onChange={handlePasswordChange}
                  required
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrent((v) => !v)}
                  tabIndex={-1}
                  disabled={passwordLoading}
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <Label className="text-gray-700">New Password*</Label>
                <Input
                  name="new"
                  type={showNew ? "text" : "password"}
                  value={passwordData.new}
                  onChange={handlePasswordChange}
                  required
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNew((v) => !v)}
                  tabIndex={-1}
                  disabled={passwordLoading}
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <Label className="text-gray-700">Confirm Password*</Label>
                <Input
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={passwordData.confirm}
                  onChange={handlePasswordChange}
                  required
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  disabled={passwordLoading}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={passwordLoading}>
                  {passwordLoading ? "Updating..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;
