import React from 'react';
import { Plus } from 'lucide-react';

const TreatmentProtocolList = ({ protocols, onAddProtocol, isDoctor }) => {
  return (
    <div className="mt-8 border-t border-slate-200 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Treatment Protocols</h3>
        {isDoctor && (
          <button 
            onClick={onAddProtocol}
            className="bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary/90 text-sm font-medium transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Protocol Entry
          </button>
        )}
      </div>

      {protocols.length === 0 ? (
        <div className="bg-slate-50 rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="text-slate-500 mb-2">No treatment protocols recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {protocols.map((protocol, idx) => (
            <div key={protocol._id || idx} className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-amber-800 bg-amber-200/50 border border-amber-300 px-2.5 py-1 rounded-md">
                  Protocol Entry
                </span>
                <span className="text-xs font-medium text-amber-700/70">
                  {new Date(protocol.date).toLocaleString()}
                </span>
              </div>
              <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed mt-3">{protocol.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreatmentProtocolList;
