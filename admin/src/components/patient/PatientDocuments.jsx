import React, { useState, useEffect } from 'react';
import { documentService } from '../../services/documentService';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import { InputField, SelectField, TextareaField, PrimaryButton } from '../common/FormFields';
import { toast } from 'react-toastify';
import Badge from '../common/Badge';

const PatientDocuments = ({ patientId, refreshTrigger }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', type: 'Lab Report', description: '' });
  const [file, setFile] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentService.getPatientDocuments(patientId);
      if (res.success) setDocuments(res.documents.sort((a,b) => b.date - a.date));
    } catch (err) {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [patientId, refreshTrigger]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !file) {
      toast.warn("Please provide a name, type, and file.");
      return;
    }
    setUploading(true);
    try {
      const uploadData = { ...formData, uploader: 'Current User' };
      const res = await documentService.uploadDocument(patientId, uploadData);
      if (res.success) {
        toast.success("Document uploaded successfully");
        setUploadModalOpen(false);
        setFormData({ name: '', type: 'Lab Report', description: '' });
        setFile(null);
        fetchDocuments();
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    try {
      const res = await documentService.deleteDocument(patientId, selectedDoc._id);
      if (res.success) {
        toast.success("Document deleted");
        setDeleteModalOpen(false);
        setSelectedDoc(null);
        fetchDocuments();
      }
    } catch (err) {
      toast.error("Failed to delete document");
    }
  };

  const columns = [
    { label: 'Document Name' },
    { label: 'Type' },
    { label: 'Uploaded By' },
    { label: 'Date' },
    { label: 'Status' },
    { label: 'Action', className: 'text-right' }
  ];

  const getDocIcon = (type) => {
    // Provide a simple SVG based on type
    return (
      <div className="bg-primary/10 p-2 rounded text-primary flex-shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      </div>
    );
  };

  const renderRow = (item) => (
    <div key={item._id} className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_1fr] py-3 px-6 border-b items-center text-sm hover:bg-gray-50">
      <div className="flex items-center gap-3 overflow-hidden pr-2">
        {getDocIcon(item.type)}
        <div className="min-w-0">
          <p className="font-medium text-gray-800 truncate" title={item.name}>{item.name}</p>
          <p className="text-xs text-gray-500 truncate">{item.fileSize || 'Unknown Size'}</p>
        </div>
      </div>
      <p>{item.type || 'Document'}</p>
      <p>{item.uploadedBy || 'System'}</p>
      <p>{new Date(item.date).toLocaleDateString()}</p>
      <div><Badge variant={item.status === 'Active' ? 'success' : 'neutral'}>{item.status || 'Active'}</Badge></div>
      <div className="flex justify-end gap-2 text-right">
        <button onClick={() => { setSelectedDoc(item); setPreviewModalOpen(true); }} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded" title="View">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </button>
        <button onClick={() => { setSelectedDoc(item); setDeleteModalOpen(true); }} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded" title="Delete">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-lg font-semibold text-gray-800">Patient Documents</h2>
        <button 
          onClick={() => setUploadModalOpen(true)}
          className="text-primary text-sm font-medium hover:bg-primary/5 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload Document
        </button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={documents} 
        loading={loading} 
        renderRow={renderRow} 
        renderMobileCard={() => <div />} 
        emptyMessage="No documents uploaded."
        gridColsClass="grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_1fr]" 
      />

      {/* Upload Modal */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Patient Document">
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <InputField 
            label="Document Name *" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
            placeholder="e.g. Complete Blood Count (CBC)"
          />
          <SelectField 
            label="Document Type *" 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})} 
            options={[
              {label: 'Lab Report', value: 'Lab Report'},
              {label: 'Blood Test', value: 'Blood Test'},
              {label: 'Scan / Imaging', value: 'Scan / Imaging'},
              {label: 'Prescription', value: 'Prescription'},
              {label: 'Medical Record', value: 'Medical Record'},
              {label: 'Discharge Summary', value: 'Discharge Summary'},
              {label: 'Other', value: 'Other'}
            ]} 
          />
          <TextareaField 
            label="Description" 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            placeholder="Optional context about this document..."
            rows={2}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Upload *</label>
            <input 
              type="file" 
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <button type="button" onClick={() => setUploadModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <PrimaryButton type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Document'}</PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={previewModalOpen} onClose={() => setPreviewModalOpen(false)} title="Document Preview">
        {selectedDoc && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
              <div><p className="text-xs text-gray-500">Name</p><p className="font-medium">{selectedDoc.name}</p></div>
              <div><p className="text-xs text-gray-500">Type</p><p className="font-medium">{selectedDoc.type}</p></div>
              <div><p className="text-xs text-gray-500">Uploaded Date</p><p className="font-medium">{new Date(selectedDoc.date).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-gray-500">Uploaded By</p><p className="font-medium">{selectedDoc.uploadedBy}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500">Description</p><p className="font-medium">{selectedDoc.description || 'N/A'}</p></div>
            </div>
            
            <div className="bg-gray-100 rounded border border-dashed border-gray-300 h-64 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="font-medium text-gray-500">{selectedDoc.name}</p>
              <p className="text-sm">{selectedDoc.fileSize} • {selectedDoc.fileType}</p>
              <p className="text-xs mt-2">(Document Preview Mock)</p>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button onClick={() => setPreviewModalOpen(false)} className="px-4 py-2 border rounded">Close</button>
              <PrimaryButton onClick={() => { toast.info("Download started"); setPreviewModalOpen(false); }}>Download</PrimaryButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Document">
        {selectedDoc && (
          <div className="flex flex-col gap-4">
            <div className="bg-red-50 p-4 rounded text-red-800 border border-red-200">
              <p className="font-bold mb-2">Delete this document?</p>
              <p className="text-sm">Are you sure you want to delete <strong>{selectedDoc.name}</strong>? This will permanently remove the document from the patient's records.</p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete Document</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientDocuments;
