import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogClose, 
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Mail, X, Download, MessageSquare, UserCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Campaign } from "@/services/api/promotions";
import { formatDistanceToNow } from "date-fns";

interface CampaignDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}

export function CampaignDetailsDialog({
  open,
  onOpenChange,
  campaign
}: CampaignDetailsDialogProps) {
  if (!campaign) return null;

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

  const getCampaignTypeIcon = (type: string) => {
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

  const getCampaignTypeLabel = (type: string) => {
    switch(type) {
      case 'sms':
        return 'SMS Campaign';
      case 'newsletter':
        return 'Email Campaign';
      // Push notification case commented out to hide push notifications
      /*
      case 'push_notification':
        return 'Push Notification';
      */
      default:
        return 'Campaign';
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getCampaignTypeIcon(campaign.type)}
            <DialogTitle className="text-xl">{campaign.name}</DialogTitle>
          </div>
          <DialogDescription className="flex items-center justify-between">
            <span>{getCampaignTypeLabel(campaign.type)}</span>
            {getStatusBadge(campaign.status)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Campaign Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <UserCheck className="h-4 w-4" />
                  <span>Created by:</span>
                </div>
                <p>{campaign.users?.name || 'Admin'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Created at:</span>
                </div>
                <p>{formatDate(campaign.created_at)} ({getTimeAgo(campaign.created_at)})</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Start date:</span>
                </div>
                <p>{formatDate(campaign.start_date)}</p>
              </div>
              
              {campaign.end_date && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>End date:</span>
                  </div>
                  <p>{formatDate(campaign.end_date)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Target Audience</h3>
            
            {campaign.customer_groups && campaign.customer_groups.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Customer Groups:</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.customer_groups.map(group => (
                    <Badge key={group.id} variant="outline" className="bg-gray-100">
                      {group.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">All customers</p>
            )}
            
            <div className="mt-2">
              <p className="text-sm text-gray-500">Total Recipients: {campaign.stats.total}</p>
            </div>
          </div>

          {/* Campaign Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Campaign Content</h3>
            
            {campaign.description && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Description:</p>
                <p>{campaign.description}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Content:</p>
              {campaign.type === 'newsletter' ? (
                <div className="border p-4 rounded-md max-h-[300px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none" 
                    dangerouslySetInnerHTML={{ __html: campaign.content }} 
                  />
                </div>
              ) : (
                <div className="border p-4 rounded-md bg-gray-50">
                  <p className="whitespace-pre-wrap">{campaign.content}</p>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Campaign Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-md p-4 text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{campaign.stats.total}</p>
              </div>
              
              <div className="border rounded-md p-4 text-center">
                <p className="text-sm text-gray-500">Sent</p>
                <p className="text-2xl font-bold text-green-600">{campaign.stats.sent}</p>
              </div>
              
              <div className="border rounded-md p-4 text-center">
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600">{campaign.stats.failed}</p>
              </div>
              
              <div className="border rounded-md p-4 text-center">
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className={`text-2xl font-bold ${campaign.stats.success_rate > 50 ? 'text-green-600' : 'text-red-600'}`}>
                  {campaign.stats.success_rate.toFixed(0)}%
                </p>
              </div>
            </div>
            
            {/* Recent History */}
            {campaign.recent_history && campaign.recent_history.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="font-medium">Recent Delivery History</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recipients
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delivery
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sent By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaign.recent_history.slice(0, 5).map((history) => (
                        <tr key={history.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {formatDate(history.sent_at)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {history.total_recipients}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{history.successful_deliveries} successful</span>
                            </div>
                            {history.failed_deliveries > 0 && (
                              <div className="flex items-center gap-1">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span>{history.failed_deliveries} failed</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {history.users?.name || 'Admin'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {campaign.recent_history.length > 5 && (
                    <div className="bg-gray-50 px-4 py-2 text-sm text-center text-gray-500">
                      + {campaign.recent_history.length - 5} more entries
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
