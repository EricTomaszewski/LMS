    import { useState } from 'react';
    import { firebase, currentAppId } from '../firebase'; // Import initialized firebase and app ID

    const AddIssueModal = ({ onClose, onSave, db, user, defaultValues }) => {
        const [formData, setFormData] = useState({
            title: '',
            problemDescription: '',
            solutionDescription: '',
            priority: defaultValues.priority[0] || 'Medium',
            assignedTo: '',
            technology: defaultValues.technology[0] || 'Electrical',
            dueDate: '',
        });
        const [isSaving, setIsSaving] = useState(false);

        const isSaveDisabled = !formData.title.trim() || !formData.problemDescription.trim() || isSaving;

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSave = async () => {
            if (isSaveDisabled) return;
            
            setIsSaving(true);
            const counterRef = firebase.doc(db, `/artifacts/${currentAppId}/public/data/counters`, "issueCounter");
            const issuesCollectionRef = firebase.collection(db, `/artifacts/${currentAppId}/public/data/issues`);

            try {
                const newDeviationNo = await firebase.runTransaction(db, async (transaction) => {
                    const counterDoc = await transaction.get(counterRef);
                    let nextVal = 1;
                    if (!counterDoc.exists()) {
                        transaction.set(counterRef, { current: nextVal });
                    } else {
                        nextVal = counterDoc.data().current + 1;
                        transaction.update(counterRef, { current: nextVal });
                    }
                    return nextVal;
                });

                await firebase.addDoc(issuesCollectionRef, {
                    title: formData.title.trim(),
                    problemDescription: formData.problemDescription.trim(),
                    solutionDescription: formData.solutionDescription.trim(),
                    priority: formData.priority,
                    assignedTo: formData.assignedTo,
                    technology: formData.technology,
                    deviationNo: newDeviationNo,
                    status: 'Open',
                    author: user?.email || user?.displayName || 'Anonymous',
                    authorId: user?.uid,
                    createdAt: new Date().toISOString(),
                    order: Date.now(), // Use timestamp for initial order
                    ...(formData.dueDate && { dueDate: new Date(formData.dueDate).toISOString() }),
                });
                
                onSave(); // Call the callback passed from App.jsx to close the modal
            } catch (e) {
                console.error("Transaction failed: ", e);
                alert("Failed to add issue. Please try again.");
                setIsSaving(false); // Re-enable button on error
            }
            // No need to set isSaving back to false on success, as the component unmounts
        };
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Deviation</h2>
                    
                    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                        <div className="form-field">
                            <label className="block text-sm font-medium text-gray-600">Title <span className="text-red-500">*</span></label>
                            <input name="title" value={formData.title} onChange={handleChange} type="text" className="mt-1 w-full" />
                        </div>
                        <div className="form-field">
                            <label className="block text-sm font-medium text-gray-600">Problem <span className="text-red-500">*</span></label>
                            <textarea name="problemDescription" value={formData.problemDescription} onChange={handleChange} rows="4" className="mt-1 w-full"></textarea>
                        </div>
                        <div className="form-field">
                            <label className="block text-sm font-medium text-gray-600">Solution</label>
                            <textarea name="solutionDescription" value={formData.solutionDescription} onChange={handleChange} rows="4" className="mt-1 w-full"></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="form-field">
                                <label className="block text-sm font-medium text-gray-600">Priority</label>
                                <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 w-full">
                                    {defaultValues.priority.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label className="block text-sm font-medium text-gray-600">Technology</label>
                                <select name="technology" value={formData.technology} onChange={handleChange} className="mt-1 w-full">
                                    {defaultValues.technology.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                         <div className="form-field">
                            <label className="block text-sm font-medium text-gray-600">Assigned To</label>
                            <input list="assignedToList" onFocus={(e) => e.target.select()} name="assignedTo" value={formData.assignedTo} onChange={handleChange} type="text" placeholder="Select or type a name" className="mt-1 w-full" />
                            <datalist id="assignedToList">
                                {defaultValues.assignedTo.map(person => <option key={person.name} value={person.name} />)}
                            </datalist>
                        </div>
                        <div className="form-field">
                            <label className="block text-sm font-medium text-gray-600">Due</label>
                            <input name="dueDate" value={formData.dueDate} onChange={handleChange} type="date" className="mt-1 w-full" />
                        </div>
                    </div>

                    <div className="flex justify-end mt-6 space-x-3 pt-4 border-t">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleSave} disabled={isSaveDisabled} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isSaving ? 'Saving...' : 'Save Issue'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    export default AddIssueModal;
    
