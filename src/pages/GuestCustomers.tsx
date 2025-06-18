
import React, { useState, useEffect } from 'react';
import { guestsApi, type Guest } from '@/services/api/guests';
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TablePagination,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const GuestCustomers: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [emailFilter, setEmailFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(1);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const response = await guestsApi.getGuests(
        currentPage,
        pageSize,
        statusFilter,
        '',
        emailFilter,
        phoneFilter
      );

      if (response && response.guests) {
        setGuests(response.guests);
        setTotalItems(response.total);
      } else {
        setGuests([]);
        setTotalItems(0);
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to fetch guests",
        variant: "destructive",
      });
      setGuests([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [currentPage, pageSize, statusFilter, emailFilter, phoneFilter]);

  const handleEmailFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePhoneFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(Number(value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchGuests();
    toast({ title: "Refreshing data..." });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1 min-w-[200px] max-w-[300px]">
            <Input
              placeholder="Filter by Email"
              value={emailFilter}
              onChange={handleEmailFilter}
              className="w-full"
            />
          </div>
          
          <div className="flex-1 min-w-[200px] max-w-[300px]">
            <Input
              placeholder="Filter by Phone"
              value={phoneFilter}
              onChange={handlePhoneFilter}
              className="w-full"
            />
          </div>
          
          <div className="flex-1 min-w-[200px] max-w-[300px]">
            <Select value={statusFilter.toString()} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="0">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#0F172A] hover:bg-[#0F172A]/90">
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Phone</TableHead>
              <TableHead className="text-white">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <span className="text-muted-foreground">Loading...</span>
                </TableCell>
              </TableRow>
            ) : guests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <span className="text-muted-foreground">No guests found</span>
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.phone_no}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      guest.status === 1 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {guest.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default GuestCustomers;
