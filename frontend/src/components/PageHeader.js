import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const PageHeader = ({ title }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <div className="mb-6 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-df-primary dark:text-white">
        {title}
      </h2>
      <Link
        to="/dftasks/profile"
        className="text-df-primary hover:text-df-primary/80 dark:text-df-accent dark:hover:text-df-accent/80"
      >
        {firstName}
      </Link>
    </div>
  );
};

export default PageHeader;
