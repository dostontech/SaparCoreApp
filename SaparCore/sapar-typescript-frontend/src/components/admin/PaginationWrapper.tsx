import React from "react";
import { Pagination } from "@mui/material";
import type { PaginationProps } from "@mui/material";
import { useTranslation } from "react-i18next";

interface PaginationWrapperProps extends Omit<PaginationProps, 'onChange'> {
  page: number;
  count: number;
  from: number;
  to: number;
  total: number;
  onChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  paginationVariant?: any;
  paginationShape?: 'rounded' | 'circular';
}

const PaginationWrapper: React.FC<PaginationWrapperProps> = ({
  page,
  count,
  from,
  to,
  total,
  onChange,
  paginationVariant,
  paginationShape,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center mt-4">
      <p className="text-heading text-sm font-medium">
        {t("common.showingEntries", {
          from: total > 0 ? from : 0,
          to,
          total,
          defaultValue: `${total > 0 ? from : 0} dan ${to} gacha koʻrsatilmoqda (jami ${total} ta)`,
        })}
      </p>

      <Pagination
        count={count}
        page={page}
        onChange={onChange}
        variant={paginationVariant || 'outlined'}
        shape={paginationShape || 'rounded'}
        sx={{
          '& .MuiPaginationItem-root': {
            color: '#028090',
            fontWeight: 'medium',
          },
          '& .MuiPaginationItem-page.Mui-selected': {
            backgroundColor: '#028090',
            color: 'white',
            '&:hover': {
              backgroundColor: '#0B2B33',
            },
          },
          '& .MuiPaginationItem-page:hover': {
            backgroundColor: '#F0FBF8',
          },
        }}
      />
    </div>
  );
};

export default PaginationWrapper;
