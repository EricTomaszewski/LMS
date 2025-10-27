    import React from 'react';
    import { getStatusClass, getPriorityClass, getDueDateInfo, getAssignedToClass } from '../utils'; // Import helper functions
    import CopyLinkButton from './CopyLinkButton'; // Import the CopyLinkButton component

    const IssueCard = ({ issue, onClick, isSelected, columns, defaultValues, ...props }) => {
        // Filter columns based on visibility settings, excluding title and deviationNo which are always shown prominently
        const visibleColumns = columns.filter(c => c.isVisible && c.id !== 'title' && c.id !== 'deviationNo');
        
        return (
            <div onClick={onClick} className={`bg-white p-4 rounded-lg shadow cursor-pointer border hover:border-blue-500 relative ${isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`} {...props}>
                 <div className="absolute top-1 right-1 z-10">
                    <CopyLinkButton issueId={issue.id} />
                </div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 pr-10 truncate">{issue.title}</h3>
                    <span className="font-bold text-gray-500 text-lg flex-shrink-0">#{issue.deviationNo}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    {/* Map through visible columns to display their data */}
                    {visibleColumns.map(col => {
                        const value = issue[col.id] || '--'; // Get the value for the current column ID, default to '--'

                        // Apply special styling based on column ID
                        if (col.id === 'status') {
                            return <span key={col.id} className={`px-2 py-1 inline-flex leading-5 font-semibold rounded-full ${getStatusClass(value)}`}>{value}</span>
                        }
                        if (col.id === 'priority') {
                             return <span key={col.id} className={getPriorityClass(value)}>{value}</span>
                        }
                         if (col.id === 'assignedTo') {
                             // Pass the defaultValues.assignedTo (list of people objects) for class checking
                             return <span key={col.id} className="text-gray-600"><strong className="font-medium text-gray-800">{col.label}:</strong> <span className={getAssignedToClass(value, defaultValues.assignedTo)}>{value}</span></span>
                        }
                        if (col.id === 'dueDate') {
                             const dueDateInfo = getDueDateInfo(value);
                             // Display the formatted date with its color class
                             return <span key={col.id} className="text-gray-600"><strong className="font-medium text-gray-800">{col.label}:</strong> <span className={dueDateInfo.className}>{value ? new Date(value).toLocaleDateString() : '--'}</span></span>
                        }
                         if (col.id === 'createdAt') {
                             // Display only the date part for 'Created' on cards for brevity
                             return <span key={col.id} className="text-gray-600"><strong className="font-medium text-gray-800">{col.label}:</strong> {value ? new Date(value).toLocaleDateString() : '--'}</span>
                        }
                        if (col.id === 'dueIn') {
                             const dueDateInfo = getDueDateInfo(issue.dueDate); // Use original dueDate for calculation
                             // Display 'Due In' days with color coding
                             return <span key={col.id} className="text-gray-600"><strong className="font-medium text-gray-800">{col.label}:</strong> <span className={dueDateInfo.className}>{issue.dueDate ? `${dueDateInfo.days}D` : '--'}</span></span>
                        }
                         // Default display for other columns
                        return <span key={col.id} className="text-gray-600"><strong className="font-medium text-gray-800">{col.label}:</strong> {value}</span>;
                    })}
                </div>
            </div>
        );
    };

    export default IssueCard;
    
