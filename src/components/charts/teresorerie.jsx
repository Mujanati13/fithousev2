import React, { useEffect, useState } from "react";
import { Button, Space, Input, DatePicker, message } from "antd";
const { RangePicker } = DatePicker;
import {
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DotChartOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment"; // Import moment library

function Teresorerie() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultStartDate = moment().startOf("month");
  const defaultEndDate = moment().endOf("month");

  const handleDateChange = async (dates) => {
    if (!dates || dates.length !== 2) {
      return;
    }

    const [startDate, endDate] = dates;
    setLoading(true);

    try {
      const response = await fetch(
        `https://fithouse.pythonanywhere.com/api/stat/tresorerie?start_date=${startDate.format(
          "YYYY-MM-DD"
        )}&end_date=${endDate.format("YYYY-MM-DD")}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleDateChange([defaultStartDate, defaultEndDate]); // Pass array instead of object
  }, []); // Run only once on component mount

  return (
    <div className="w-[55%] h-60 bg-white shadow-sm rounded-md p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Teresorerie</div>
        <RangePicker
          onChange={handleDateChange}
        />
      </div>
      <div className="w-full mt-5 flex items-center justify-between">
        <div className="w-40 h-40 bg-green-50 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-green-200 flex justify-center ">
              <BarChartOutlined />
            </div>
            <div className="text-sm font-normal">Recette</div>
          </div>
          <div className="font-medium mt-5">
            {data ? `${data.solde_recette} MAD` : "Loading..."}
          </div>
        </div>
        <div className="w-40 h-40 bg-red-50 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-red-200 flex justify-center ">
              <DotChartOutlined />{" "}
            </div>
            <div className="text-sm font-normal">Depenses</div>
          </div>
          <div className="font-medium mt-5">
            {data ? `${data.solde_peroid} MAD` : "Loading..."}
          </div>
        </div>
        <div className="w-40 h-40 bg-purple-50 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-purple-200 flex justify-center ">
              <LineChartOutlined />
            </div>
          </div>
          <div className="font-medium mt-5">
            {data ? `${data.solde_recette} MAD` : "Loading..."}
          </div>
          <div className="text-sm font-normal mt-5">Solde de la periode</div>
        </div>
      </div>
    </div>
  );
}

export default Teresorerie;
