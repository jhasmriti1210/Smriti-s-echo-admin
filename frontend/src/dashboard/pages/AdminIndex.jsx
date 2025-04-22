import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const AdminIndex = () => {
  const [stats, setStats] = useState({
    totalNews: 0,
    activeNews: 0,
    pendingNews: 0,
    deactiveNews: 0,
    totalWriters: 0,
  });

  const [recentNews, setRecentNews] = useState([]);

  const getDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:8082/api/news/dashboard-stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { totalNews, activeNews, pendingNews, deactiveNews, totalWriters } =
        res.data;
      setStats({
        totalNews,
        activeNews,
        pendingNews,
        deactiveNews,
        totalWriters,
      });
    } catch (err) {
      console.error("Dashboard stats error:", err);
    }
  };

  const getRecentNews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:8082/api/news/recent-news",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecentNews(res.data.news); // Adjust if backend response differs
    } catch (err) {
      console.error("Recent news fetch error:", err);
    }
  };

  useEffect(() => {
    getDashboardStats();
    getRecentNews();
  }, []);

  return (
    <div className="mt-2">
      <div className="grid grid-cols-5 gap-x-4">
        <StatCard label="Total News" value={stats.totalNews} />
        <StatCard label="Pending News" value={stats.pendingNews} />
        <StatCard label="Active News" value={stats.activeNews} />
        <StatCard label="Deactive News" value={stats.deactiveNews} />
        <StatCard label="Writers" value={stats.totalWriters} />
      </div>

      <div className="bg-white p-4 mt-5">
        <div className="flex justify-between items-center pb-4">
          <h2 className="text-lg font-semibold">Recent News</h2>
          <Link to="/admin/news" className="text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="relative overflow-x-auto p-4">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-7 py-3">No</th>
                <th className="px-7 py-3">Title</th>
                <th className="px-7 py-3">Image</th>
                <th className="px-7 py-3">Category</th>
                <th className="px-7 py-3">Description</th>
                <th className="px-7 py-3">Date</th>
                <th className="px-7 py-3">Status</th>
                <th className="px-7 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(recentNews) &&
                recentNews.map((news, i) => (
                  <tr key={news._id || i} className="bg-white border-b">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 truncate max-w-[160px]">
                      {news.title}
                    </td>
                    <td className="px-6 py-4">
                      <img
                        className="w-[40px] h-[40px] object-cover"
                        src={news.image}
                        alt="news"
                      />
                    </td>
                    <td className="px-6 py-4">{news.category}</td>
                    <td className="px-6 py-4 truncate max-w-[160px]">
                      {news.description}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(news.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-[2px] text-xs rounded-lg ${
                          news.status === "active"
                            ? "bg-green-100 text-green-800"
                            : news.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {news.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-start items-center gap-x-4 text-white">
                        <Link
                          to={`/admin/news/${news._id}`}
                          className="p-[6px] bg-green-500 rounded hover:shadow-lg hover:shadow-green-500/50"
                        >
                          <FaEye />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              {recentNews.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-400">
                    No recent news available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="w-full p-8 flex justify-center flex-col rounded-md items-center gap-y-2 bg-white text-slate-700">
    <span className="text-xl font-bold">{value}</span>
    <span className="text-md">{label}</span>
  </div>
);

export default AdminIndex;
