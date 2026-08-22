import React, { useState, useEffect } from 'react';
import { incentiveService } from '../../services/incentiveService';
import { adminService } from '../../services/adminService';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { InputField, SelectField, PrimaryButton } from '../../components/common/FormFields';
import { toast } from 'react-toastify';

const IncentiveConfig = () => {
  const [rules, setRules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    docId: '',
    targetAmount: '',
    percentage: '',
    effectiveDate: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, docRes] = await Promise.all([
        incentiveService.getRules(),
        adminService.getAllDoctors()
      ]);
      if (rulesRes.success) setRules(rulesRes.rules);
      if (docRes.success) {
        setDoctors(docRes.doctors);
        if(docRes.doctors.length > 0) setFormData(p => ({...p, docId: docRes.doctors[0]._id}));
      }
    } catch (err) {
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await incentiveService.createRule({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        percentage: parseFloat(formData.percentage)
      });
      if (res.success) {
        toast.success("Rule added");
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to add rule");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { label: 'Doctor ID' },
    { label: 'Target Amount' },
    { label: 'Percentage' },
    { label: 'Effective Date' }
  ];

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[1fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm">
      <p>{item.docId}</p>
      <p>${item.targetAmount}</p>
      <p>{item.percentage}%</p>
      <p>{item.effectiveDate}</p>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Incentive Configuration" 
        subtitle="Manage doctor revenue targets and incentive percentages"
        actions={<PrimaryButton onClick={() => setModalOpen(true)}>Add New Rule</PrimaryButton>}
      />
      
      <DataTable 
        columns={columns} 
        data={rules} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        gridColsClass="grid-cols-[1fr_1fr_1fr_1fr]" 
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Incentive Rule">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <SelectField label="Doctor" name="docId" value={formData.docId} onChange={e => setFormData({...formData, docId: e.target.value})} options={doctors.map(d => ({label: d.name, value: d._id}))} />
          <InputField label="Target Amount ($)" type="number" value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})} required />
          <InputField label="Incentive Percentage (%)" type="number" value={formData.percentage} onChange={e => setFormData({...formData, percentage: e.target.value})} required />
          <InputField label="Effective Date" type="date" value={formData.effectiveDate} onChange={e => setFormData({...formData, effectiveDate: e.target.value})} required />
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</PrimaryButton>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default IncentiveConfig;
