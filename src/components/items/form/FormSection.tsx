
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <div className="bg-white rounded-md p-4 border border-gray-100 shadow-sm">
      <h3 className="text-md font-medium mb-3 text-gray-700 border-b pb-2">{title}</h3>
      <div className="pt-1">
        {children}
      </div>
    </div>
  );
};
