import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { getUser, updateUser, getUserLeaveBalances, adjustLeaveBalance } from '../../api/users.api';
import { getDepartments } from '../../api/departments.api';
import toast from 'react-hot-toast';

const roleBadgeClass: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  HR: 'bg-purple-100 text-purple-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
};

interface EditUserForm {
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  departmentId: string;
}

interface AdjustForm {
  adjustment: number;
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const canAdminEdit = authUser?.role === 'ADMIN' || authUser?.role === 'HR';

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id!),
    enabled: !!id,
  });

  const {
    data: leaveBalances,
    isLoading: balancesLoading,
    isError: balancesError,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: ['leaveBalances', id, year],
    queryFn: () => getUserLeaveBalances(id!, year),
    enabled: !!id,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
    enabled: canAdminEdit,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditUserForm>({
    values: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone ?? '',
          role: user.role,
          departmentId: user.departmentId ?? '',
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: EditUserForm) =>
      updateUser(id!, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone || undefined,
        role: payload.role || undefined,
        departmentId: payload.departmentId || undefined,
      }),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message ?? 'Failed to update user');
    },
  });

  const onSubmit = (data: EditUserForm) => {
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

  if (isError || !user) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <p className="text-red-600 mb-3">Failed to load user.</p>
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
        to="/users"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700 shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              user.firstName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  roleBadgeClass[user.role] ?? 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.role}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
              {user.department && (
                <p>
                  <span className="font-medium text-gray-700">Department:</span>{' '}
                  {user.department.name}
                </p>
              )}
              {user.phone && (
                <p>
                  <span className="font-medium text-gray-700">Phone:</span> {user.phone}
                </p>
              )}
              {user.joinedAt && (
                <p>
                  <span className="font-medium text-gray-700">Joined:</span>{' '}
                  {new Date(user.joinedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" />
          Edit Profile
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                {...register('firstName', { required: 'Required' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                {...register('lastName', { required: 'Required' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              {...register('phone')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+1 555 000 0000"
            />
          </div>

          {canAdminEdit && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  {...register('role')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HR">HR</option>
                  {authUser?.role === 'ADMIN' && <option value="ADMIN">Admin</option>}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  {...register('departmentId')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No Department</option>
                  {departments?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

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

      {/* Leave Balances */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Leave Balances</h2>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {balancesLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded h-20 w-full" />
            ))}
          </div>
        )}

        {balancesError && (
          <div className="text-center py-4 text-red-600">
            Failed to load balances.{' '}
            <button
              onClick={() => refetchBalances()}
              className="underline hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {!balancesLoading && !balancesError && (!leaveBalances || leaveBalances.length === 0) && (
          <p className="text-gray-500 text-sm text-center py-4">No leave balances for {year}.</p>
        )}

        {!balancesLoading && !balancesError && leaveBalances && leaveBalances.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {leaveBalances.map((balance) => (
              <LeaveBalanceCard
                key={balance.id}
                balance={balance}
                canAdjust={canAdminEdit}
                userId={id!}
                year={year}
                onAdjusted={() => {
                  queryClient.invalidateQueries({ queryKey: ['leaveBalances', id, year] });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface LeaveBalanceCardProps {
  balance: {
    id: string;
    leaveType: string;
    year: number;
    totalDays: number;
    usedDays: number;
    pendingDays: number;
  };
  canAdjust: boolean;
  userId: string;
  year: number;
  onAdjusted: () => void;
}

function LeaveBalanceCard({ balance, canAdjust, userId, year, onAdjusted }: LeaveBalanceCardProps) {
  const { register, handleSubmit, reset } = useForm<AdjustForm>();

  const adjustMutation = useMutation({
    mutationFn: (payload: AdjustForm) =>
      adjustLeaveBalance(userId, {
        leaveType: balance.leaveType,
        year,
        adjustment: Number(payload.adjustment),
      }),
    onSuccess: () => {
      toast.success('Leave balance adjusted');
      reset();
      onAdjusted();
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message ?? 'Failed to adjust balance');
    },
  });

  const pct = balance.totalDays > 0 ? Math.min((balance.usedDays / balance.totalDays) * 100, 100) : 0;

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 capitalize">
          {balance.leaveType.replace(/_/g, ' ')}
        </h3>
        <span className="text-sm text-gray-500">{year}</span>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>
          Used: <span className="font-semibold text-gray-900">{balance.usedDays}</span> /{' '}
          {balance.totalDays} days
        </span>
        {balance.pendingDays > 0 && (
          <span className="text-amber-600 font-medium">{balance.pendingDays} pending</span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-indigo-500 h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        {balance.totalDays - balance.usedDays} days remaining
      </p>

      {/* Adjust Section (Admin/HR only) */}
      {canAdjust && (
        <form
          onSubmit={handleSubmit((data) => adjustMutation.mutate(data))}
          className="flex gap-2 pt-1"
        >
          <input
            {...register('adjustment', { required: true })}
            type="number"
            placeholder="Adjust (e.g. 2 or -1)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={adjustMutation.isPending}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {adjustMutation.isPending ? '…' : 'Apply'}
          </button>
        </form>
      )}
    </div>
  );
}
