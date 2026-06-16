import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { getDepartment, updateDepartment } from '../../api/departments.api';
import { getUsers } from '../../api/users.api';
import toast from 'react-hot-toast';

const roleBadgeClass: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  HR: 'bg-purple-100 text-purple-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
};

interface EditDeptForm {
  name: string;
  description: string;
  managerId: string;
}

export function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();

  const canEdit = authUser?.role === 'ADMIN';

  const {
    data: department,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['department', id],
    queryFn: () => getDepartment(id!),
    enabled: !!id,
  });

  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    enabled: canEdit,
  });

  const managerOptions = allUsers?.filter(
    (u) => u.role === 'MANAGER' || u.role === 'ADMIN'
  ) ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditDeptForm>({
    values: department
      ? {
          name: department.name,
          description: department.description ?? '',
          managerId: department.managerId ?? '',
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: EditDeptForm) =>
      updateDepartment(id!, {
        name: payload.name,
        description: payload.description || undefined,
        managerId: payload.managerId || undefined,
      }),
    onSuccess: () => {
      toast.success('Department updated successfully');
      queryClient.invalidateQueries({ queryKey: ['department', id] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message ?? 'Failed to update department');
    },
  });

  const onSubmit = (data: EditDeptForm) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="animate-pulse bg-gray-200 rounded h-6 w-32" />
        <div className="animate-pulse bg-gray-200 rounded h-48 w-full" />
        <div className="animate-pulse bg-gray-200 rounded h-64 w-full" />
      </div>
    );
  }

  if (isError || !department) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <p className="text-red-600 mb-3">Failed to load department.</p>
        <button
          onClick={() => refetch()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link
        to="/departments"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Departments
      </Link>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{department.name}</h1>
            {department.description && (
              <p className="text-gray-500 text-sm mt-1">{department.description}</p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-700">Manager:</span>{' '}
                {department.manager
                  ? `${department.manager.firstName} ${department.manager.lastName}`
                  : 'No Manager'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Members:</span>{' '}
                {department._count?.employees ?? department.employees?.length ?? 0}
              </p>
              {department.createdAt && (
                <p>
                  <span className="font-medium text-gray-700">Created:</span>{' '}
                  {new Date(department.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form (Admin only) */}
      {canEdit && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Department</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name
              </label>
              <input
                {...register('name', { required: 'Required' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => reset()}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members Table */}
      {department.employees && department.employees.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Members</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {department.employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        roleBadgeClass[emp.role] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        emp.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {department.employees && department.employees.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center text-gray-500">
          No members in this department yet.
        </div>
      )}
    </div>
  );
}
