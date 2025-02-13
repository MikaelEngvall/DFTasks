import React from "react";
import { useTranslation } from "react-i18next";

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-df-primary dark:text-white">
        {title}
      </h2>
    </div>
  );
};

export default PageHeader; 