import { consultationService } from './consultationService';
import therapySessionService from './therapySessionService';
import { documentService } from './documentService';
import { followUpService } from './followUpService';
import { caseSheetService } from './caseSheetService';
import { invoiceService } from './invoiceService';

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const patientActivityService = {
  getPatientActivity: async (patientId) => {
    await delay();
    let activities = [];

    // 1. Consultations
    try {
      const cRes = await consultationService.getConsultations({ patientId });
      const consultations = Array.isArray(cRes?.result)
        ? cRes.result
        : (Array.isArray(cRes?.content) ? cRes.content : (Array.isArray(cRes) ? cRes : []));
      consultations.filter(c => c.patientId === patientId || c.patient_id === patientId).forEach(c => {
        activities.push({
          _id: 'act_c_' + (c.uuid || c.id || c._id),
          type: 'CONSULTATION',
          title: 'Consultation Recorded',
          description: `Diagnosis: ${c.diagnosis || 'Pending'}`,
          date: new Date(c.createdAt || c.date || Date.now()).getTime(),
          performedBy: c.doctorName || c.doctorId || 'System',
          details: {
            ChiefComplaint: c.chiefComplaint,
            Observations: c.observations,
            TreatmentPlan: c.treatmentPlan,
            Notes: c.notes
          },
          rawDate: new Date(c.createdAt || c.date || Date.now()).getTime()
        });
      });
    } catch (e) {
      console.warn("Could not fetch consultations for activity:", e);
    }

    // 2. Therapies
    try {
      const sessions = await therapySessionService.getAllSessions(patientId);
      sessions.forEach(t => {
        activities.push({
          _id: 'act_t_' + (t.uuid || t._id),
          type: 'THERAPY',
          title: `Therapy Session: ${t.therapyName || 'Therapy'}`,
          description: `Status: ${t.status}`,
          date: t.date || Date.now(),
          performedBy: t.doctorName || 'System',
          details: {
            Notes: t.notes || ''
          },
          rawDate: t.date || Date.now()
        });
      });
    } catch (e) {
      console.warn("Could not fetch sessions for activity:", e);
    }

    // 3. Follow-ups
    const res = await followUpService.getFollowUps('', 0, 1000);
    const followUps = res.success ? res.followUps.filter(f => f.patientId === patientId) : [];
    followUps.forEach(f => {
      activities.push({
        _id: 'act_f_' + (f.uuid || f.id || f._id),
        type: 'FOLLOW-UP',
        title: `${f.type || 'Standard'} - ${f.status || 'Pending'}`,
        description: f.notes || 'No description',
        date: f.createdAt ? new Date(f.createdAt).getTime() : Date.now(), // Record creation date as the activity
        performedBy: f.doctorName || f.doctorId,
        details: {
          TargetDate: f.dueDate ? new Date(f.dueDate).toLocaleDateString() : 'N/A',
          Priority: f.priority || 'Normal',
        },
        rawDate: f.createdAt ? new Date(f.createdAt).getTime() : Date.now()
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
    const invRes = await invoiceService.getPatientInvoices(patientId);
    const invoices = invRes?.invoices || [];
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
