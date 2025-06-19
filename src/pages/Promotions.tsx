import { useState, useEffect } from "react";
import { 
  Tabs, 
  TabsContent, 
  SegmentedTabsList, 
  SegmentedTabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RefreshCw, Plus, MoreVertical, MessageSquare, Mail, Bell, Eye, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateCampaignForm } from "@/components/promotions/CreateCampaignForm";
import { CampaignDetailsDialog } from "@/components/promotions/CampaignDetailsDialog";
import { Campaign, promotionsApi } from "@/services/api/promotions";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const PromotionsPage = () => {
  const [activeTab, setActiveTab] = useState<"sms" | "newsletter">("sms");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campaignType, setCampaignType] = useState<'sms' | 'newsletter'>('sms');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignDetailsOpen, setCampaignDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<string | null>(null);
  
  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const response = await promotionsApi.getCampaigns({
        page: 1,
        limit: 10,
        search: '',
        type: activeTab
      });
      
      if (response.success) {
        setCampaigns(response.data.campaigns);
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to load campaigns. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [activeTab]);

  // Get icon based on campaign type
  const getCampaignIcon = (type: string) => {
    switch(type) {
      case 'sms':
        return <MessageSquare className="h-5 w-5" />;
      case 'newsletter':
        return <Mail className="h-5 w-5" />;
      // Push notification case commented out to hide push notifications
      /*
      case 'push_notification':
        return <Bell className="h-5 w-5" />;
      */
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  // Get status badge based on campaign status
  const getStatusBadge = (status: string) => {
    const statusKey = status.toLowerCase();
    
    switch(statusKey) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700">
            Draft
          </Badge>
        );
      case 'scheduled':
      case 'pending':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            Scheduled
          </Badge>
        );
      case 'active':
      case 'running':
        return (
          <Badge className="bg-[#1A1F2C] text-white">
            Active
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Completed
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700">
            Inactive
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const handleCreateCampaign = (type: 'sms' | 'newsletter') => {
    setCampaignType(type);
    setIsCreatingCampaign(true);
  };

  const handleCancelCreateCampaign = () => {
    setIsCreatingCampaign(false);
  };

  const handleViewCampaignDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCampaignDetailsOpen(true);
  };

  const handleRefresh = () => {
    fetchCampaigns();
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      setIsDeleting(id);
      const response = await promotionsApi.deleteCampaign(id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        });
        fetchCampaigns();
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to delete campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleResendCampaign = async (campaign: Campaign) => {
    try {
      setIsResending(campaign.id);
      const payload = {
        content: campaign.content,
        resend_target: campaign.target_type || 'customer_groups',
        customer_group_ids: campaign.customer_group_ids || [],
      };
      const response = await promotionsApi.resendCampaign(campaign.id, payload);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Campaign resent successfully',
        });
        fetchCampaigns();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend campaign. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  if (isCreatingCampaign) {
    return (
      <div className="p-6">
        <CreateCampaignForm 
          type={campaignType} 
          onCancel={handleCancelCreateCampaign}
          onCreated={() => {
            setIsCreatingCampaign(false);
            fetchCampaigns();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-4">
        <div>
          <div className="pb-2">
            <h1 className="text-2xl font-bold">Marketing Campaigns</h1>
            <p className="text-muted-foreground text-sm">Create and manage your marketing campaigns</p>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-bold">All Campaigns</h2>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button 
                className="bg-[#1A1F2C] text-white flex items-center gap-2"
                onClick={() => handleCreateCampaign(activeTab)}
              >
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          </div>

          <Tabs defaultValue="sms" value={activeTab} onValueChange={(value) => setActiveTab(value as 'sms' | 'newsletter')}>
            <SegmentedTabsList className="mb-6 flex flex-wrap overflow-x-auto">
              <SegmentedTabsTrigger value="sms" className="flex items-center justify-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                SMS Campaigns
              </SegmentedTabsTrigger>
              <SegmentedTabsTrigger value="newsletter" className="flex items-center justify-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Campaigns
              </SegmentedTabsTrigger>
              {/* Push Notification tab hidden - commented out
              <SegmentedTabsTrigger value="push_notification" className="flex items-center justify-center">
                <Bell className="h-5 w-5 mr-2" />
                Push Notifications
              </SegmentedTabsTrigger>
              */}
            </SegmentedTabsList>

            <TabsContent value={activeTab} className="m-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-lg text-gray-500 mb-4">No {activeTab === 'sms' ? 'SMS' : 'Email'} campaigns found</p>
                  <Button
                    className="bg-[#1A1F2C] text-white"
                    onClick={() => handleCreateCampaign(activeTab)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Campaign Name</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[230px]">Audience</TableHead>
                        <TableHead className="w-[150px]">Schedule</TableHead>
                        <TableHead className="w-[150px]">Stats</TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getCampaignIcon(campaign.type)}
                              <div>
                                <div>{campaign.name}</div>
                                <div className="text-xs text-gray-500">{campaign.description || 'No description'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              {campaign.customer_groups.length > 0 ? (
                                <>
                                  <span>
                                    {campaign.customer_groups.map(group => group.name).join(', ')}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {campaign.stats.total} recipients
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">All customers</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{formatDate(campaign.start_date)}</span>
                              <span className="text-sm text-muted-foreground">
                                {getTimeAgo(campaign.start_date)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {campaign.stats ? (
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <svg className="w-3 h-3 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>Sent: {campaign.stats.sent}</span>
                                </div>
                                {campaign.stats.failed > 0 && (
                                  <div className="flex items-center text-sm">
                                    <svg className="w-3 h-3 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>Failed: {campaign.stats.failed}</span>
                                  </div>
                                )}
                                {campaign.stats.opened > 0 && (
                                  <div className="flex items-center text-sm">
                                    <svg className="w-3 h-3 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Opened: {campaign.stats.opened}</span>
                                  </div>
                                )}
                                {campaign.stats.clicked > 0 && (
                                  <div className="flex items-center text-sm">
                                    <svg className="w-3 h-3 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>Clicked: {campaign.stats.clicked}</span>
                                </div>
                              )}
                              <div className="flex items-center text-sm">
                                <span className="mr-1">Success Rate:</span>
                                <span className={`${campaign.stats.success_rate > 50 ? 'text-green-500' : 'text-red-500'}`}> 
                                  {campaign.stats.success_rate.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No metrics yet</span>
                          )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  {isDeleting === campaign.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MoreVertical className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  className="py-2 cursor-pointer"
                                  onClick={() => handleViewCampaignDetails(campaign)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="py-2 cursor-pointer" onClick={() => handleResendCampaign(campaign)}>
                                  {isResending === campaign.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                  )}
                                  <span>Resend</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="py-2 cursor-pointer text-red-600"
                                  onClick={() => handleDeleteCampaign(campaign.id)}
                                  disabled={isDeleting === campaign.id}
                                >
                                  <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CampaignDetailsDialog 
        open={campaignDetailsOpen}
        onOpenChange={setCampaignDetailsOpen}
        campaign={selectedCampaign}
      />
    </div>
  );
};

export default PromotionsPage;
