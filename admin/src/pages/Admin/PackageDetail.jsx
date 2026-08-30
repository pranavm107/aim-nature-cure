import React, { useState, useEffect } from 'react';
import packageService from '../../services/packageService';
import therapyService from '../../services/therapyService';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import { Edit } from 'lucide-react';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [pkg, setPkg] = useState(null);
  const [availableTherapies, setAvailableTherapies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [packageData, thers] = await Promise.all([
        packageService.getPackageById(id),
        therapyService.getAllTherapies()
      ]);
      setPkg(packageData);
      setAvailableTherapies(thers);
    } catch (err) {
      toast.error('Failed to load package details');
      navigate('/admin/packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const getTherapyName = (thId) => {
    const th = availableTherapies.find(t => t._id === thId);
    return th ? th.name : 'Unknown Therapy';
  };

  const getTherapyDuration = (thId) => {
    const th = availableTherapies.find(t => t._id === thId);
    return th ? th.duration : 0;
  };

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;
  if (!pkg) return null;

  const totalSessions = pkg.therapies.reduce((sum, t) => sum + t.count, 0);
  const totalDuration = pkg.therapies.reduce((sum, t) => sum + (getTherapyDuration(t.therapyId) * t.count), 0);

  return (
    <PageContainer>
      <PageHeader 
        title={`Package: ${pkg.name}`} 
        subtitle="View package details and contents" 
      />
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">{pkg.name}</h2>
            {pkg.status ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>}
          </div>
          <button onClick={() => navigate(`/admin/packages/${id}/edit`)} className="text-slate-500 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary/30">
            <Edit className="w-4 h-4" /> Edit Package
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Price</p>
            <p className="font-semibold text-slate-800 text-lg">${pkg.price}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Therapies</p>
            <p className="font-semibold text-slate-800 text-lg">{pkg.therapies.length} Types</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Sessions</p>
            <p className="font-semibold text-slate-800 text-lg">{totalSessions}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Est. Duration</p>
            <p className="font-semibold text-slate-800 text-lg">{totalDuration} mins</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Included Therapies</h3>
          {pkg.therapies.length === 0 ? (
            <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg border border-slate-100">No therapies are included in this package.</p>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 font-semibold text-slate-700 text-sm">Therapy Name</th>
                    <th className="p-3 font-semibold text-slate-700 text-sm">Duration/Session</th>
                    <th className="p-3 font-semibold text-slate-700 text-sm text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {pkg.therapies.map((t, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="p-3 text-sm font-medium text-slate-800">{getTherapyName(t.therapyId)}</td>
                      <td className="p-3 text-sm text-slate-600">{getTherapyDuration(t.therapyId)} mins</td>
                      <td className="p-3 text-sm font-bold text-slate-800 text-right">x{t.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
          <button 
            onClick={() => navigate('/admin/packages')} 
            className="text-sm font-medium text-slate-600 hover:text-slate-800 flex items-center gap-1"
          >
            ← Back to Packages
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default PackageDetail;
