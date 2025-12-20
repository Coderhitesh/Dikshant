import  { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../constant/constant";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import  Badge from "../components/ui/badge/Badge";
import { Search, Users, AlertCircle } from "lucide-react";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import { Skeleton } from "../components/ui/Skeleton/Skeleton";

interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  createdAt: string;
}

interface ApiResponse {
  message: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: User[];
}

export default function UserProfiles() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async (pageNum = 1, search = "") => {
    setLoading(true);
    try {
      const params = {
        limit,
        page: pageNum,
        ...(search && { search }), // assuming backend supports ?search=keyword
      };

      const res = await axios.get<ApiResponse>(`${API_URL}/auth/all-profile`, {
        params,
       
      });
      console.log(res.data)
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalUsers(res.data.total);
      setPage(res.data.page);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, searchTerm);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchUsers(newPage, searchTerm);
    }
  };

  return (
    <>
      <PageMeta
        title="All User Profiles | Admin Dashboard"
        description="Manage and view all registered users"
      />
      <PageBreadcrumb pageTitle="All Users" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            <Users className="inline-block w-6 h-6 mr-2 -mt-1" />
            All Users ({totalUsers})
          </h3>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-white/[0.03]">
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                    User
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                    Contact
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                    Role
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                    Joined
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  // Skeleton Rows
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell  className="text-center py-12 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        <div>
                          <p className="text-sm">{user.email}</p>
                          <p className="text-sm font-mono">{user.mobile}</p>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <Badge variant="light">
                          {user.role}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        {user.is_active ? (
                          <Badge color="success">Active</Badge>
                        ) : (
                          <Badge color="error">Inactive</Badge>
                        )}
                        {user.is_verified ? null : (
                          <Badge color="warning">
                            Unverified
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && users.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-white/[0.05]">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, totalUsers)} of {totalUsers} users
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <Button
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}