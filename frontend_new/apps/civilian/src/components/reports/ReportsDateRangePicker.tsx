import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { addDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns';
import { ReportDateRange } from '@shared/types/reports';

interface ReportsDateRangePickerProps {
  dateRange: ReportDateRange;
  onDateRangeChange: (dateRange: ReportDateRange) => void;
}

export const ReportsDateRangePicker: React.FC<ReportsDateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
}) => {
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      onDateRangeChange({
        ...dateRange,
        startDate: date.toISOString(),
      });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      onDateRangeChange({
        ...dateRange,
        endDate: date.toISOString(),
      });
    }
  };

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = subDays(end, days - 1);
    onDateRangeChange({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  };

  const handleThisMonth = () => {
    const now = new Date();
    onDateRangeChange({
      startDate: startOfMonth(now).toISOString(),
      endDate: endOfMonth(now).toISOString(),
    });
  };

  const handleThisYear = () => {
    const now = new Date();
    onDateRangeChange({
      startDate: startOfYear(now).toISOString(),
      endDate: endOfYear(now).toISOString(),
    });
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <DatePicker
          label="Start Date"
          value={new Date(dateRange.startDate)}
          onChange={handleStartDateChange}
          maxDate={new Date(dateRange.endDate)}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="End Date"
          value={new Date(dateRange.endDate)}
          onChange={handleEndDateChange}
          minDate={new Date(dateRange.startDate)}
          maxDate={new Date()}
          slotProps={{ textField: { size: 'small' } }}
        />
      </Stack>
      <Box sx={{ mt: 1 }}>
        <ButtonGroup size="small" variant="outlined">
          <Button onClick={() => handleQuickSelect(7)}>Last 7 Days</Button>
          <Button onClick={() => handleQuickSelect(30)}>Last 30 Days</Button>
          <Button onClick={handleThisMonth}>This Month</Button>
          <Button onClick={handleThisYear}>This Year</Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
}; 