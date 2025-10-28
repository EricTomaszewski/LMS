    import { useState } from 'react';
    import { firebase, currentAppId } from '../firebase'; // Import initialized firebase and app ID

    // Internal component for managing Assigned To list (includes email)
    const AssignedToValueManager = ({ values, setValues }) => {
        const [newName, setNewName] = useState('');
        const [newEmail, setNewEmail] = useState('');

        const handleAdd = () => {
            if (!newName.trim()) {
                alert("Name is required.");
                return;
            }
            if (values.find(p => p.name.toLowerCase() === newName.trim().toLowerCase())) {
                alert("This name already exists.");
                return;
            }

            const newPerson = { name: newName.trim(), email: newEmail.trim() };
            setValues([...values, newPerson]);
            setNewName('');
            setNewEmail('');
        };

        const handleRemove = (nameToRemove) => {
            setValues(values.filter(p => p.name !== nameToRemove));
        };

        return (
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Assigned To</h3>
                <div className="space-y-2 mb-2 p-2 border rounded-md">
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name (Required)" className="w-full" />
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email (Optional)" className="w-full" />
                    <button onClick={handleAdd} className="w-full px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600">Add Person</button>
                </div>
                <ul className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
                    {values.map(person => (
                        <li key={person.name} className="flex justify-between items-center text-sm p-1 bg-white rounded">
                            <div>
                                <p className="font-semibold">{person.name}</p>
                                {person.email && <p className="text-xs text-gray-500">{person.email}</p>}
                            </div>
                            <button onClick={() => handleRemove(person.name)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    // Internal component for managing simple string lists (Priority, Technology)
    const ValueManager = ({ field, title, newValues, onNewValueChange, values, onAdd, onRemove }) => (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
            <div className="flex space-x-2 mb-2">
                <input 
                    type="text" 
                    value={newValues[field]}
                    onChange={(e) => onNewValueChange(field, e.target.value)}
                    placeholder={`New ${title}...`}
                    className="flex-grow"
                />
                <button onClick={() => onAdd(field)} className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600">Add</button>
            </div>
            <ul className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
                {values[field].map(value => (
                    <li key={value} className="flex justify-between items-center text-sm p-1 bg-white rounded">
                        <span>{value}</span>
                        <button onClick={() => onRemove(field, value)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );

    // Main Modal Component
    const DefaultValuesModal = ({ onClose, defaultValues, db }) => {
        const [localDefaults, setLocalDefaults] = useState(defaultValues);
        const [newValues, setNewValues] = useState({ priority: '', technology: '' });
        const [isSaving, setIsSaving] = useState(false);

        const handleGenericAdd = (field) => {
            const newValue = newValues[field].trim();
            if (newValue && !localDefaults[field].includes(newValue)) {
                setLocalDefaults(prev => ({ ...prev, [field]: [...prev[field], newValue] }));
                setNewValues(prev => ({ ...prev, [field]: '' }));
            }
        };
        
        const handleGenericRemove = (field, valueToRemove) => {
            setLocalDefaults(prev => ({ ...prev, [field]: prev[field].filter(v => v !== valueToRemove) }));
        };
        
        const handleGenericNewValueChange = (field, value) => {
            setNewValues(prev => ({ ...prev, [field]: value }));
        };

        const setAssignedTo = (newAssignedToArray) => {
            setLocalDefaults(prev => ({ ...prev, assignedTo: newAssignedToArray }));
        };

        const handleSave = async () => {
            setIsSaving(true);
            const docRef = firebase.doc(db, `/artifacts/${currentAppId}/public/data/defaultValues`, 'config');
            try {
                await firebase.setDoc(docRef, localDefaults, { merge: true });
                onClose();
            } catch (e) {
                console.error("Error saving default values: ", e);
                alert("Failed to save default values.");
            } finally {
                setIsSaving(false);
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 animate-fade-in-up">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Default Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <AssignedToValueManager values={localDefaults.assignedTo} setValues={setAssignedTo} />
                        <ValueManager 
                            field="priority" 
                            title="Priority" 
                            newValues={newValues}
                            onNewValueChange={handleGenericNewValueChange}
                            values={localDefaults}
                            onAdd={handleGenericAdd}
                            onRemove={handleGenericRemove}
                        />
                        <ValueManager 
                            field="technology" 
                            title="Technology" 
                            newValues={newValues}
                            onNewValueChange={handleGenericNewValueChange}
                            values={localDefaults}
                            onAdd={handleGenericAdd}
                            onRemove={handleGenericRemove}
                        />
                    </div>
                    <div className="flex justify-end mt-6 space-x-3 pt-4 border-t">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                            {isSaving ? 'Saving...' : 'Save Defaults'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    export default DefaultValuesModal;

    
