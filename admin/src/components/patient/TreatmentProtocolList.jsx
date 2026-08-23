import React from 'react';

const TreatmentProtocolList = ({ protocols, onAddProtocol, isDoctor }) => {
  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Treatment Protocols</h3>
        {isDoctor && (
          <button 
            onClick={onAddProtocol}
            className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary/90 text-sm font-medium transition"
          >
            + Add Protocol Entry
          </button>
        )}
      </div>

      {protocols.length === 0 ? (
        <div className="bg-gray-50 rounded border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500 mb-2">No treatment protocols recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {protocols.map((protocol, idx) => (
            <div key={protocol._id || idx} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-1 rounded">
                  Protocol Entry
                </span>
                <span className="text-xs text-amber-700">
                  {new Date(protocol.date).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-800 text-sm whitespace-pre-wrap">{protocol.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreatmentProtocolList;
