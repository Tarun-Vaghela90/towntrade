import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const [data, setData] = useState({
    users: 0,
    products: 0,
    categories: 0,
    reports: 0,
    latestProducts: [],
    latestUsers: [],
    productsByCategory: [],
    reportsStatus: [],
  });

  const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dash/dashboard");
        const result = await res.json();

        // Map API response to state
        setData({
          users: result.users,
          products: result.products,
          categories: result.categories,
          reports: result.reports,
          latestProducts: result.latestProducts.map((p) => ({
            id: p._id,
            name: p.title,
            price: `${p.price}`,
            status: p.status,
          })),
          latestUsers: result.latestUsers.map((u) => ({
            id: u._id,
            name: u.fullName,
            email: u.email,
          })),
          productsByCategory: result.productsByCategory.map((c) => ({
            category: c.category,
            count: c.count,
          })),
          reportsStatus: result.reportsStatus.map((r) => ({
            status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
            value: r.value,
          })),
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle>Users</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.users}</p></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Products</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.products}</p></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.categories}</p></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Reports</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.reports}</p></CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Products by Category */}
        <Card>
          <CardHeader><CardTitle>Products by Category</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.productsByCategory}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reports Status */}
        <Card>
          <CardHeader><CardTitle>Reports Status</CardTitle></CardHeader>
          <CardContent className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.reportsStatus}
                  dataKey="value"
                  nameKey="status"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.reportsStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Latest Products Table */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Latest Products</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.latestProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Latest Users Table */}
      <Card>
        <CardHeader><CardTitle>Latest Users</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.latestUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
