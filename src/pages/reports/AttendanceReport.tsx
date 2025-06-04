import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ArrowLeft, RefreshCw, Download, Eye, Printer } from 'lucide-react';
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
import { useStaffMembers } from '@/hooks/useStaffMembers';

const timePeriodOptions = [
  { value: 'custom', label: 'Custom Range' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
];
const staffMemberOptions = [
  { value: '0', label: 'All Staff' },
];
const formatOptions = [
  { value: 'summary', label: 'Summary View' },
  { value: 'daily', label: 'Daily View' },
];

const AttendanceReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { restaurants: locations } = useGetRestaurants();
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('custom');
  const [selectedStaff, setSelectedStaff] = useState('0');
  const [selectedFormat, setSelectedFormat] = useState('summary');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  const { data: attendanceData, isLoading, error, fetchReport } = useAttendanceReport();
  const { staff, loading: staffLoading } = useStaffMembers();

  // Map selectedTimePeriod to API view_type
  const getViewType = (selectedTimePeriod: string) => {
    switch (selectedTimePeriod) {
      case 'today': return 'today';
      case 'this_week': return 'week';
      case 'this_month': return 'month';
      case 'custom': default: return 'custom';
    }
  };

  useEffect(() => {
    fetchReport({
      view_type: getViewType(selectedTimePeriod),
      format: selectedFormat,
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
      view_type: getViewType(selectedTimePeriod),
      format: selectedFormat,
      per_page: 1000,
      location_id: selectedLocation === "0" ? undefined : selectedLocation,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd')
    });
    toast({ title: "Refreshing data..." });
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  // Handle time period change
  const handleTimePeriodChange = (value: string) => {
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
      toast({ title: 'No data to export' });
      return;
    }
    let csv = '';
    if (selectedFormat === 'summary') {
      csv += 'Employee Name,Role,Email,Days Present,Total Hours\n';
      tableData.forEach((row: any) => {
        csv += `"${row.user_name || ''}","${row.user_role || ''}","${row.user_email || ''}","${row.days_present ?? ''}","${row.total_hours_formatted ?? ''}"\n`;
      });
    } else {
      csv += 'Date,Employee Name,Role,Email,Clock In,Clock Out,Total Hours\n';
      tableData.forEach((row: any) => {
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
    if (!attendanceData || attendanceData.report.length === 0) {
      toast({ title: 'No data to export' });
      return;
    }
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    if (typeof doc.autoTable !== 'function' && typeof autoTable === 'function') {
      autoTable(doc);
    }
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
      rows = attendanceData.report.map((row: any) => ({
        ...row,
        date: row.date ? format(new Date(row.date), 'yyyy-MM-dd') : '',
        clock_in: row.clock_in ? format(new Date(row.clock_in), 'HH:mm') : '',
        clock_out: row.clock_out ? format(new Date(row.clock_out), 'HH:mm') : '',
      }));
    }
    doc.text('Attendance Report', 14, 15);
    doc.autoTable({
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
      toast({ title: 'No data to export' });
      return;
    }
    let csv = 'Date,Clock In,Clock Out,Total Hours\n';
    detailUser.daily_records.forEach((rec: any) => {
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
      toast({ title: 'No data to export' });
      return;
    }
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    if (typeof doc.autoTable !== 'function' && typeof autoTable === 'function') {
      autoTable(doc);
    }
    const columns = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Clock In', dataKey: 'clock_in' },
      { header: 'Clock Out', dataKey: 'clock_out' },
      { header: 'Total Hours', dataKey: 'total_hours_formatted' },
    ];
    const rows = detailUser.daily_records.map((rec: any) => ({
      ...rec,
      date: rec.date ? format(new Date(rec.date), 'yyyy-MM-dd') : '',
      clock_in: rec.clock_in ? format(new Date(rec.clock_in), 'HH:mm') : '',
      clock_out: rec.clock_out ? format(new Date(rec.clock_out), 'HH:mm') : '',
    }));
    doc.text(`Attendance Details: ${detailUser.user_name || ''}`, 14, 15);
    doc.autoTable({
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
  const tableData = attendanceData?.report || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Cloak In Out Report</h1>
        </div>
        <div className="text-sm text-[#9b87f5] font-medium">
          ADMIN
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 items-end mb-4">
        {/* Time Period */}
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <span className="text-xs font-medium text-gray-600">Time Period</span>
          <Select value={selectedTimePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger>
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
            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <span className="text-xs font-medium text-gray-600">Start Date</span>
              <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate ? format(startDate, "yyyy-MM-dd") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        setIsStartDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* End Date */}
            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <span className="text-xs font-medium text-gray-600">End Date</span>
              <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate ? format(endDate, "yyyy-MM-dd") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setIsEndDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
        {/* Location Selector */}
        <div className="flex flex-col gap-1.5 min-w-[220px]">
          <span className="text-xs font-medium text-gray-600">Location</span>
          <Select value={selectedLocation} onValueChange={handleLocationChange}>
            <SelectTrigger>
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
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <span className="text-xs font-medium text-gray-600">Staff Member</span>
          <Select value={selectedStaff} onValueChange={setSelectedStaff} disabled={staffLoading}>
            <SelectTrigger>
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
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <span className="text-xs font-medium text-gray-600">Format</span>
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Summary View" />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={handleDownloadCSV} className="p-2"><Download className="h-5 w-5" /></Button>
          <Button variant="outline" onClick={handleRefresh} className="p-2"><RefreshCw className="h-5 w-5" /></Button>
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