import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { TeamForm } from "../components/TeamForm";
import { RootState } from "../redux/store";
import {
  deleteUser,
  getAllUsers,
  getTeamMembers
} from "../services/api";
import { errorToast, successToast } from "../toastConfig";
import { User } from "../types";

type SortKey = "name" | "email" | "role" | "managerId";
type SortOrder = "asc" | "desc";

export const TeamManagement = () => {
  const [team, setTeam] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch team members
  const fetchTeam = async (page: number) => {
    try {
      setError("");
      const params = {
        page,
        sortBy: sortKey,
        sortOrder,
        search: searchQuery,
        role: roleFilter === "All" ? "" : roleFilter,
      };

      let response;
      if (user?.role === "Admin") {
        response = await getAllUsers(params);
      } else if (user?.role === "Manager") {
        response = await getTeamMembers(params);
      } else {
        setTeam([]);
        setTotalPages(1);
        return;
      }

      // Ensure data is an array
      const teamData = Array.isArray(response.data.data.data)
        ? response.data.data.data
        : [];
      console.log(response); // For debugging, remove in production
      setTeam(teamData);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(page);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch team";
      setError(message);
      setTeam([]); // Reset to empty array on error
      setTotalPages(1);
      errorToast(message);
    }
  };

  useEffect(() => {
    if (user?.role) {
      fetchTeam(1);
    }
  }, [user,currentPage, sortKey, sortOrder, searchQuery, roleFilter]);

  // Handle sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchTeam(page);
    }
  };

  // Handle form submission
  const handleFormSubmit = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    fetchTeam(currentPage);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      try {
        await deleteUser(id);
        successToast("Team member deleted successfully");
        fetchTeam(currentPage);
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to delete team member";
        errorToast(message);
      }
    }
  };

  // Handle edit
  const handleEdit = (member: User) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  // Handle add
  const handleAdd = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  if (!["Admin", "Manager"].includes(user?.role || "")) return null;

  return (
    <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Team Management</h2>
        {user?.role === "Admin" && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Add Member
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="All">All Roles</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
            {user?.role === "Admin" && <option value="Admin">Admin</option>}
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "role", label: "Role" },
                { key: "managerId", label: "Manager ID" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key as SortKey)}
                  className="py-3 px-4 text-left text-gray-600 font-semibold cursor-pointer hover:text-gray-800 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    {label}
                    {sortKey === key && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {team.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                  No team members found
                </td>
              </tr>
            ) : (
              team.map((member: any) => (
                <tr
                  key={member._id}
                  className="border-b hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4 text-gray-800">{member.name}</td>
                  <td className="py-3 px-4 text-gray-800">{member.email}</td>
                  <td className="py-3 px-4 text-gray-800">{member.role}</td>
                  <td className="py-3 px-4 text-gray-800">
                    {member.managerId || "-"}
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
                    {user?.role === "Admin" && (
                      <>
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-blue-600 hover:text-blue-800 transition-all duration-200 transform hover:scale-110 focus:outline-none"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="text-red-600 hover:text-red-800 transition-all duration-200 transform hover:scale-110 focus:outline-none"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-300"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              } transition-all duration-300`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedMember ? "Edit Team Member" : "Add Team Member"}
            </h3>
            <TeamForm
              member={selectedMember}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
