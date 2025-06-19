import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ArrowLeft, RefreshCw, Download, Eye, Printer, PrinterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useGetRestaurants } from '@/hooks/useGetRestaurants';
import { useAttendanceReport } from '@/hooks/useAttendanceReport';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useStaffMembers } from '@/hooks/useStaffMembers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DailyRecord {
  date: string;
  clock_in: string;
  clock_out: string;
  total_hours_formatted: string;
}

interface DetailUser {
  user_name: string;
  daily_records: DailyRecord[];
}

interface TableRow {
  user_id?: string;
  user_name: string;
  user_role: string;
  user_email: string;
  days_present: number;
  total_hours_formatted: string;
  date?: string;
  clock_in?: string;
  clock_out?: string;
  daily_records?: DailyRecord[];
}

interface AttendanceReportResponse {
  report: TableRow[];
}

type ViewType = 'custom' | 'today' | 'week' | 'month';
type ReportFormat = 'summary' | 'daily';
type TimePeriodOption = 'custom' | 'today' | 'this_week' | 'this_month';

const timePeriodOptions = [
  { value: 'custom' as TimePeriodOption, label: 'Custom Range' },
  { value: 'today' as TimePeriodOption, label: 'Today' },
  { value: 'this_week' as TimePeriodOption, label: 'This Week' },
  { value: 'this_month' as TimePeriodOption, label: 'This Month' },
];
const staffMemberOptions = [
  { value: '0', label: 'All Staff' },
];
const formatOptions = [
  { value: 'summary' as ReportFormat, label: 'Summary View' },
  { value: 'daily' as ReportFormat, label: 'Daily View' },
];

const AttendanceReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { restaurants: locations } = useGetRestaurants();
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriodOption>('custom');
  const [selectedStaff, setSelectedStaff] = useState('0');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('summary');
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<DetailUser | null>(null);

  const { data: attendanceData, isLoading, error, fetchReport } = useAttendanceReport();
  const { staff, loading: staffLoading } = useStaffMembers();

  // Set the first restaurant as default when locations are loaded
  useEffect(() => {
    if (locations && locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0].id.toString());
    }
  }, [locations, selectedLocation]);

  // Map selectedTimePeriod to API view_type
  const getViewType = (selectedTimePeriod: TimePeriodOption): ViewType => {
    switch (selectedTimePeriod) {
      case 'today': return 'today';
      case 'this_week': return 'week';
      case 'this_month': return 'month';
      case 'custom': default: return 'custom';
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      fetchReport({
        view_type: 'custom',
        format: selectedFormat,
        per_page: 1000,
        location_id: selectedLocation,
        user_id: selectedStaff !== '0' ? selectedStaff : undefined,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd')
      });
    }
  }, [fetchReport, selectedLocation, startDate, endDate, selectedFormat, selectedTimePeriod, selectedStaff]);

  const handleBack = () => {
    navigate("/reports");
  };

  const handleRefresh = () => {
    fetchReport({
      view_type: 'custom',
      format: selectedFormat,
      per_page: 1000,
      location_id: selectedLocation,
      user_id: selectedStaff !== '0' ? selectedStaff : undefined,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd')
    });
    toast({ 
      title: "Refreshing data...",
      description: "Please wait while we fetch the latest data."
    });
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  const handleStaffChange = (value: string) => {
    setSelectedStaff(value);
  };

  const handleFormatChange = (value: ReportFormat) => {
    setSelectedFormat(value);
  };

  // Handle time period change
  const handleTimePeriodChange = (value: TimePeriodOption) => {
    setSelectedTimePeriod(value);
    if (value === 'today') {
      setStartDate(startOfToday());
      setEndDate(endOfToday());
    } else if (value === 'this_week') {
      setStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
      setEndDate(endOfWeek(new Date(), { weekStartsOn: 1 }));
    } else if (value === 'this_month') {
      setStartDate(startOfMonth(new Date()));
      setEndDate(endOfMonth(new Date()));
    }
    // For custom, do not change dates
  };

  // CSV Download for main table
  const handleDownloadCSV = () => {
    if (!tableData || tableData.length === 0) {
      toast({ 
        title: 'No data to export',
        description: 'Please select a valid date range and try again.'
      });
      return;
    }
    let csv = '';
    if (selectedFormat === 'summary') {
      csv += 'Employee Name,Role,Email,Days Present,Total Hours\n';
      tableData.forEach((row: TableRow) => {
        csv += `"${row.user_name || ''}","${row.user_role || ''}","${row.user_email || ''}","${row.days_present ?? ''}","${row.total_hours_formatted ?? ''}"\n`;
      });
    } else {
      csv += 'Date,Employee Name,Role,Email,Clock In,Clock Out,Total Hours\n';
      tableData.forEach((row: TableRow) => {
        const formatDate = (dateStr: string) => {
          try {
            return format(new Date(dateStr), 'yyyy-MM-dd');
          } catch (error) {
            return dateStr || '';
          }
        };
        
        const formatTime = (timeStr: string) => {
          try {
            return format(new Date(timeStr), 'HH:mm');
          } catch (error) {
            return timeStr || '';
          }
        };
        
        csv += `"${formatDate(row.date || '')}","${row.user_name || ''}","${row.user_role || ''}","${row.user_email || ''}","${formatTime(row.clock_in || '')}","${formatTime(row.clock_out || '')}","${row.total_hours_formatted ?? ''}"\n`;
      });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AttendanceReport.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // PDF Download/Print for main table
  const handleDownloadPDF = async (print = false) => {
    if (!attendanceData || !('report' in attendanceData) || !Array.isArray(attendanceData.report) || attendanceData.report.length === 0) {
      toast({ 
        title: 'No data to export',
        description: 'Please select a valid date range and try again.'
      });
      return;
    }
    const doc = new jsPDF();
    let columns = [];
    let rows = [];
    if (selectedFormat === 'summary') {
      columns = [
        { header: 'Employee Name', dataKey: 'user_name' },
        { header: 'Role', dataKey: 'user_role' },
        { header: 'Email', dataKey: 'user_email' },
        { header: 'Days Present', dataKey: 'days_present' },
        { header: 'Total Hours', dataKey: 'total_hours_formatted' },
      ];
      rows = attendanceData.report;
    } else {
      columns = [
        { header: 'Date', dataKey: 'date' },
        { header: 'Employee Name', dataKey: 'user_name' },
        { header: 'Role', dataKey: 'user_role' },
        { header: 'Email', dataKey: 'user_email' },
        { header: 'Clock In', dataKey: 'clock_in' },
        { header: 'Clock Out', dataKey: 'clock_out' },
        { header: 'Total Hours', dataKey: 'total_hours_formatted' },
      ];
      rows = attendanceData.report.map((row: TableRow) => ({
        ...row,
        date: row.date ? (() => {
          try {
            return format(new Date(row.date), 'yyyy-MM-dd');
          } catch (error) {
            return row.date || '';
          }
        })() : '',
        clock_in: row.clock_in ? (() => {
          try {
            return format(new Date(row.clock_in), 'HH:mm');
          } catch (error) {
            return row.clock_in || '';
          }
        })() : '',
        clock_out: row.clock_out ? (() => {
          try {
            return format(new Date(row.clock_out), 'HH:mm');
          } catch (error) {
            return row.clock_out || '';
          }
        })() : '',
      }));
    }
    doc.text('Attendance Report', 14, 15);
    (doc as any).autoTable({
      head: [columns.map(col => col.header)],
      body: rows.map(row => columns.map(col => row[col.dataKey])),
      startY: 20,
      styles: { fontSize: 9 }
    });
    if (print) {
      doc.output('dataurlnewwindow');
    } else {
      doc.save('AttendanceReport.pdf');
    }
  };

  // CSV Download for detail dialog
  const handleDetailCSV = () => {
    if (!detailUser || !detailUser.daily_records || detailUser.daily_records.length === 0) {
      toast({ 
        title: 'No data to export',
        description: 'Please select a valid date range and try again.'
      });
      return;
    }
    let csv = 'Date,Clock In,Clock Out,Total Hours\n';
    detailUser.daily_records.forEach((rec: DailyRecord) => {
      const formatDate = (dateStr: string) => {
        try {
          return format(new Date(dateStr), 'yyyy-MM-dd');
        } catch (error) {
          return dateStr || '';
        }
      };
      
      const formatTime = (timeStr: string) => {
        try {
          return format(new Date(timeStr), 'HH:mm');
        } catch (error) {
          return timeStr || '';
        }
      };
      
      csv += `"${formatDate(rec.date || '')}","${formatTime(rec.clock_in || '')}","${formatTime(rec.clock_out || '')}","${rec.total_hours_formatted ?? ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AttendanceDetail_${detailUser.user_name || 'user'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // PDF Download/Print for detail dialog
  const handleDetailPDF = async (print = false) => {
    if (!detailUser || !detailUser.daily_records || detailUser.daily_records.length === 0) {
      toast({ 
        title: 'No data to export',
        description: 'Please select a valid date range and try again.'
      });
      return;
    }
    const doc = new jsPDF();
    const columns = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Clock In', dataKey: 'clock_in' },
      { header: 'Clock Out', dataKey: 'clock_out' },
      { header: 'Total Hours', dataKey: 'total_hours_formatted' },
    ];
    const rows = detailUser.daily_records.map((rec: DailyRecord) => ({
      ...rec,
      date: rec.date ? (() => {
        try {
          return format(new Date(rec.date), 'yyyy-MM-dd');
        } catch (error) {
          return rec.date || '';
        }
      })() : '',
      clock_in: rec.clock_in ? (() => {
        try {
          return format(new Date(rec.clock_in), 'HH:mm');
        } catch (error) {
          return rec.clock_in || '';
        }
      })() : '',
      clock_out: rec.clock_out ? (() => {
        try {
          return format(new Date(rec.clock_out), 'HH:mm');
        } catch (error) {
          return rec.clock_out || '';
        }
      })() : '',
    }));
    doc.text(`Attendance Details: ${detailUser.user_name || ''}`, 14, 15);
    (doc as any).autoTable({
      head: [columns.map(col => col.header)],
      body: rows.map(row => columns.map(col => row[col.dataKey])),
      startY: 20,
      styles: { fontSize: 9 }
    });
    if (print) {
      doc.output('dataurlnewwindow');
    } else {
      doc.save(`AttendanceDetail_${detailUser.user_name || 'user'}.pdf`);
    }
  };

  // Use attendanceData.report for table data
  const tableData = ((attendanceData as unknown) as AttendanceReportResponse)?.report || [];

  const handlePrint = () => {
    window.print();
  };

  const handleViewDetails = (row: any) => {
    // For summary view, show all records for this user from the current data
    if (selectedFormat === 'summary') {
      // Use the daily_records from the API response if available
      if (row.daily_records && row.daily_records.length > 0) {
        const dailyRecords = row.daily_records.map((record: any) => ({
          date: record.date || '',
          clock_in: record.clock_in || '',
          clock_out: record.clock_out || '',
          total_hours_formatted: record.total_hours_formatted || ''
        }));

        setDetailUser({
          user_name: row.user_name || 'Unknown User',
          daily_records: dailyRecords
        });
      } else {
        // If no detailed records found, show summary info
        setDetailUser({
          user_name: row.user_name || 'Unknown User',
          daily_records: [{
            date: 'Summary',
            clock_in: `Days Present: ${row.days_present || 0}`,
            clock_out: `Role: ${row.user_role || 'N/A'}`,
            total_hours_formatted: row.total_hours_formatted || ''
          }]
        });
      }
    } else {
      // For daily view, show the specific record details
      setDetailUser({
        user_name: row.user_name || 'Unknown User',
        daily_records: [{
          date: row.date || '',
          clock_in: row.clock_in || '',
          clock_out: row.clock_out || '',
          total_hours_formatted: row.total_hours_formatted || ''
        }]
      });
    }
  };

  return (
    <div className="p-6 print-container">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print-container,
          .print-container * {
            visibility: visible;
          }
          
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-header {
            display: block !important;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }
          
          .print-table th {
            background-color: #d1d5db !important;
            color: #111827 !important;
            font-weight: bold;
          }
          
          .print-table .text-right {
            text-align: right;
          }
          
          .print-info {
            margin-bottom: 15px;
            font-size: 14px;
          }
        }
        `
      }} />

      {/* Print Header - Only visible when printing */}
      <div className="print-header" style={{ display: 'none' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Cloak In Out Report</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print">
        {/* Time Period */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Time Period</span>
          <Select value={selectedTimePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Custom Range" />
            </SelectTrigger>
            <SelectContent>
              {timePeriodOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTimePeriod === 'custom' && (
          <>
            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Start Date</span>
              <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "yyyy-MM-dd") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setIsStartDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">End Date</span>
              <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "yyyy-MM-dd") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setIsEndDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}

        {/* Location Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Location</span>
          <Select value={selectedLocation} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Staff Member Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Staff Member</span>
          <Select value={selectedStaff} onValueChange={handleStaffChange} disabled={staffLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Staff</SelectItem>
              {staff.map((member) => (
                <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Format</span>
          <Select
            value={selectedFormat}
            onValueChange={handleFormatChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-end gap-2 lg:col-span-2 sm:col-span-2">
          <Button variant="outline" onClick={handleDownloadCSV} className="w-10 h-10 p-0" title="Download CSV">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handlePrint} className="w-10 h-10 p-0" title="Print">
            <PrinterIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="w-10 h-10 p-0" title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            {selectedFormat === 'summary' ? (
              <tr className="bg-[#0F172A] text-white">
                <th className="px-4 py-2 text-left font-semibold rounded-tl-lg">Employee Name</th>
                <th className="px-4 py-2 text-left font-semibold">Role</th>
                <th className="px-4 py-2 text-left font-semibold">Email</th>
                <th className="px-4 py-2 text-center font-semibold">Days Present</th>
                <th className="px-4 py-2 text-center font-semibold">Total Hours</th>
                <th className="px-4 py-2 text-center font-semibold rounded-tr-lg"></th>
              </tr>
            ) : (
              <tr className="bg-[#0F172A] text-white">
                <th className="px-4 py-2 text-left font-semibold rounded-tl-lg">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Employee Name</th>
                <th className="px-4 py-2 text-left font-semibold">Role</th>
                <th className="px-4 py-2 text-left font-semibold">Email</th>
                <th className="px-4 py-2 text-center font-semibold">Clock In</th>
                <th className="px-4 py-2 text-center font-semibold">Clock Out</th>
                <th className="px-4 py-2 text-center font-semibold">Total Hours</th>
                <th className="px-4 py-2 text-center font-semibold rounded-tr-lg"></th>
              </tr>
            )}
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={selectedFormat === 'summary' ? 6 : 8} className="text-center py-8">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={selectedFormat === 'summary' ? 6 : 8} className="text-center text-red-500 py-8">Error loading attendance report: {error.message}</td></tr>
            ) : tableData.length === 0 ? (
              <tr><td colSpan={selectedFormat === 'summary' ? 6 : 8} className="text-center py-8">No data found</td></tr>
            ) : (
              selectedFormat === 'summary' ? (
                tableData.map((row: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{row.user_name || '-'}</td>
                    <td className="px-4 py-2">{row.user_role || '-'}</td>
                    <td className="px-4 py-2">{row.user_email || '-'}</td>
                    <td className="px-4 py-2 text-center">{row.days_present ?? '-'}</td>
                    <td className="px-4 py-2 text-center">{row.total_hours_formatted ?? '-'}</td>
                    <td className="px-4 py-2 text-center">
                      <Button variant="ghost" size="icon" className="p-1" onClick={() => handleViewDetails(row)}><Eye className="h-5 w-5 text-[#9b87f5]" /></Button>
                    </td>
                  </tr>
                ))
              ) : (
                tableData.map((row: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {row.date ? (() => {
                        try {
                          return format(new Date(row.date), 'yyyy-MM-dd');
                        } catch (error) {
                          return row.date || '-';
                        }
                      })() : '-'}
                    </td>
                    <td className="px-4 py-2">{row.user_name || '-'}</td>
                    <td className="px-4 py-2">{row.user_role || '-'}</td>
                    <td className="px-4 py-2">{row.user_email || '-'}</td>
                    <td className="px-4 py-2 text-center">
                      {row.clock_in ? (() => {
                        try {
                          return format(new Date(row.clock_in), 'HH:mm');
                        } catch (error) {
                          return row.clock_in || '-';
                        }
                      })() : '-'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {row.clock_out ? (() => {
                        try {
                          return format(new Date(row.clock_out), 'HH:mm');
                        } catch (error) {
                          return row.clock_out || '-';
                        }
                      })() : '-'}
                    </td>
                    <td className="px-4 py-2 text-center">{row.total_hours_formatted ?? '-'}</td>
                    <td className="px-4 py-2 text-center">
                      <Button variant="ghost" size="icon" className="p-1" onClick={() => handleViewDetails(row)}><Eye className="h-5 w-5 text-[#9b87f5]" /></Button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Attendance Details - {detailUser?.user_name}
            </DialogTitle>
          </DialogHeader>
          
          {detailUser && (
            <div className="space-y-4">

              {/* Details Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left font-semibold">Date</th>
                      <th className="px-4 py-2 text-center font-semibold">Clock In</th>
                      <th className="px-4 py-2 text-center font-semibold">Clock Out</th>
                      <th className="px-4 py-2 text-center font-semibold">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailUser.daily_records.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">
                          No detailed records available for this user
                        </td>
                      </tr>
                    ) : (
                      detailUser.daily_records.map((record, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">
                            {record.date === 'Summary' ? 'Summary View' : 
                             record.date && record.date !== 'Summary' ? 
                               (() => {
                                 try {
                                   return format(new Date(record.date), 'yyyy-MM-dd');
                                 } catch (error) {
                                   return record.date || '-';
                                 }
                               })() : '-'}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {record.clock_in && record.clock_in.includes('Days Present') ? record.clock_in :
                             record.clock_in && record.clock_in !== 'N/A' ? 
                               (() => {
                                 try {
                                   return format(new Date(record.clock_in), 'HH:mm');
                                 } catch (error) {
                                   return record.clock_in || '-';
                                 }
                               })() : '-'}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {record.clock_out && record.clock_out.includes('Role') ? record.clock_out :
                             record.clock_out && record.clock_out !== 'N/A' ? 
                               (() => {
                                 try {
                                   return format(new Date(record.clock_out), 'HH:mm');
                                 } catch (error) {
                                   return record.clock_out || '-';
                                 }
                               })() : '-'}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {record.total_hours_formatted || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceReport; 