import { mockConsultations, mockTherapies, mockAppointments, mockPatientDocuments, mockInvoices } from '../mocks/mockData';
import { documentService } from './documentService';
import { followUpService } from './followUpService';
import { caseSheetService } from './caseSheetService';

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const patientActivityService = {
  getPatientActivity: async (patientId) => {
    await delay();
    let activities = [];

    // 1. Consultations
    const consultations = mockConsultations.filter(c => c.patientId === patientId);
    consultations.forEach(c => {
      activities.push({
        _id: 'act_c_' + c._id,
        type: 'CONSULTATION',
        title: 'Consultation Recorded',
        description: `Diagnosis: ${c.diagnosis || 'Pending'}`,
        date: c.date,
        performedBy: c.doctorId || 'System',
        details: {
          ChiefComplaint: c.chiefComplaint,
          Observations: c.observations,
          TreatmentPlan: c.treatmentPlan,
          Notes: c.notes
        },
        rawDate: c.date
      });
    });

    // 2. Therapies
    const therapies = mockTherapies.filter(t => t.patientId === patientId);
    therapies.forEach(t => {
      activities.push({
        _id: 'act_t_' + t._id,
        type: 'THERAPY',
        title: `Therapy Session: ${t.type}`,
        description: `Status: ${t.status}`,
        date: t.date,
        performedBy: t.therapistId || 'System',
        details: {
          Notes: t.notes,
          Outcome: t.outcome
        },
        rawDate: t.date
      });
    });

    // 3. Follow-ups
    const { followUps } = await followUpService.getPatientFollowUps(patientId);
    followUps.forEach(f => {
      activities.push({
        _id: 'act_f_' + f._id,
        type: 'FOLLOW-UP',
        title: `${f.type} - ${f.status}`,
        description: f.notes || 'No description',
        date: f.createdAt, // Record creation date as the activity
        performedBy: f.doctorId,
        details: {
          TargetDate: new Date(f.date).toLocaleDateString(),
          Priority: f.priority,
          CompletionNotes: f.completionNotes,
          RescheduleReason: f.rescheduleReason
        },
        rawDate: f.createdAt
      });
    });

    // 4. Documents
    const { documents } = await documentService.getPatientDocuments(patientId);
    documents.forEach(d => {
      activities.push({
        _id: 'act_d_' + d._id,
        type: 'DOCUMENT',
        title: `Document Uploaded: ${d.name}`,
        description: `Type: ${d.type}`,
        date: d.date,
        performedBy: d.uploadedBy || 'Admin',
        details: {
          Description: d.description,
          Size: d.fileSize
        },
        rawDate: d.date
      });
    });

    // 5. Invoices (Financial)
    const invoices = mockInvoices.filter(i => i.patientId === patientId);
    invoices.forEach(i => {
      activities.push({
        _id: 'act_i_' + i._id,
        type: 'FINANCIAL',
        title: `Invoice Created: ${i._id}`,
        description: `Amount: $${i.amount} - Status: ${i.status}`,
        date: i.date,
        performedBy: 'System',
        details: {
          Items: i.items?.map(it => it.name).join(', '),
          PaymentDate: i.paymentDate ? new Date(i.paymentDate).toLocaleDateString() : 'N/A'
        },
        rawDate: i.date
      });
    });

    // 6. Case Sheet
    const { caseSheet } = await caseSheetService.getCaseSheetByPatientId(patientId);
    if (caseSheet) {
      activities.push({
        _id: 'act_cs_' + caseSheet._id,
        type: 'CASE SHEET',
        title: 'Case Sheet Created',
        description: `Final Diagnosis: ${caseSheet.finalDiagnosis || 'Pending'}`,
        date: caseSheet.date,
        performedBy: caseSheet.doctorSignature?.doctorId || 'System',
        details: {
          Complaints: caseSheet.presentComplaints
        },
        rawDate: caseSheet.date
      });

      // 7. Treatment Protocols
      if (caseSheet.treatmentProtocols && caseSheet.treatmentProtocols.length > 0) {
        caseSheet.treatmentProtocols.forEach(p => {
          activities.push({
            _id: 'act_tp_' + p._id,
            type: 'PROTOCOL',
            title: 'Treatment Protocol Entry',
            description: p.notes,
            date: p.date,
            performedBy: p.doctorId || 'System',
            details: {
              'Added To': 'Case Sheet'
            },
            rawDate: p.date
          });
        });
      }
    }

    // Sort by Date descending (Newest first)
    activities.sort((a, b) => b.rawDate - a.rawDate);
    
    return { success: true, activities };
  }
};
