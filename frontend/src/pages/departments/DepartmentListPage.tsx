import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/auth.store';
import { getDepartments, createDepartment } from '../../api/departments.api';
import { getUsers } from '../../api/users.api';
import toast from 'react-hot-toast';

interface CreateDeptForm {
  name: string;
  description: string;
  managerId: string;
}

export function DepartmentListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();

  const [showModal, setShowModal] = useState(false);

  const { data: departments, isLoading, isError, refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    enabled: showModal,
  });

  const managerOptions = allUsers?.filter(
    (u) => u.role === 'MANAGER' || u.role === 'ADMIN'
  ) ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDeptForm>({ defaultValues: { managerId: '' } });

  const createMutation = useMutation({
    mutationFn: (payload: CreateDeptForm) =>
      createDepartment({
        name: payload.name,
        description: payload.description || undefined,
        managerId: payload.managerId || undefined,
      }),
    onSuccess: () => {
      toast.success('Department created successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setShowModal(false);
      reset();
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message ?? 'Failed to create department');
    },
  });

  const canAdd = authUser?.role === 'ADMIN';

  const onSubmit = (data: CreateDeptForm) => {
    createMutation.mutate(data);
  };

  const getMemberCount = (dept: (typeof departments extends Array<infer T> ? T : never)) => {
    if (dept._count?.employees !== undefined) return dept._count.employees;
    if (dept.employees) return dept.employees.length;
    return 0;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-7 h-7 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        </div>
        {canAdd && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Department Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Manager</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Members</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="animate-pulse bg-gray-200 rounded h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}

            {isError && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-red-600">
                  Failed to load departments.{' '}
                  <button
                    onClick={() => refetch()}
                    className="underline hover:text-red-800 font-medium"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && departments?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No departments found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              departments?.map((dept) => (
                <tr
                  key={dept.id}
                  onClick={() => navigate(`/departments/${dept.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{dept.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {dept.manager
                      ? `${dept.manager.firstName} ${dept.manager.lastName}`
                      : 'No Manager'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{getMemberCount(dept)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Add Department Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Department</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name
                </label>
                <input
                  {...register('name', { required: 'Required' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Engineering"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Optional description…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <select
                  {...register('managerId')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No Manager</option>
                  {managerOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    reset();
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {createMutation.isPending ? 'Creating…' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
