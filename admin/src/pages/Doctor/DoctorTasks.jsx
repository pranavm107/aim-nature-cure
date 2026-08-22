import React, { useState, useEffect, useContext } from 'react';
import { taskService } from '../../services/taskService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { InputField, SelectField, PrimaryButton } from '../../components/common/FormFields';
import { toast } from 'react-toastify';

const DoctorTasks = () => {
  const { profileData } = useContext(DoctorContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({ title: '', priority: 'Medium' });

  const fetchTasks = async () => {
    if (!profileData) return;
    setLoading(true);
    try {
      const res = await taskService.getTasks(profileData._id);
      if (res.success) setTasks(res.tasks);
    } catch (err) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [profileData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await taskService.createTask({ ...formData, docId: profileData._id });
      if (res.success) {
        toast.success("Task created");
        setModalOpen(false);
        setFormData({ title: '', priority: 'Medium' });
        fetchTasks();
      }
    } catch (err) {
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await taskService.updateTaskStatus(id, status);
      if (res.success) {
        toast.success(`Task ${status.toLowerCase()}`);
        fetchTasks();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const columns = [
    { label: 'Date' },
    { label: 'Task' },
    { label: 'Priority' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const getPriorityBadge = (prio) => {
    switch(prio) {
      case 'High': return <Badge variant="danger">High</Badge>;
      case 'Medium': return <Badge variant="warning">Medium</Badge>;
      default: return <Badge variant="neutral">Low</Badge>;
    }
  };

  const renderRow = (item) => (
    <div key={item._id} className={`grid grid-cols-[1fr_2fr_1fr_1fr_1.5fr] py-3 px-6 border-b items-center text-sm transition-colors ${item.status === 'Completed' ? 'bg-gray-50/50 opacity-75' : 'hover:bg-gray-50'}`}>
      <p>{new Date(item.date).toLocaleDateString()}</p>
      <p className={`font-medium ${item.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>{item.title}</p>
      <div>{getPriorityBadge(item.priority)}</div>
      <div>
        {item.status === 'Completed' && <Badge variant="success">Completed</Badge>}
        {item.status === 'In Progress' && <Badge variant="primary">In Progress</Badge>}
        {item.status === 'Pending' && <Badge variant="warning">Pending</Badge>}
      </div>
      <div className="text-right flex justify-end gap-2">
        {item.status !== 'Completed' && (
          <select 
            onChange={(e) => handleUpdateStatus(item._id, e.target.value)} 
            value={item.status}
            className="text-xs border rounded p-1 outline-none"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        )}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader 
        title="My Tasks" 
        subtitle="Manage your daily tasks and to-dos" 
        actions={<PrimaryButton onClick={() => setModalOpen(true)}>+ New Task</PrimaryButton>}
      />

      <DataTable 
        columns={columns} 
        data={tasks.sort((a,b) => {
          if (a.status === 'Completed' && b.status !== 'Completed') return 1;
          if (b.status === 'Completed' && a.status !== 'Completed') return -1;
          return b.date - a.date;
        })} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No tasks found."
        gridColsClass="grid-cols-[1fr_2fr_1fr_1fr_1.5fr]" 
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Task">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField 
            label="Task Description" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
            placeholder="e.g. Review patient charts"
          />
          <SelectField 
            label="Priority" 
            value={formData.priority} 
            onChange={e => setFormData({...formData, priority: e.target.value})} 
            options={[
              {label: 'High', value: 'High'},
              {label: 'Medium', value: 'Medium'},
              {label: 'Low', value: 'Low'}
            ]} 
          />
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Task'}</PrimaryButton>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default DoctorTasks;
