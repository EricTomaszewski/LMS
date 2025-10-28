import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { firebase, currentAppId } from './firebase'; // Import initialized Firebase
import LoginScreen from './components/LoginScreen';
import AddIssueModal from './components/AddIssueModal';
import EditIssueModal from './components/EditIssueModal';
import IssueDetailPanel from './components/IssueDetailPanel';
import ColumnToggle from './components/ColumnToggle';
import DefaultValuesModal from './components/DefaultValuesModal';
import IssueCard from './components/IssueCard';
import FilterPanel from './components/FilterPanel'; // Import FilterPanel
import { getStatusClass, getPriorityClass, getDueDateInfo, getAssignedToClass, useMediaQuery } from './utils'; // Assume utils.js holds helpers

// --- Main App Component ---
export default function App() {
    // Firebase state (auth and db come from import)
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    // App state
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [editingIssue, setEditingIssue] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDefaultsModalOpen, setIsDefaultsModalOpen] = useState(false);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false); // State for FilterPanel
    const [loading, setLoading] = useState(true);
    const [defaultValues, setDefaultValues] = useState({
        assignedTo: [{ name: 'Unknown', email: '' }],
        priority: ['Low', 'Medium', 'High'],
        technology: ['Electrical', 'Mechanical', 'Software', 'Civil'],
    });
    
    // UI state
    const [columns, setColumns] = useState(null);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    
    const [isDetailPanelVisible, setIsDetailPanelVisible] = useState(true);

    const [panelWidth, setPanelWidth] = useState(() => {
        const savedWidth = localStorage.getItem('issueTrackerPanelWidth');
        return savedWidth ? parseInt(savedWidth, 10) : window.innerWidth * 0.6;
    });

    const isResizing = useRef(false);
    const dragItem = useRef(); // For row drag-n-drop
    const dragOverItem = useRef(); // For row drag-n-drop
    const dragCol = useRef(null); // For col drag-n-drop
    const dragOverCol = useRef(null); // For col drag-n-drop
    const [dragOverIndex, setDragOverIndex] = useState(null); // For row drag visual feedback

    const [sortConfig, setSortConfig] = useState({ key: 'deviationNo', direction: 'descending' });
    const [filters, setFilters] = useState({
        status: [],
        author: [],
        assignedTo: [],
        priority: [],
        technology: [],
        dueDateEnd: ''
    });


    // Save UI settings to local storage
    useEffect(() => {
        if (user && columns) {
            localStorage.setItem(`issueTrackerColumns_${user.uid}`, JSON.stringify(columns));
        }
    }, [columns, user]);

    useEffect(() => {
        localStorage.setItem('issueTrackerPanelWidth', panelWidth);
    }, [panelWidth]);

    // --- Firebase Authentication Listener ---
    useEffect(() => {
        // Ensure firebase and auth are initialized before attaching listener
        if (!firebase?.auth) return; 
        const unsubscribe = firebase.onAuthStateChanged(firebase.auth, (currentUser) => {
            setUser(currentUser);
            setAuthReady(true); // Mark auth ready once listener fires
        });
        return () => unsubscribe(); // Cleanup listener on unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firebase]); // Depend on firebase object
    
    // Load user-specific column settings or set defaults
    useEffect(() => {
        if (user) {
            const savedColumns = localStorage.getItem(`issueTrackerColumns_${user.uid}`);
            if (savedColumns) {
                try {
                    setColumns(JSON.parse(savedColumns));
                } catch(e) {
                     console.error("Error parsing saved columns:", e);
                     // Fallback to default if parsing fails
                     setColumns([
                        { id: 'deviationNo', label: '#', isVisible: true },
                        { id: 'title', label: 'Title', isVisible: true },
                        { id: 'author', label: 'Created by', isVisible: false },
                        { id: 'priority', label: 'Priority', isVisible: true },
                        { id: 'status', label: 'Progress', isVisible: true },
                        { id: 'assignedTo', label: 'Assigned To', isVisible: true },
                        { id: 'problemDescription', label: 'Problem', isVisible: false },
                        { id: 'solutionDescription', label: 'Solution', isVisible: false },
                        { id: 'technology', label: 'Technology', isVisible: false },
                        { id: 'dueDate', label: 'Due', isVisible: false },
                        { id: 'dueIn', label: 'Due In', isVisible: true },
                        { id: 'createdAt', label: 'Created', isVisible: false },
                    ]);
                }
            } else {
                 setColumns([
                    { id: 'deviationNo', label: '#', isVisible: true },
                    { id: 'title', label: 'Title', isVisible: true },
                    { id: 'author', label: 'Created by', isVisible: false },
                    { id: 'priority', label: 'Priority', isVisible: true },
                    { id: 'status', label: 'Progress', isVisible: true },
                    { id: 'assignedTo', label: 'Assigned To', isVisible: true },
                    { id: 'problemDescription', label: 'Problem', isVisible: false },
                    { id: 'solutionDescription', label: 'Solution', isVisible: false },
                    { id: 'technology', label: 'Technology', isVisible: false },
                    { id: 'dueDate', label: 'Due', isVisible: false },
                    { id: 'dueIn', label: 'Due In', isVisible: true },
                    { id: 'createdAt', label: 'Created', isVisible: false },
                ]);
            }
        } else if (authReady) { // If auth is ready but no user, clear columns
             setColumns(null); // Or set to default if anonymous users should see something
        }
    }, [user, authReady]);


    // --- Data Fetching ---
    useEffect(() => {
        if (firebase?.db && user) { // Only fetch if db and user exist
            setLoading(true); // Start loading when user changes or db becomes available
            const issuesCollectionRef = firebase.collection(firebase.db, `/artifacts/${currentAppId}/public/data/issues`);
            const defaultsDocRef = firebase.doc(firebase.db, `/artifacts/${currentAppId}/public/data/defaultValues`, 'config');
            
            // Use 'order' for sorting fetched data initially if available, fallback to createdAt/deviationNo if needed
            const q = firebase.query(issuesCollectionRef, firebase.orderBy('order', 'asc')); 
            
            const unsubscribeIssues = firebase.onSnapshot(q, (snapshot) => {
                const issuesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setIssues(issuesData); // Raw issues, sorting happens in useMemo
                setLoading(false);
            }, (error) => { console.error("Error fetching issues:", error); setLoading(false); });

            const unsubscribeDefaults = firebase.onSnapshot(defaultsDocRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();

                    // Data migration: Check if assignedTo is an array of strings and convert to objects
                    let assignedToArray = data.assignedTo || [];
                    if (assignedToArray.length > 0 && typeof assignedToArray[0] === 'string') {
                        assignedToArray = assignedToArray.map(name => ({ name: name, email: '' }));
                        // Consider updating the document in Firestore here if migration is needed permanently
                    }

                    setDefaultValues({
                        assignedTo: assignedToArray,
                        priority: data.priority || ['Low', 'Medium', 'High'], // Fallback defaults
                        technology: data.technology || ['Electrical', 'Mechanical', 'Software', 'Civil'], // Fallback defaults
                    });
                } else {
                    // Initialize defaults if they don't exist
                     firebase.setDoc(defaultsDocRef, {
                        assignedTo: [{ name: 'Unknown', email: '' }],
                        priority: ['Low', 'Medium', 'High'],
                        technology: ['Electrical', 'Mechanical', 'Software', 'Civil'],
                    });
                }
            });

            return () => {
                unsubscribeIssues();
                unsubscribeDefaults();
            };
        } else if (!user && authReady) { // If auth is ready but no user (logged out)
             setIssues([]);
             setLoading(false);
             setColumns(null); // Clear columns on logout
             setSelectedIssue(null);
             setEditingIssue(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firebase, user, authReady]); // Added firebase to dependency array

    // Filtered and Sorted Issues Memoization
    const filteredAndSortedIssues = useMemo(() => {
        let sortableIssues = [...issues];

        // Filtering logic
        sortableIssues = sortableIssues.filter(issue => {
            const { status, author, assignedTo, priority, technology, dueDateEnd } = filters;
            if (status.length > 0 && !status.includes(issue.status)) return false;
            if (author.length > 0 && !author.includes(issue.author)) return false;
            if (assignedTo.length > 0 && !assignedTo.includes(issue.assignedTo)) return false;
            if (priority.length > 0 && !priority.includes(issue.priority)) return false;
            if (technology.length > 0 && !technology.includes(issue.technology)) return false;
            if (dueDateEnd) {
                if (!issue.dueDate) return false; // Exclude issues with no due date if filtering by date
                const issueDueDate = new Date(issue.dueDate);
                const filterEndDate = new Date(dueDateEnd);
                issueDueDate.setHours(0,0,0,0); // Compare dates only
                filterEndDate.setHours(0,0,0,0);
                if (issueDueDate > filterEndDate) return false;
            }
            return true;
        });

        // Sorting logic based on sortConfig
        if (sortConfig.key) {
            sortableIssues.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle potential undefined or null values, especially for 'order' initially
                aValue = aValue === undefined || aValue === null ? (sortConfig.direction === 'ascending' ? Infinity : -Infinity) : aValue;
                bValue = bValue === undefined || bValue === null ? (sortConfig.direction === 'ascending' ? Infinity : -Infinity) : bValue;


                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                // Fallback sort if primary keys are equal (e.g., sort by deviationNo if order is the same)
                if (sortConfig.key !== 'deviationNo') {
                     return (b.deviationNo || 0) - (a.deviationNo || 0); // Descending devNo as secondary sort
                }

                return 0;
            });
        }
        return sortableIssues;
    }, [issues, filters, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
             // If clicking again on descending, revert to default sort ('order' ascending)
             setSortConfig({ key: 'order', direction: 'ascending' }); 
             return;
        }
        // Otherwise, set the new sort key and direction
        setSortConfig({ key, direction });
    };


    // Handle URL hash on initial load or issue change
    useEffect(() => {
        if(filteredAndSortedIssues.length > 0 && !loading) { // Check loading state
            const hash = window.location.hash;
            if(hash.startsWith('#issue/')) {
                const issueId = hash.substring(7);
                const issueFromUrl = filteredAndSortedIssues.find(i => i.id === issueId);
                if (issueFromUrl && (!selectedIssue || selectedIssue.id !== issueId)) {
                    setSelectedIssue(issueFromUrl);
                     if (!isDesktop) { // Make sure panel is visible on mobile if linking directly
                        // No need for setIsDetailPanelVisible(true) as mobile uses full screen overlay
                    }
                    // Optional: remove hash after loading
                    // window.history.replaceState(null, null, ' ');
                }
            }
        }
    }, [filteredAndSortedIssues, isDesktop, loading, selectedIssue]); // Add loading and selectedIssue dependencies


    const handleSignOut = () => { firebase.signOut(firebase.auth); }; // Use imported auth
    
    const handleMouseMove = useCallback((e) => {
        if (!isResizing.current) return;
        const totalWidth = window.innerWidth;
        const newWidth = Math.max(300, Math.min(e.clientX, totalWidth - 300));
        setPanelWidth(newWidth);
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = useCallback(() => {
        isResizing.current = true;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove, handleMouseUp]);
    
    const handleColumnDragSort = () => {
         if (dragCol.current === null || dragOverCol.current === null || !columns) return;

         const currentVisibleCols = columns.filter(c => c.isVisible);
         const dragIndexInVisible = dragCol.current;
         const dropIndexInVisible = dragOverCol.current;

         // Check if indices are valid
        if (dragIndexInVisible < 0 || dragIndexInVisible >= currentVisibleCols.length || 
            dropIndexInVisible < 0 || dropIndexInVisible >= currentVisibleCols.length) {
                console.error("Invalid drag/drop indices for visible columns");
                dragCol.current = null;
                dragOverCol.current = null;
                return;
        }

         if (dragIndexInVisible === dropIndexInVisible) return;

         const draggedColId = currentVisibleCols[dragIndexInVisible]?.id;
         const dropColId = currentVisibleCols[dropIndexInVisible]?.id;

         if (!draggedColId || !dropColId) {
             console.error("Could not find dragged or dropped column ID");
             dragCol.current = null;
             dragOverCol.current = null;
             return; 
         }

         // Find original indices in the full columns array
         const originalDragIndex = columns.findIndex(c => c.id === draggedColId);
         const originalDropIndex = columns.findIndex(c => c.id === dropColId);

         if (originalDragIndex === -1 || originalDropIndex === -1) {
              console.error("Could not find original column indices");
              dragCol.current = null;
              dragOverCol.current = null;
              return; // Safety check
         }

         const newColumnsOrder = [...columns];
         const [draggedItem] = newColumnsOrder.splice(originalDragIndex, 1);
         
         // Need to recalculate the drop index based on the *current* state of newColumnsOrder
         const currentDropIndex = newColumnsOrder.findIndex(c => c.id === dropColId);


         newColumnsOrder.splice(currentDropIndex, 0, draggedItem);

         dragCol.current = null;
         dragOverCol.current = null;
         setColumns(newColumnsOrder);
    };

    const handleDragStart = (e, index) => {
        dragItem.current = index;
         // Optional: Improve drag visual
        e.dataTransfer.effectAllowed = 'move';
        // e.dataTransfer.setData('text/plain', index); // Not strictly necessary for this implementation
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
        setDragOverIndex(index);
    };

    const handleDragEnd = async () => {
        const draggedIndex = dragItem.current;
        const dropIndex = dragOverItem.current;
        setDragOverIndex(null); // Clear visual indicator
        dragItem.current = null;
        dragOverItem.current = null;

        if (draggedIndex === dropIndex || draggedIndex === undefined || dropIndex === undefined) return;

        // Use the currently displayed list (filteredAndSortedIssues) for reordering
        const currentDisplayedIssues = filteredAndSortedIssues;
        
        const reorderedIssuesForDisplay = [...currentDisplayedIssues]; 
        const draggedIssue = reorderedIssuesForDisplay.splice(draggedIndex, 1)[0];
        reorderedIssuesForDisplay.splice(dropIndex, 0, draggedIssue);
        
        // --- Crucial: Update Firestore 'order' based on the *full* list ---
        // Create a map of the new visual order based on IDs from the reordered DISPLAYED list
        const newOrderMap = new Map();
        reorderedIssuesForDisplay.forEach((issue, index) => {
            newOrderMap.set(issue.id, index);
        });

        // Apply this order logic to the original 'issues' array to get the *correct* full ordered list
        // Sort based on the map, placing unmapped items according to their original order or at the end
        const fullyReorderedIssues = [...issues].sort((a, b) => {
            const orderA = newOrderMap.has(a.id) ? newOrderMap.get(a.id) : Infinity; 
            const orderB = newOrderMap.has(b.id) ? newOrderMap.get(b.id) : Infinity;
            
            // If both are outside the current view, maintain original relative order (using existing order field)
             if (orderA === Infinity && orderB === Infinity) {
                return (a.order ?? Infinity) - (b.order ?? Infinity); // Fallback to existing order
            }
             if (orderA === Infinity) return 1; // Put items not in view at the end
            if (orderB === Infinity) return -1;

            return orderA - orderB;
        });


        // Update Firestore 'order' field using the fullyReorderedIssues
        const updatePromises = fullyReorderedIssues.map((issue, index) => {
            const issueRef = firebase.doc(firebase.db, `/artifacts/${currentAppId}/public/data/issues`, issue.id);
            return firebase.updateDoc(issueRef, { order: index }); 
        });


        try {
            await Promise.all(updatePromises);
             // Firestore listener will update the main `issues` state correctly.
        } catch (error) {
            console.error("Error reordering issues in Firestore:", error);
            // Revert optimistic update requires saving original state or refetching, 
            // but letting listener handle it is simpler for now.
            alert("Failed to reorder issues. Please try again.");
        }
    };
    
    // --- Render Logic ---
    if (!authReady || !firebase || !columns) {
        return <div className="flex items-center justify-center h-screen bg-gray-100"><h1 className="text-2xl font-bold text-gray-700">Loading Application...</h1></div>;
    }
    
    if (!user) {
        return <LoginScreen auth={firebase.auth} firebase={firebase} />;
    }

    return (
        <div className="flex flex-col h-screen bg-white font-sans text-sm text-gray-800 overflow-hidden">
            {/* Styles remain the same */}
             <style>{`
                .form-field label { display: block; font-size: 0.75rem; font-weight: 600; color: #4B5563; margin-bottom: 4px; }
                .form-field input, .form-field select, .form-field textarea { width: 100%; padding: 8px; border: 1px solid #D1D5DB; border-radius: 0.375rem; background-color: #F9FAFB; transition: border-color 0.2s; }
                .form-field input:focus, .form-field select:focus, .form-field textarea:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4); }
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                .drag-over-indicator { border-top: 2px solid #3B82F6 !important; }
            `}</style>

            <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 z-20 flex-wrap">
                <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-0">
                     <h1 className="text-xl font-bold text-gray-800">Deviations</h1>
                     <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-bold">ADD ISSUE</button>
                     <ColumnToggle columns={columns} setColumns={setColumns} />
                     <button onClick={() => setIsDefaultsModalOpen(true)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs font-bold">Defaults</button>
                     <button onClick={() => setIsFilterPanelOpen(true)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs font-bold">Filters</button> {/* Filter Button */}
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {isDesktop && <button onClick={() => setIsDetailPanelVisible(!isDetailPanelVisible)} title="Toggle Details Panel" className="p-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </button>}
                    <button onClick={handleSignOut} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-xs font-bold">SIGN OUT</button>
                </div>
            </header>
            
            <div className="flex flex-1 min-h-0">
                <main className={`flex-col min-w-0 ${isDesktop || !selectedIssue ? 'flex' : 'hidden'}`} style={{ width: isDesktop && isDetailPanelVisible ? `${panelWidth}px` : '100%' }}>
                    <div className="hidden md:block flex-grow overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    {columns.filter(c => c.isVisible).map((col, i) => (
                                        <th key={col.id}
                                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            <div 
                                                draggable={col.id !== 'deviationNo'} // Allow drag on header itself for columns
                                                onDragStart={(e) => { e.dataTransfer.setData("text/plain", ""); dragCol.current = i }} 
                                                onDragEnter={() => dragOverCol.current = i} 
                                                onDragEnd={handleColumnDragSort} 
                                                onDragOver={(e) => e.preventDefault()} 
                                                onClick={() => col.id === 'deviationNo' && requestSort('deviationNo')} // Only add click sort for '#'
                                                className={`flex items-center ${col.id !== 'deviationNo' ? 'cursor-move' : 'cursor-pointer'}`}
                                            >
                                                <span>{col.label}</span>
                                                 {col.id === 'deviationNo' && (
                                                    <div className="ml-1 flex flex-col">
                                                        <svg className={`h-2 w-2 ${sortConfig.key === 'deviationNo' && sortConfig.direction === 'ascending' ? 'text-blue-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M10 6l-4 4h8l-4-4z"/></svg>
                                                        <svg className={`h-2 w-2 ${sortConfig.key === 'deviationNo' && sortConfig.direction === 'descending' ? 'text-blue-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M10 14l4-4H6l4 4z"/></svg>
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan={columns.filter(c => c.isVisible).length} className="text-center py-10">Loading issues...</td></tr>
                                ) : filteredAndSortedIssues.map((issue, index) => ( // Use filteredAndSortedIssues here
                                    <tr key={issue.id} 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragEnter={(e) => handleDragEnter(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                        onClick={() => setSelectedIssue(issue)} 
                                        onDoubleClick={() => setEditingIssue(issue)}
                                        className={`cursor-pointer hover:bg-blue-50 ${selectedIssue?.id === issue.id ? 'bg-blue-100' : ''} ${dragOverIndex === index ? 'drag-over-indicator' : ''}`}>
                                        {columns.filter(c => c.isVisible).map(col => (
                                            <td key={col.id} className="px-4 py-2 whitespace-nowrap">
                                                 {col.id === 'dueDate' ? (
                                                    <span className={getDueDateInfo(issue.dueDate).className}>
                                                        {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : '--'}
                                                    </span>
                                                ) : col.id === 'dueIn' ? (
                                                     <span className={getDueDateInfo(issue.dueDate).className}>
                                                        {issue.dueDate ? `${getDueDateInfo(issue.dueDate).days}D` : '--'}
                                                    </span>
                                                ) : col.id === 'status' ? (
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(issue.status)}`}>{issue.status}</span>
                                                ) : col.id === 'priority' ? (
                                                    <span className={getPriorityClass(issue.priority)}>{issue.priority}</span>
                                                ) : col.id === 'createdAt' ? (
                                                     issue[col.id] ? new Date(issue[col.id]).toLocaleString() : '--'
                                                ) : col.id === 'assignedTo' ? (
                                                    <span className={getAssignedToClass(issue.assignedTo, defaultValues.assignedTo)}>{issue.assignedTo || '--'}</span>
                                                ) : col.id === 'title' || col.id === 'problemDescription' || col.id === 'solutionDescription' ? (
                                                    <span className="max-w-xs block truncate">{issue[col.id]}</span>
                                                ) : (
                                                    issue[col.id] || '--'
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="block md:hidden flex-grow overflow-y-auto p-2 space-y-2 bg-gray-100">
                         {loading ? <p className="text-center py-10">Loading issues...</p> : filteredAndSortedIssues.map((issue, index) => ( // Use filteredAndSortedIssues here
                            <div key={issue.id} 
                                 className={dragOverIndex === index ? 'drag-over-indicator' : ''}
                                 onDragStart={(e) => handleDragStart(e, index)}
                                 onDragEnter={(e) => handleDragEnter(e, index)}
                                 onDragEnd={handleDragEnd}
                                 onDragOver={(e) => e.preventDefault()}
                            >
                                <IssueCard
                                    issue={issue}
                                    onClick={() => setSelectedIssue(issue)}
                                    isSelected={selectedIssue?.id === issue.id}
                                    columns={columns}
                                    defaultValues={defaultValues}
                                    draggable
                                />
                             </div>
                        ))}
                    </div>
                </main>

                {isDesktop && isDetailPanelVisible && (
                    <>
                        <div onMouseDown={handleMouseDown} className="w-2 cursor-col-resize flex-shrink-0 bg-gray-200 hover:bg-blue-500 transition-colors"></div>
                        <div className="flex-1 min-w-[300px] flex flex-col">
                           {selectedIssue && <IssueDetailPanel issue={selectedIssue} db={firebase.db} firebase={firebase} defaultValues={defaultValues} isDesktop={true} />}
                        </div>
                    </>
                )}
                 {!isDesktop && selectedIssue && (
                    <div className="w-full h-full">
                       <IssueDetailPanel 
                           issue={selectedIssue} 
                           db={firebase.db} 
                           firebase={firebase} 
                           defaultValues={defaultValues} 
                           isDesktop={false}
                           onBack={() => setSelectedIssue(null)}
                       />
                    </div>
                )}
            </div>
            
            {isAddModalOpen && <AddIssueModal onClose={() => setIsAddModalOpen(false)} onSave={() => setIsAddModalOpen(false)} db={firebase.db} user={user} firebase={firebase} defaultValues={defaultValues} />}
            {editingIssue && <EditIssueModal issue={editingIssue} onClose={() => setEditingIssue(null)} onSave={() => setEditingIssue(null)} db={firebase.db} firebase={firebase} defaultValues={defaultValues} />}
            {isDefaultsModalOpen && <DefaultValuesModal onClose={() => setIsDefaultsModalOpen(false)} defaultValues={defaultValues} db={firebase.db} firebase={firebase} />}
            {isFilterPanelOpen && <FilterPanel issues={issues} filters={filters} setFilters={setFilters} onClose={() => setIsFilterPanelOpen(false)} />} {/* Filter Panel Modal */}
        </div>
    );
}

// Assume utils.js holds helper functions like getStatusClass, getPriorityClass, etc.
// Assume individual component files exist in ./components/

