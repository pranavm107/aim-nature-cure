import React from 'react';

const ConsultationHistory = ({ consultations, onAddAddendum }) => {
  if (!consultations || consultations.length === 0) {
    return (
      <div className="bg-white border rounded text-sm w-full p-8 text-center text-gray-500">
        No consultations yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {consultations.sort((a,b) => b.date - a.date).map((cons) => (
        <div key={cons._id} className="bg-white border rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b">
            <div>
              <p className="text-sm text-gray-500">Date: {new Date(cons.date).toLocaleString()}</p>
              <p className="font-medium text-gray-800">Diagnosis: {cons.diagnosis}</p>
            </div>
            {/* BR-13 Enforcement: NO EDIT BUTTON */}
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
              {cons.addendums.map((addendum, idx) => (
                <div key={idx} className="mb-2 last:mb-0 text-sm">
                  <span className="text-gray-500 text-xs">[{new Date(addendum.date).toLocaleString()}]</span>
                  <p className="text-gray-700 ml-2">{addendum.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConsultationHistory;
