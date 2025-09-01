import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Eye, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "../../Axios/api";
import { AlertConfirm } from "../../common/AlertConfirm";
import { toast } from "react-toastify";

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/reports");
      setReports(res.data.reports || []);
      setFilteredReports(res.data.reports || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reports", error);
      toast.error("Failed to fetch reports");
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredReports(reports);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredReports(
        reports.filter(
          (r) =>
            r.reason?.toLowerCase().includes(lower) ||
            r.reporter?.fullName?.toLowerCase().includes(lower) ||
            r.product?.title?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchText, reports]);

  // Toggle selection
  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredReports.length
        ? []
        : filteredReports.map((r) => r._id)
    );
  };

  // Bulk mark as solved
  const bulkSolve = async () => {
    try {
      await api.put("/admin/reports/bulk-update", {
        ids: selectedIds,
        status: "resolved",
      });
      toast.success("Selected reports marked as solved");
      setSelectedIds([]);
      fetchReports();
    } catch (error) {
      console.error("Error bulk solving reports", error);
      toast.error("Failed to mark reports as solved");
    }
  };

  // Single mark as solved
  const handleSolve = async (id) => {
    try {
      await api.put(`/reports/${id}/status`, { status: "resolved" });
      toast.success("Report marked as solved");
      fetchReports();
    } catch (error) {
      console.error("Error solving report:", error);
      toast.error("Failed to mark report as solved");
    }
  };

  // Single delete
  const handleDelete = async (id) => {
    try {
      await api.delete(`/reports/${id}`);
      toast.success("Report deleted successfully");
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  // Bulk delete
  const bulkDelete = async () => {
    try {
      await api.post("/admin/reports/bulk-delete", { ids: selectedIds });
      toast.success("Selected reports deleted successfully");
      setSelectedIds([]);
      fetchReports();
    } catch (error) {
      console.error("Error bulk deleting reports", error);
      toast.error("Failed to delete reports");
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            checked={
              selectedIds.length === filteredReports.length &&
              filteredReports.length > 0
            }
            ref={(el) => {
              if (el) {
                el.indeterminate =
                  selectedIds.length > 0 &&
                  selectedIds.length < filteredReports.length;
              }
            }}
            onChange={handleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original._id)}
            onChange={() => handleToggle(row.original._id)}
          />
        ),
      },
      {
        header: "Product",
        accessorKey: "product.title",
        cell: ({ row }) => {
          const product = row.original.product;
          return product ? (
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              {product.title}
            </span>
          ) : (
            <span className="text-gray-400">N/A</span>
          );
        },
      },
      { header: "Reporter", accessorKey: "reporter.fullName" },
      { header: "Reason", accessorKey: "reason" },
      { header: "Status", accessorKey: "status" },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
      {
        header: "Actions",
        cell: ({ row }) => {
          const report = row.original;
          const hasProduct = report.product && report.product._id;
          return (
            <div className="flex space-x-2">
              {hasProduct ? (
                <button
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                  onClick={() => navigate(`/product/${report.product._id}`)}
                >
                  <Eye size={18} />
                </button>
              ) : (
                <AlertConfirm
                  triggerText={<Eye size={18} />}
                  title="Report Details"
                  description={
                    <>
                      <p>
                        <strong>Reporter:</strong> {report.reporter?.fullName || "N/A"}
                      </p>
                      <p>
                        <strong>Reason:</strong> {report.reason || "N/A"}
                      </p>
                      <p>
                        <strong>Description:</strong> {report.description || "N/A"}
                      </p>
                    </>
                  }
                  confirmText="Close"
                  triggerVariant="info"
                />
              )}

              {report.status !== "resolved" && (
                <AlertConfirm
                  triggerText={<Check size={18} />}
                  title="Mark Report as Solved?"
                  description="This will mark the report as resolved."
                  confirmText="Solve"
                  cancelText="Cancel"
                  triggerVariant="success"
                  onConfirm={() => handleSolve(report._id)}
                />
              )}

              <AlertConfirm
                triggerText={<Trash2 size={18} />}
                title="Delete Report?"
                description="This action will permanently delete the report."
                confirmText="Delete"
                cancelText="Cancel"
                triggerVariant="destructive"
                onConfirm={() => handleDelete(report._id)}
              />
            </div>
          );
        },
      },
    ],
    [selectedIds, filteredReports]
  );

  const table = useReactTable({
    data: filteredReports,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <p className="text-center p-4">Loading reports...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border rounded px-3 py-1 w-64"
        />
        <div className="flex gap-2 items-center">
          {selectedIds.length > 0 && (
            <>
              <Button variant="success" onClick={bulkSolve}>
                Solve Selected
              </Button>
              <Button variant="destructive" onClick={bulkDelete}>
                Delete Selected
              </Button>
            </>
          )}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg font-medium">📄 No reports available</p>
          <p className="mt-2">All reports are resolved or none have been submitted yet.</p>
        </div>
      ) : (
        <table className="w-full border-collapse bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left p-3 font-semibold text-gray-700"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 text-gray-600">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
