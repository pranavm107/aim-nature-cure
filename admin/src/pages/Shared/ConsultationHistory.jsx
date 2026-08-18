import React from 'react';

const ConsultationHistory = ({ timelineItems, onAddAddendum }) => {
  if (!timelineItems || timelineItems.length === 0) {
    return (
      <div className="bg-white border rounded text-sm w-full p-8 text-center text-gray-500">
        No clinical history yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {timelineItems.map((item, idx) => {
        if (item.type === 'consultation') {
          const cons = item.data;
          return (
            <div key={cons._id || idx} className="bg-white border-l-4 border-l-primary rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <div>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Consultation</span>
                  <p className="text-sm text-gray-500">Date: {new Date(cons.date).toLocaleString()}</p>
                  <p className="font-medium text-gray-800">Diagnosis: {cons.diagnosis}</p>
                </div>
                <button 
                  onClick={() => onAddAddendum(cons._id)}
                  className="text-primary border border-primary px-3 py-1 rounded text-sm hover:bg-primary hover:text-white transition-colors"
                >
                  Add Addendum
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Chief Complaint</p>
                  <p className="text-gray-600 mb-2">{cons.chiefComplaint}</p>
                  
                  <p className="font-medium text-gray-700">Observations</p>
                  <p className="text-gray-600">{cons.observations}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Treatment Plan</p>
                  <p className="text-gray-600 mb-2">{cons.treatmentPlan}</p>

                  <p className="font-medium text-gray-700">Notes</p>
                  <p className="text-gray-600">{cons.notes}</p>
                </div>
              </div>

              {cons.addendums && cons.addendums.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded p-3 border">
                  <p className="font-medium text-gray-800 mb-2 text-sm">Addendums:</p>
                  {cons.addendums.map((addendum, aIdx) => (
                    <div key={aIdx} className="mb-2 last:mb-0 text-sm">
                      <span className="text-gray-500 text-xs">[{new Date(addendum.date).toLocaleString()}]</span>
                      <p className="text-gray-700 ml-2">{addendum.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        } else if (item.type === 'therapy_session') {
          const sess = item.data;
          return (
            <div key={sess._id || idx} className="bg-white border-l-4 border-l-green-500 rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Therapy Session Completed</span>
                  <p className="text-sm text-gray-500">Scheduled: {sess.scheduledDate}</p>
                </div>
              </div>
              <div className="text-sm mt-2">
                <p className="font-medium text-gray-700">Therapy ID: <span className="font-normal text-gray-600">{sess.therapyId}</span></p>
                {sess.notes && (
                  <div className="mt-2">
                    <p className="font-medium text-gray-700">Notes:</p>
                    <p className="text-gray-600 italic">"{sess.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default ConsultationHistory;
