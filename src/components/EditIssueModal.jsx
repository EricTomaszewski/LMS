    import { useState } from 'react';
    import { firebase, currentAppId } from '../firebase'; // Import initialized firebase and app ID
    import CopyLinkButton from './CopyLinkButton'; // Import the CopyLinkButton component

    const EditIssueModal = ({ issue, onClose, onSave, db, defaultValues }) => {
        const [formData, setFormData] = useState({
            title: issue.title,
            problemDescription: issue.problemDescription,
            solutionDescription: issue.solutionDescription || '',
            priority: issue.priority,
            assignedTo: issue.assignedTo,
            technology: issue.technology,
            status: issue.status,
            dueDate: issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : '',
        });
        const [isSaving, setIsSaving] = useState(false);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSave = async () => {
            setIsSaving(true);
            const docRef = firebase.doc(db, `/artifacts/${currentAppId}/public/data/issues`, issue.id);
            const updatedData = {
                ...formData,
                ...(formData.dueDate && { dueDate: new Date(formData.dueDate).toISOString() }),
            };

            try {
                await firebase.updateDoc(docRef, updatedData);
                onSave(); // Close modal on successful save
            } catch (e) {
                console.error("Error updating document: ", e);
                alert("Failed to update issue.");
                setIsSaving(false); // Re-enable button on error
            }
            // No need to set isSaving back to false on success, as the component unmounts
        };
        
        return (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Edit Deviation No: {issue.deviationNo}</h2>
                        <CopyLinkButton issueId={issue.id} />
                    </div>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                       <div className="form-field">
                            <label>Title</label>
                            <input name="title" type="text" value={formData.title} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label>Problem</label>
                            <textarea name="problemDescription" value={formData.problemDescription} onChange={handleChange} rows="5"></textarea>
                        </div>
                         <div className="form-field">
                            <label>Solution</label>
                            <textarea name="solutionDescription" value={formData.solutionDescription} onChange={handleChange} rows="5" placeholder="Describe the solution..."></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-field">
                                <label>Progress</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option>Open</option>
                                    <option>Work In Progress</option>
                                    <option>Closed</option>
                                </select>
                            </div>
                             <div className="form-field">
                                <label>Priority</label>
                                <select name="priority" value={formData.priority} onChange={handleChange}>
                                    {defaultValues.priority.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="form-field">
                                <label>Technology</label>
                                <select name="technology" value={formData.technology} onChange={handleChange}>
                                   {defaultValues.technology.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Assigned To</label>
                                <input list="assignedToListEdit" onFocus={(e) => e.target.select()} name="assignedTo" type="text" value={formData.assignedTo} onChange={handleChange} />
                                <datalist id="assignedToListEdit">
                                    {defaultValues.assignedTo.map(person => <option key={person.name} value={person.name} />)}
                                </datalist>
                            </div>
                        </div>
                        <div className="form-field">
                            <label>Due</label>
                            <input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-3 pt-4 border-t">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    export default EditIssueModal;
    
