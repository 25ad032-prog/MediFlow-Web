import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Users, 
  UserPlus, 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  X
} from 'lucide-react';

export default function FamilyProfiles() {
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: 'Father',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+'
  });

  const fetchFamily = async () => {
    setLoading(true);
    try {
      const res = await api.getFamilyMembers();
      if (res.success) setFamily(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    try {
      const res = await api.addFamilyMember(newMember);
      if (res.success) {
        setFamily(prev => [...prev, res.data]);
        setShowAddModal(false);
        setNewMember({ name: '', relation: 'Mother', age: '', gender: 'Female', bloodGroup: 'B+' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Family Health Profiles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Book appointments for parents, children, or family members under one consolidated dashboard.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Family Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {family.map(member => (
          <div
            key={member.id}
            className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3 hover:border-teal-300 transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg mb-3">
                {member.gender === 'Female' ? '👩' : '👨'}
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">{member.name}</h3>
              <p className="text-xs text-teal-700 font-semibold mt-0.5">{member.relation}</p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <p className="flex justify-between">
                <span className="text-slate-400">Age:</span>
                <span className="font-bold text-slate-800">{member.age} yrs</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Blood Group:</span>
                <span className="font-bold text-teal-700">{member.bloodGroup}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 relative shadow-xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              <span>Add Family Member</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Relationship</label>
                  <select
                    value={newMember.relation}
                    onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs bg-white"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    placeholder="e.g. 58"
                    className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={newMember.gender}
                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                    className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={newMember.bloodGroup}
                    onChange={(e) => setNewMember({ ...newMember, bloodGroup: e.target.value })}
                    placeholder="e.g. O+, B+, A-"
                    className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
              >
                Save Family Profile
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
