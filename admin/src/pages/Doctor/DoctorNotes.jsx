import React, { useState, useEffect, useContext } from 'react';
import { noteService } from '../../services/noteService';
import { DoctorContext } from '../../context/DoctorContext';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { InputField, TextareaField, PrimaryButton } from '../../components/common/FormFields';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';

const DoctorNotes = () => {
  const { profileData } = useContext(DoctorContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({ title: '', content: '' });

  const fetchNotes = async () => {
    if (!profileData) return;
    setLoading(true);
    try {
      const res = await noteService.getNotes(profileData._id);
      if (res.success) setNotes(res.notes);
    } catch (err) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [profileData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await noteService.createNote({ ...formData, docId: profileData._id });
      if (res.success) {
        toast.success("Note saved");
        setModalOpen(false);
        setFormData({ title: '', content: '' });
        fetchNotes();
      }
    } catch (err) {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await noteService.deleteNote(id);
      if (res.success) {
        toast.success("Note deleted");
        fetchNotes();
      }
    } catch (err) {
      toast.error("Failed to delete note");
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="My Private Notes" 
        subtitle="Personal, private notes that are not visible to admins" 
        actions={<PrimaryButton onClick={() => setModalOpen(true)}>+ New Note</PrimaryButton>}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Loading notes...</div>
      ) : notes.length === 0 ? (
        <Card>
          <div className="p-12 flex flex-col items-center justify-center text-gray-500 text-center">
            <img src={assets.list_icon} alt="Empty" className="w-16 h-16 opacity-20 mb-4 grayscale" />
            <p className="font-medium text-gray-800 text-lg mb-2">No Private Notes</p>
            <p className="max-w-sm mb-6">Create your first private note. These notes are entirely confidential and cannot be viewed by administration.</p>
            <PrimaryButton onClick={() => setModalOpen(true)}>Create Note</PrimaryButton>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <div key={note._id} className="bg-yellow-50 rounded-xl p-5 shadow-sm border border-yellow-200 flex flex-col min-h-48 relative group hover:shadow-md transition-shadow">
              <button 
                onClick={() => handleDelete(note._id)}
                className="absolute top-3 right-3 text-yellow-600/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
              <h3 className="font-semibold text-yellow-900 mb-2 pr-6">{note.title}</h3>
              <p className="text-yellow-800 text-sm whitespace-pre-wrap flex-1">{note.content}</p>
              <p className="text-xs text-yellow-600 mt-4 text-right">{new Date(note.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Private Note">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField 
            label="Title" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
            placeholder="Note title..."
          />
          <TextareaField 
            label="Content" 
            value={formData.content} 
            onChange={e => setFormData({...formData, content: e.target.value})} 
            required 
            placeholder="Write your note here..."
            rows={8}
          />
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Note'}</PrimaryButton>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default DoctorNotes;
