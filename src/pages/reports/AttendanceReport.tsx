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
  user_name: string;
  user_role: string;
  user_email: string;
  days_present: number;
  total_hours_formatted: string;
  date?: string;
  clock_in?: string;
  clock_out?: string;
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
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriodOption>('custom');
  const [selectedStaff, setSelectedStaff] = useState('0');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('summary');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<DetailUser | null>(null);

  const { data: attendanceData, isLoading, error, fetchReport } = useAttendanceReport();
  const { staff, loading: staffLoading } = useStaffMembers();

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
    fetchReport({
      view_type: 'custom',
      format: 'summary',
      per_page: 1000,
      location_id: selectedLocation === "0" ? undefined : selectedLocation,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd')
    });
  }, [fetchReport, selectedLocation, startDate, endDate, selectedFormat, selectedTimePeriod]);

  const handleBack = () => {
    navigate("/reports");
  };

  const handleRefresh = () => {
    fetchReport({
      view_type: 'custom',
      format: 'summary',
      per_page: 1000,
      location_id: selectedLocation === "0" ? undefined : selectedLocation,
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
        csv += `"${row.date ? format(new Date(row.date), 'yyyy-MM-dd') : ''}","${row.user_name || ''}","${row.user_role || ''}","${row.user_email || ''}","${row.clock_in ? format(new Date(row.clock_in), 'HH:mm') : ''}","${row.clock_out ? format(new Date(row.clock_out), 'HH:mm') : ''}","${row.total_hours_formatted ?? ''}"\n`;
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
        date: row.date ? format(new Date(row.date), 'yyyy-MM-dd') : '',
        clock_in: row.clock_in ? format(new Date(row.clock_in), 'HH:mm') : '',
        clock_out: row.clock_out ? format(new Date(row.clock_out), 'HH:mm') : '',
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
      csv += `"${rec.date ? format(new Date(rec.date), 'yyyy-MM-dd') : ''}","${rec.clock_in ? format(new Date(rec.clock_in), 'HH:mm') : ''}","${rec.clock_out ? format(new Date(rec.clock_out), 'HH:mm') : ''}","${rec.total_hours_formatted ?? ''}"\n`;
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
      date: rec.date ? format(new Date(rec.date), 'yyyy-MM-dd') : '',
      clock_in: rec.clock_in ? format(new Date(rec.clock_in), 'HH:mm') : '',
      clock_out: rec.clock_out ? format(new Date(rec.clock_out), 'HH:mm') : '',
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
              <SelectItem value="0">All Locations</SelectItem>
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
          <Select value={selectedStaff} onValueChange={setSelectedStaff} disabled={staffLoading}>
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
            onValueChange={(value: ReportFormat) => setSelectedFormat(value)}
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
                      <Button variant="ghost" size="icon" className="p-1"><Eye className="h-5 w-5 text-[#9b87f5]" /></Button>
                    </td>
                  </tr>
                ))
              ) : (
                tableData.map((row: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{row.date ? format(new Date(row.date), 'yyyy-MM-dd') : '-'}</td>
                    <td className="px-4 py-2">{row.user_name || '-'}</td>
                    <td className="px-4 py-2">{row.user_role || '-'}</td>
                    <td className="px-4 py-2">{row.user_email || '-'}</td>
                    <td className="px-4 py-2 text-center">{row.clock_in ? format(new Date(row.clock_in), 'HH:mm') : '-'}</td>
                    <td className="px-4 py-2 text-center">{row.clock_out ? format(new Date(row.clock_out), 'HH:mm') : '-'}</td>
                    <td className="px-4 py-2 text-center">{row.total_hours_formatted ?? '-'}</td>
                    <td className="px-4 py-2 text-center">
                      <Button variant="ghost" size="icon" className="p-1"><Eye className="h-5 w-5 text-[#9b87f5]" /></Button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceReport; 