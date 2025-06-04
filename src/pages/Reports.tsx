import React from "react";
import { 
  BarChart2, 
  LogIn, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ShoppingCart,
  Clock,
  Layout,
  DollarSign,
  Wallet,
  PieChart,
  RefreshCw,
  Calendar
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const reports = [
  {
    title: "Sales Report",
    description: "Summary of the sales made",
    icon: BarChart2,
    color: "bg-blue-500",
    route: "/reports/sales",
    active: true
  },
  {
    title: "Entity Sales Report",
    description: "Summary of the products sold",
    icon: ShoppingCart,
    color: "bg-yellow-500",
    route: "/reports/entity-sales"
  },
  {
    title: "Modifier Sales Report",
    description: "Summary of Modifier Sales",
    icon: PieChart,
    color: "bg-purple-500",
    route: "/reports/modifier-sales",
    active: true
  },
  {
    title: "Login Report",
    description: "Summary of the login activities",
    icon: LogIn,
    color: "bg-orange-500",
    route: "/reports/login",
    active: true
  },
  {
    title: "Cash & Card Reports",
    description: "Summary of cash & card transactions",
    icon: CreditCard,
    color: "bg-pink-500",
    route: "/reports/cash-card",
    active: true
  },
  {
    title: "Hourly Sales Report",
    description: "Summary of hourly sales",
    icon: Clock,
    color: "bg-purple-500",
    route: "/reports/hourly-sales"
  },
  {
    title: "Top Performers Report",
    description: "Summary of top performers",
    icon: Users,
    color: "bg-emerald-500",
    route: "/reports/top-performers",
    active: true
  },
  {
    title: "Refund Report",
    description: "Summary of refunds",
    icon: RefreshCw,
    color: "bg-cyan-500",
    route: "/reports/refund",
    active: true
  },
  {
    title: "Everyday Sales Report",
    description: "Summary of everyday sales",
    icon: TrendingUp,
    color: "bg-teal-500",
    route: "/reports/everyday-sales",
    active: true
  },
  {
    title: "Cashup Report",
    description: "Summary of cashup",
    icon: DollarSign,
    color: "bg-red-400",
    route: "/reports/cashup"
  },
  {
    title: "Advance Cash Report",
    description: "Summary of Advance Cashup",
    icon: Wallet,
    color: "bg-lime-500",
    route: "/reports/advance-cash"
  },
  {
    title: "Category Sales Report",
    description: "Summary of Category Sales",
    icon: Layout,
    color: "bg-orange-400",
    route: "/reports/category-sales"
  },
  {
    title: "Cloak In Out Report",
    description: "Summary of staff attendance",
    icon: Calendar,
    color: "bg-indigo-500",
    route: "/reports/attendance",
    active: true
  }
];

const Reports = () => {
  const navigate = useNavigate();

  const handleReportClick = (report: any) => {
    navigate(report.route);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card 
            key={report.title}
            className={`flex items-start p-4 hover:shadow-lg transition-shadow cursor-pointer ${report.active ? 'border-l-4 border-l-[#9b87f5]' : ''}`}
            onClick={() => handleReportClick(report)}
          >
            <div className={`${report.color} p-3 rounded-lg mr-4`}>
              <report.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{report.title}</h3>
              <p className="text-sm text-gray-500">{report.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
