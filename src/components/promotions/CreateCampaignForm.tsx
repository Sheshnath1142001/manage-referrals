import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { promotionsApi, CreateCampaignPayload } from "@/services/api/promotions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateCampaignFormProps {
  type: 'sms' | 'newsletter' | 'push_notification';
  onCancel: () => void;
  onCreated: () => void;
}

interface CustomerGroup {
  id: number;
  name: string;
}

// Sample customer groups data (in a real app, this would come from an API)
const sampleCustomerGroups: CustomerGroup[] = [
  { id: 30, name: "bikram-atish" },
  { id: 22, name: "Bikram-test" },
  { id: 29, name: "Final testing with 1 user" },
];

// Sample SMS templates
const smsTemplates = [
  {
    name: "Promotion",
    content: "🎉 Exclusive offer for our valued customers! Get 20% OFF your next purchase with code: SPECIAL20. Valid until [DATE]. Reply STOP to opt out."
  },
  {
    name: "Birthday",
    content: "Happy Birthday! 🎂 As a gift from us, enjoy a FREE [ITEM] with your next purchase. Valid until [DATE]. Show this message to redeem. Reply STOP to opt out."
  },
  {
    name: "Feedback",
    content: "We value your opinion! Please take a moment to share your experience with us: [FEEDBACK_LINK]. Reply STOP to opt out."
  }
];

// Sample Email template
const emailTemplate = `<!DOCTYPE html>
<html>
<head>
  <title>Monthly Newsletter</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4A90E2; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #ffffff; }
    .footer { background-color: #f3f3f3; padding: 15px; text-align: center; font-size: 12px; color: #888; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>[COMPANY NAME] Newsletter</h1>
      <p>Monthly Updates | [MONTH YEAR]</p>
    </div>
    <div class="content">
      <h2>Hello [CUSTOMER NAME],</h2>
      <p>Welcome to our monthly newsletter where we share the latest updates and offers!</p>
      
      <h3>🔥 What's New</h3>
      <p>We're excited to announce [NEW PRODUCT/SERVICE]. This new addition to our lineup will help you [BENEFIT].</p>
      
      <h3>📰 Latest Articles</h3>
      <ul>
        <li><a href="#">[ARTICLE TITLE 1]</a></li>
        <li><a href="#">[ARTICLE TITLE 2]</a></li>
        <li><a href="#">[ARTICLE TITLE 3]</a></li>
      </ul>
      
      <h3>🎁 Special Offers</h3>
      <p>This month, we're offering a special discount of [DISCOUNT]% on all [CATEGORY] products!</p>
      <p><a href="#" class="button">Shop Now</a></p>
      
      <h3>📆 Upcoming Events</h3>
      <p>[EVENT DETAILS]</p>
      
      <p>Thank you for being a valued customer!</p>
      <p>Best regards,<br>[YOUR NAME]<br>[COMPANY NAME]</p>
    </div>
    <div class="footer">
      <p>© [YEAR] [COMPANY NAME]. All rights reserved.</p>
      <p><a href="#">Unsubscribe</a> | <a href="#">View in Browser</a> | <a href="#">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`;

// Sample Push Notification templates
const pushTemplates = [
  {
    name: "App Update",
    content: "🚀 App Update Available: We've released v2.0 with exciting new features! Update now to try them out."
  },
  {
    name: "Order Status",
    content: "📦 Your order #[ORDER_ID] has been shipped! Track your delivery in real-time through our app."
  }
];

export function CreateCampaignForm({ type, onCancel, onCreated }: CreateCampaignFormProps) {
  const [formData, setFormData] = useState<CreateCampaignPayload>({
    name: '',
    description: '',
    type: type,
    content: '',
    status: 'active',
    customer_group_ids: []
  });
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>(sampleCustomerGroups);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  
  // Initialize content based on type
  useEffect(() => {
    if (type === 'newsletter' && !formData.content) {
      setFormData(prev => ({
        ...prev,
        content: emailTemplate
      }));
    }
  }, [type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectTemplate = (templateName: string) => {
    setSelectedTemplate(templateName);
    
    if (type === 'sms') {
      const template = smsTemplates.find(t => t.name === templateName);
      if (template) {
        setFormData(prev => ({
          ...prev,
          content: template.content
        }));
      }
    } else if (type === 'push_notification') {
      const template = pushTemplates.find(t => t.name === templateName);
      if (template) {
        setFormData(prev => ({
          ...prev,
          content: template.content
        }));
      }
    }
  };

  const handleCustomerGroupChange = (value: string) => {
    const id = parseInt(value);
    setFormData(prev => ({
      ...prev,
      customer_group_ids: [id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Campaign name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Content is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.customer_group_ids || formData.customer_group_ids.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one customer group",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await promotionsApi.createCampaign(formData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Campaign created successfully"
        });
        onCreated();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'sms':
        return 'Create SMS Campaign';
      case 'newsletter':
        return 'Create Email Campaign';
      case 'push_notification':
        return 'Create Push Notification';
      default:
        return 'Create Campaign';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          className="mr-2"
          onClick={onCancel}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter campaign name"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="customer_group">Customer Group</Label>
                <Select 
                  onValueChange={handleCustomerGroupChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a customer group" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerGroups.map(group => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter campaign description"
                className="mt-1"
                rows={2}
              />
            </div>
            
            {(type === 'sms' || type === 'push_notification') && (
              <div>
                <Label>Select Template</Label>
                <Select 
                  value={selectedTemplate}
                  onValueChange={handleSelectTemplate}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {type === 'sms' ? (
                      smsTemplates.map(template => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))
                    ) : (
                      pushTemplates.map(template => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder={`Enter ${type === 'sms' ? 'SMS' : type === 'newsletter' ? 'email' : 'push notification'} content`}
                className="mt-1 font-mono text-sm"
                rows={type === 'newsletter' ? 20 : 6}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1A1F2C]"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Campaign
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
