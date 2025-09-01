import React, { useEffect, useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Edit, Trash2, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button"; // ✅ Added Button import
import api from "../../Axios/api";
import UserModal from "./users/UserModal";
import { AlertConfirm } from "../../common/AlertConfirm";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchText, setSearchText] = useState("");

  const BASE_URL = "http://localhost:5000/";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
      setFilteredUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  // Search filter
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredUsers(users);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.fullName?.toLowerCase().includes(lower) ||
            u.username?.toLowerCase().includes(lower) ||
            u.email?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchText, users]);

  // Toggle individual selection
  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all filtered users
  const handleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredUsers.length
        ? []
        : filteredUsers.map((u) => u._id)
    );
  };

  // Bulk delete
  const bulkDelete = async () => {
    try {
      await api.post("/admin/users/bulk-delete", { ids: selectedIds });
      setSelectedIds([]);
      fetchUsers();
    } catch (error) {
      console.error("Error bulk deleting users", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user", error);
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
              selectedIds.length === filteredUsers.length &&
              filteredUsers.length > 0
            }
            ref={(el) => {
              if (el) {
                el.indeterminate =
                  selectedIds.length > 0 &&
                  selectedIds.length < filteredUsers.length;
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
        header: "Avatar",
        accessorKey: "profileImage",
        cell: ({ row }) => {
          const image = row.getValue("profileImage");
          const name = row.original.fullName || "User";
          const imageUrl = image ? `${BASE_URL}${image}` : undefined;
          return (
            <Avatar className="h-10 w-10">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          );
        },
      },
      { header: "Username", accessorKey: "username" },
      { header: "Full Name", accessorKey: "fullName" },
      { header: "Email", accessorKey: "email" },
      { header: "Status", accessorKey: "accountStatus" },
      { header: "Role", accessorKey: "role" },
      {
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex space-x-2">
              <UserModal buttonName={<Eye size={18} />} title="View User" user={user} mode="view" />
              <UserModal buttonName={<Edit size={18} />} title="Edit User" user={user} mode="edit" onSuccess={fetchUsers} />
              <AlertConfirm
                triggerText={<Trash2 size={18} />}
                title="Delete User?"
                description="This action will permanently delete the user."
                confirmText="Delete"
                cancelText="Cancel"
                triggerVariant="destructive"
                onConfirm={() => handleDelete(user._id)}
              />
            </div>
          );
        },
      },
    ],
    [selectedIds, filteredUsers]
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <p className="text-center p-4">Loading users...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border rounded px-3 py-1 w-64"
        />
        <div className="flex gap-2 items-center">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={bulkDelete}>
              Delete Selected
            </Button>
          )}
          <UserModal buttonName={<Plus size={18} />} title="Add User" mode="add" onSuccess={fetchUsers} />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
  <div className="text-center py-10 text-gray-500">
    <p className="text-lg font-medium">🙋‍♂️ No users found!</p>
    <p className="mt-2">
      There are no users to display. Try adding a new user or adjust your search.
    </p>
  </div>
) : (
  <table className="w-full border-collapse bg-white shadow-md rounded-xl overflow-hidden">
    <thead className="bg-gray-100">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <th key={header.id} className="text-left p-3 font-semibold text-gray-700">
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
