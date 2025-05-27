import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { analyticsService } from "../services/analytics";
import { format } from "date-fns";

interface QuarterData {
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyData: Array<{
    date: string;
    completionRate: number;
  }>;
}

interface QuarterAnalyticsProps {
  startDate: string;
  title: string;
}

const QuarterAnalytics: React.FC<QuarterAnalyticsProps> = ({
  startDate,
  title,
}) => {
  const [quarterData, setQuarterData] = useState<QuarterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuarterData = async () => {
      try {
        const data = await analyticsService.getQuarterAnalytics(startDate);
        setQuarterData(data);
      } catch (error) {
        console.error("Error fetching quarter data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuarterData();
  }, [startDate]);

  if (loading || !quarterData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-[350px] bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: quarterData.dailyData.map((data) =>
        format(new Date(data.date), "MMM dd")
      ),
      labels: {
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: {
      title: {
        text: "Completion Rate (%)",
      },
      min: 0,
      max: 100,
      labels: {
        formatter: function (val: number) {
          return Math.round(val) + "%";
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return Math.round(val) + "%";
        },
      },
    },
    grid: {
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
  };

  const series = [
    {
      name: "Completion Rate",
      data: quarterData.dailyData.map((data) => data.completionRate),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </div>
  );
};

export default QuarterAnalytics;
