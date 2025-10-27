    import React, { useState, useEffect } from 'react';
    import { firebase, currentAppId } from '../firebase'; // Import initialized firebase and app ID
    import CopyLinkButton from './CopyLinkButton'; // Import the CopyLinkButton component

    const IssueDetailPanel = ({ issue, db, defaultValues, onBack, isDesktop }) => {
        const [details, setDetails] = useState(issue);

        useEffect(() => {
            setDetails(issue); // Update local state when the selected issue prop changes
        }, [issue]);

        const handleUpdate = (field, value) => {
            // Optimistically update local state for better UX
            const updatedDetails = { ...details, [field]: value };
            setDetails(updatedDetails);
            
            // Update Firestore
            const docRef = firebase.doc(db, `/artifacts/${currentAppId}/public/data/issues`, issue.id);
            firebase.updateDoc(docRef, { [field]: value })
                .catch(e => {
                    console.error("Error updating doc: ", e);
                    // Optionally revert local state or show error to user
                    alert("Failed to update issue detail.");
                    setDetails(issue); // Revert to original issue data on error
                });
        };

        return (
            <div className="h-full flex flex-col bg-gray-50">
                <div className="p-4 flex-shrink-0 flex items-center">
                    {!isDesktop && (
                        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                    )}
                    <h3 className="text-lg font-bold text-gray-800 flex-grow">Deviation No: {details.deviationNo}</h3>
                    <CopyLinkButton issueId={issue.id} />
                </div>
               
                <div className="overflow-y-auto space-y-4 px-4 pb-4 border-t">
                    <div className="form-field">
                        <label>Progress</label>
                        <select value={details.status} onChange={(e) => handleUpdate('status', e.target.value)}>
                            <option>Open</option>
                            <option>Work In Progress</option>
                            <option>Closed</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Title</label>
                        <input type="text" value={details.title} onChange={(e) => handleUpdate('title', e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label>Problem</label>
                        <textarea value={details.problemDescription} onChange={(e) => handleUpdate('problemDescription', e.target.value)} rows="5"></textarea>
                    </div>
                    <div className="form-field">
                        <label>Solution</label>
                        <textarea value={details.solutionDescription || ''} onChange={(e) => handleUpdate('solutionDescription', e.target.value)} rows="5" placeholder="Describe the solution..."></textarea>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="form-field">
                            <label>Priority</label>
                            <select value={details.priority} onChange={(e) => handleUpdate('priority', e.target.value)}>
                                 {defaultValues.priority.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Technology</label>
                            <select value={details.technology} onChange={(e) => handleUpdate('technology', e.target.value)}>
                               {defaultValues.technology.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="form-field">
                            <label>Created by</label>
                            <input type="text" readOnly value={details.author} className="bg-gray-200" />
                        </div>
                        <div className="form-field">
                            <label>Assigned To</label>
                             <input list="assignedToListPanel" onFocus={(e) => e.target.select()} name="assignedTo" type="text" value={details.assignedTo} onChange={(e) => handleUpdate('assignedTo', e.target.value)} />
                             <datalist id="assignedToListPanel">
                                 {defaultValues.assignedTo.map(person => <option key={person.name} value={person.name} />)}
                             </datalist>
                        </div>
                    </div>
                    <div className="form-field">
                        <label>Due</label>
                        <input type="date" value={details.dueDate ? new Date(details.dueDate).toISOString().split('T')[0] : ''} onChange={(e) => handleUpdate('dueDate', e.target.value ? new Date(e.target.value).toISOString() : null)} />
                    </div>
                </div>
            </div>
        );
    };

    export default IssueDetailPanel;
    
