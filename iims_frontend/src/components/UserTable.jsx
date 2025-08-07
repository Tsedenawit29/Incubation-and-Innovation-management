export default function UserTable({ users, onEdit, onDelete, onStatus, onRole, onChangePassword }) {
  console.log("UserTable props:", {
    users: users?.length || 0,
    onEdit: typeof onEdit,
    onDelete: typeof onDelete,
    onStatus: typeof onStatus,
    onRole: typeof onRole,
    onChangePassword: typeof onChangePassword
  });
  
  return (
    <table className="min-w-full border">
      <thead>
        <tr>
          <th className="border px-2">Name</th>
          <th className="border px-2">Email</th>
          <th className="border px-2">Role</th>
          <th className="border px-2">Active</th>
          <th className="border px-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td className="border px-2">{u.fullName}</td>
            <td className="border px-2">{u.email}</td>
            <td className="border px-2">{u.role}</td>
            <td className="border px-2">{u.active ? "Yes" : "No"}</td>
            <td className="border px-2">
              <button className="text-blue-600 mr-2" onClick={() => onEdit(u)}>Edit</button>
              <button className="text-red-600 mr-2" onClick={() => onDelete(u)}>Delete</button>
              <button className="text-yellow-600 mr-2" onClick={() => onStatus(u)}>{u.active ? "Deactivate" : "Activate"}</button>
              <button className="text-green-600 mr-2" onClick={() => onRole(u)}>Change Role</button>
              <button className="text-purple-600" onClick={() => onChangePassword(u)}>Change Password</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 