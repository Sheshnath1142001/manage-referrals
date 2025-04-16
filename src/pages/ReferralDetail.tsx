import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CalendarIcon, 
  Clock, 
  Download, 
  Loader2, 
  MapPin, 
  Upload, 
  User, 
  DollarSign,
  FileText,
  Building,
  Store,
  MessageCircle,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { useNotifications } from '@/contexts/NotificationContext';
import StatusBadge from '@/components/common/StatusBadge';
import { format } from 'date-fns';
import { referralsApi, paymentsApi, reportsApi, messagesApi } from '@/store/apiService';
import { transformApiReferralToReferral } from '@/services/referralService';
import { Referral } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import StripeCheckout from '@/components/payment/StripeCheckout';
import UploadReportDialog from '@/components/common/UploadReportDialog';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const ReferralDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(true);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [rateConfig, setRateConfig] = useState<{
    pharmacistPaymentAmount?: number;
    pharmacyPayoutAmount?: number;
  }>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<{id: string | number; type: 'HMRReport' | 'ReferralDocument'} | null>(null);

  const canAcceptReferrals = user?.role === 'admin' ||
                             user?.role === 'Admin' ||
                             user?.role === 'pharmacist' ||
                             user?.role === 'Pharmacist';
  
  const canViewPdf = user?.role === 'admin' ||
                     user?.role === 'Admin' ||
                     user?.role === 'GP' ||
                     user?.role === 'doctor' ||
                     user?.role === 'clinic' ||
                     user?.role === 'Clinic' ||
                     user?.role === 'pharmacy' ||
                     user?.role === 'Pharmacy';
                     
  const canAccessMessages = user?.role === 'Admin' || 
                            user?.role === 'admin' ||
                            user?.role === 'GP' || 
                            user?.role === 'doctor' ||
                            user?.role === 'Pharmacist' || 
                            user?.role === 'pharmacist';
                            
  const canViewMessagesAsGP = user?.role === 'GP' || 
                              user?.role === 'doctor' || 
                              user?.role === 'clinic' || 
                              user?.role === 'Clinic';

  const canDeleteReports = user?.role === 'Admin' || 
                          user?.role === 'admin' ||
                          user?.role === 'GP' || 
                          user?.role === 'doctor' ||
                          user?.role === 'Pharmacist' || 
                          user?.role === 'pharmacist';

  useEffect(() => {
    const fetchRateConfig = async () => {
      try {
        if (user?.role === 'Admin' || user?.role === 'Pharmacist' || user?.role === 'Pharmacy') {
          const response = await paymentsApi.getRateConfig();
          if (response.data) {
            setRateConfig(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch rate configuration:', error);
      }
    };
    
    fetchRateConfig();
  }, [user?.role]);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchReferral = async () => {
      try {
        setIsLoading(true);
        const response = await referralsApi.getById(id);
        if (response.data) {
          setReferral(transformApiReferralToReferral(response.data));
        } else {
          toast({
            title: 'Error',
            description: 'Referral not found',
            variant: 'destructive',
          });
          navigate('/referrals');
        }
      } catch (error) {
        console.error('Failed to load referral details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load referral details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReferral();
  }, [id, navigate, toast]);

  useEffect(() => {
    const fetchUnreadMessageCount = async () => {
      if (!id || !canAccessMessages) return;
      
      try {
        const response = await messagesApi.getUnreadCount();
        if (response.data) {
          setUnreadMessageCount(response.data.count);
        }
      } catch (error) {
        console.error('Failed to fetch unread message count:', error);
      }
    };
    
    fetchUnreadMessageCount();
  }, [id, canAccessMessages]);
  
  const handleAcceptReferral = () => {
    if (!referral) return;

    if (!canAcceptReferrals) {
      toast({
        title: 'Permission denied',
        description: 'You do not have permission to accept referrals.',
        variant: 'destructive',
      });
      return;
    }
    
    setShowStripeCheckout(true);
  };
  
  const handlePaymentSuccess = async (paymentMethodId: string) => {
    if (!referral) return;
    
    setIsSubmitting(true);
    try {
      await referralsApi.acceptReferral(referral.id, { paymentMethodId });
      
      const updatedReferral = {
        ...referral,
        status: 'accepted' as const,
        acceptedAt: new Date().toISOString(),
      };
      setReferral(updatedReferral);
      
      setShowStripeCheckout(false);
      
      toast({
        title: 'Referral accepted',
        description: `You have successfully accepted this referral. Payment of $${rateConfig.pharmacistPaymentAmount || 500} processed.`,
      });
      
      addNotification({
        title: 'Referral Accepted',
        message: `You have accepted the referral for ${referral.patient.name}. Payment of $${rateConfig.pharmacistPaymentAmount || 500} processed.`,
        type: 'success',
      });
      
      const response = await referralsApi.getById(referral.id);
      if (response.data) {
        setReferral(transformApiReferralToReferral(response.data));
      }
    } catch (error) {
      console.error('Failed to accept referral:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment or accept referral',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCompleteReferral = async () => {
    if (!referral) return;
    
    setIsSubmitting(true);
    try {
      await referralsApi.update(referral.id, { status: 'Completed' });
      
      const updatedReferral = {
        ...referral,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
      };
      setReferral(updatedReferral);

      toast({
        title: 'Referral completed',
        description: 'You have successfully completed this referral.',
      });

      if (user?.role === 'Pharmacy') {
        toast({
          title: 'Payout initiated',
          description: `A payout of $${rateConfig.pharmacyPayoutAmount || 400} has been initiated to your account.`,
        });
      }

      addNotification({
        title: 'Referral Completed',
        message: `You have completed the HMR for ${referral.patient.name}`,
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to complete referral:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete referral',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadPdf = async (file: File) => {
    if (!referral) return;

    toast({
      title: 'PDF uploaded',
      description: 'Your HMR report has been uploaded.',
    });
  };

  const handleReportUploadSuccess = async () => {
    if (!id) return;

    try {
      const response = await referralsApi.getById(id);
      if (response.data) {
        setReferral(transformApiReferralToReferral(response.data));

        toast({
          title: 'Report uploaded',
          description: 'The HMR report has been successfully uploaded and is now available for viewing',
        });
      }
    } catch (error) {
      console.error('Failed to refresh referral details:', error);
    }
  };

  const handleGoToMessages = async () => {
    if (!id) return;
      navigate(`/referrals/${id}/messages`);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMM yyyy, h:mm a');
  };

  const canViewReportType = (reportType: string) => {
    if (reportType === 'ReferralDocument') {
      if (user?.role === 'Admin' || user?.role === 'GP' || user?.role === 'Clinic' || user?.role === 'Pharmacy') {
        return true;
      }

      if (user?.role === 'Pharmacist' && 
          referral?.status && 
          (referral.status.toLowerCase() === 'accepted' || referral.status.toLowerCase() === 'completed')) {
        return true;
      }

      return false;
    }

    if (reportType === 'HMRReport') {
      return true;
    }

    return false;
  };

  const getReportsOfType = (reportType: string) => {
    if (!referral?.report) return [];

    if (Array.isArray(referral.report)) {
      return referral.report.filter(r => r.reportType === reportType);
    } else if (referral.report.reportType === reportType) {
      return [referral.report];
    }

    return [];
  };

  const hasHmrReport = referral?.report && 
    (Array.isArray(referral.report) 
      ? referral.report.some(r => r.reportType === 'HMRReport')
      : referral.report.reportType === 'HMRReport');

  const hasReferralDocument = referral?.report && 
    (Array.isArray(referral.report) 
      ? referral.report.some(r => r.reportType === 'ReferralDocument')
      : referral.report.reportType === 'ReferralDocument');

  const showMessageButton = canAccessMessages && 
    (user?.role === 'Admin' || user?.role === 'admin' || 
     user?.role === 'Pharmacist' || user?.role === 'pharmacist' ||
     (canViewMessagesAsGP && referral?.status && 
      (referral.status.toLowerCase() === 'accepted' || 
       referral.status.toLowerCase() === 'completed')));

  const handleDeleteReport = async (reportId: string | number, reportType: 'HMRReport' | 'ReferralDocument') => {
    setReportToDelete({ id: reportId, type: reportType });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      await reportsApi.deleteReport(reportToDelete.id, reportToDelete.type);
      
      const response = await referralsApi.getById(id as string);
      if (response.data) {
        setReferral(transformApiReferralToReferral(response.data));
      }

      toast({
        title: 'Success',
        description: 'Report deleted successfully',
        variant: 'default',
        style: { backgroundColor: '#10B981', color: 'white' }
      });
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message,
        variant: 'destructive'
      });
    } finally {
      setShowDeleteDialog(false);
      setReportToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading referral details...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!referral) {
    return (
      <DashboardLayout>
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Referral Not Found</h1>
            <p className="text-muted-foreground">
              The requested referral could not be found.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const openPdfInNewTab = (fileUrl: string) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      toast({
        title: 'Error',
        description: 'PDF file URL not available',
        variant: 'destructive',
      });
    }
  };

  const referralDocuments = getReportsOfType('ReferralDocument');
  const hmrReports = getReportsOfType('HMRReport');

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
    {/* Left side with back button and title - centered on mobile */}
    <div className="flex flex-col items-center sm:flex-row sm:items-center">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mr-0 sm:mr-4 w-fit">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="mt-2 sm:mt-0 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Referral Details</h1>
        <div className="flex items-center justify-center sm:justify-start mt-1">
          <StatusBadge status={referral.status} />
          <span className="text-muted-foreground ml-2 text-sm sm:text-base">
            Referral ID: #{referral.id}
          </span>
        </div>
      </div>
    </div>
    
    {/* Messages button - centered on mobile */}
    {showMessageButton && (
      <Button 
        onClick={handleGoToMessages} 
        variant="outline" 
        className="flex items-center gap-2 w-fit"
      >
        <MessageCircle className="h-4 w-4" />
        Messages
        {unreadMessageCount > 0 && (
          <Badge variant="destructive" className="ml-1 text-xs rounded-full h-5 w-5 flex items-center justify-center p-0">
            {unreadMessageCount}
          </Badge>
        )}
      </Button>
    )}
        </div>
        {showStripeCheckout && (
          <StripeCheckout 
            isOpen={showStripeCheckout}
            onClose={() => setShowStripeCheckout(false)}
            amount={rateConfig.pharmacistPaymentAmount || 500}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {showUploadDialog && id && (
          <UploadReportDialog
            isOpen={showUploadDialog}
            onClose={() => setShowUploadDialog(false)}
            referralId={id}
            onSuccess={handleReportUploadSuccess}
          />
        )}

        {user?.role === 'Pharmacist' && referral.status.toLowerCase() === 'submitted' && (
          <Alert className="bg-blue-50 border-blue-200">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <AlertTitle>Payment Required</AlertTitle>
            <AlertDescription>
              Accepting this referral requires a payment of ${rateConfig.pharmacistPaymentAmount || 500}. 
              You will be prompted to make this payment when you click "Accept Referral".
            </AlertDescription>
          </Alert>
        )}

        {user?.role === 'Pharmacy' && referral.status.toLowerCase() === 'completed' && (
          <Alert className="bg-green-50 border-green-200">
            <DollarSign className="h-4 w-4 text-green-600" />
            <AlertTitle>Payout Information</AlertTitle>
            <AlertDescription>
              A payout of ${rateConfig.pharmacyPayoutAmount || 400} for this completed HMR has been initiated to your registered bank account.
              Payouts are processed weekly.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Patient Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <User className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                        <div>
                          <p className="font-medium">{referral.patient.name}</p>
                          <p className="text-sm text-gray-500">Patient Name</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {referral.patient.suburb}, {referral.patient.state} {referral.patient.postcode}
                          </p>
                          <p className="text-sm text-gray-500">Location</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Doctor Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <User className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                        <div>
                          <p className="font-medium">{referral.doctor.name}</p>
                          <p className="text-sm text-gray-500">Doctor Name</p>
                        </div>
                      </div>

                      {referral.doctor.providerNumber && (
                        <div className="flex items-start">
                          <CalendarIcon className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                          <div>
                            <p className="font-medium">{referral.doctor.providerNumber}</p>
                            <p className="text-sm text-gray-500">Provider Number</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Referral Details</h3>

                  <div>
                    <p className="font-medium">Reason:</p>
                    <p className="mt-1">{referral.reason}</p>
                  </div>

                  {referral.notes && (
                    <div>
                      <p className="font-medium">Additional Notes:</p>
                      <p className="mt-1 text-gray-700">{referral.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {referralDocuments.length > 0 && canViewReportType('ReferralDocument') && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Referral Document
                  </CardTitle>
                  <CardDescription>
                    Referral document uploaded by the doctor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {referralDocuments.map((report, index) => (
                    <div 
                      key={`referral-doc-${index}`}
                      className="border rounded-md p-4 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-primary/10 p-2">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{report.fileName || 'Referral Document.pdf'}</h4>
                            <p className="text-sm text-gray-500">
                              {report.fileSize ? `${Math.round(report.fileSize / 1024)} KB • ` : ''}
                              Uploaded on {format(new Date(report.uploadDate || new Date()), 'dd MMM yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => openPdfInNewTab(report.filePath)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Open PDF
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click to open the PDF document</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          {canDeleteReports && referral.status.toLowerCase() !== 'completed' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteReport(report.id, 'ReferralDocument')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete document</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {hmrReports.length > 0 && canViewReportType('HMRReport') && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    HMR Report
                  </CardTitle>
                  <CardDescription>
                    Home Medicine Review report uploaded by the pharmacist
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hmrReports.map((report, index) => (
                    <div 
                      key={`hmr-report-${index}`}
                      className="border rounded-md p-4 bg-green-50 hover:bg-green-100 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-green-600/10 p-2">
                            <FileText className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{report.fileName || 'HMR Report.pdf'}</h4>
                            <p className="text-sm text-gray-500">
                              {report.fileSize ? `${Math.round(report.fileSize / 1024)} KB • ` : ''}
                              Uploaded on {format(new Date(report.uploadDate || new Date()), 'dd MMM yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => openPdfInNewTab(report.filePath)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Open HMR Report
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click to open the HMR report</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          {canDeleteReports && referral.status.toLowerCase() !== 'completed' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteReport(report.id, 'HMRReport')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete report</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="rounded-full h-8 w-8 bg-amber-100 flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Referral Submitted</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(referral.createdAt)}
                      </p>
                    </div>
                  </div>

                  {referral.acceptedAt && (
                    <div className="flex items-start">
                      <div className="rounded-full h-8 w-8 bg-blue-100 flex items-center justify-center mr-3">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Referral Accepted</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(referral.acceptedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {referral.completedAt && (
                    <div className="flex items-start">
                      <div className="rounded-full h-8 w-8 bg-green-100 flex items-center justify-center mr-3">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">HMR Completed</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(referral.completedAt)}
                        </p>
                        {user?.role === 'Pharmacy' && (
                          <p className="text-xs text-green-600 mt-1">
                            Payout of ${rateConfig.pharmacyPayoutAmount || 400} initiated
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user?.role === 'Pharmacist' && referral.status.toLowerCase() === 'submitted' && (
                  <Button 
                    className="w-full" 
                    onClick={handleAcceptReferral}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Accept Referral (${rateConfig.pharmacistPaymentAmount || 500})
                      </>
                    )}
                  </Button>
                )}

                {referral.status.toLowerCase() === 'accepted' && canAcceptReferrals && (
                  <>
                    {!hasHmrReport ? (
                      <Button 
                        className="w-full" 
                        onClick={() => setShowUploadDialog(true)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Report
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleCompleteReferral} 
                        disabled={isSubmitting}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </>
                )}

                {canViewPdf && !hasReferralDocument && (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      setShowUploadDialog(true);
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Referral Document
                  </Button>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        if (!open) {
          setShowDeleteDialog(false);
          setReportToDelete(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setReportToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ReferralDetail;
