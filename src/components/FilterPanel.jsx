    import { useMemo } from 'react';

    const FilterPanel = ({ issues, filters, setFilters, onClose }) => {
        // Calculate available filter options based on the *current* list of issues
        const filterOptions = useMemo(() => {
            const options = {
                status: new Set(),
                author: new Set(),
                assignedTo: new Set(),
                priority: new Set(),
                technology: new Set()
            };
            issues.forEach(issue => {
                if (issue.status) options.status.add(issue.status);
                if (issue.author) options.author.add(issue.author);
                if (issue.assignedTo) options.assignedTo.add(issue.assignedTo);
                if (issue.priority) options.priority.add(issue.priority);
                if (issue.technology) options.technology.add(issue.technology);
            });
            // Convert Sets to sorted arrays for consistent display
            return {
                status: [...options.status].sort(),
                author: [...options.author].sort(),
                assignedTo: [...options.assignedTo].sort(),
                priority: [...options.priority].sort(),
                technology: [...options.technology].sort()
            };
        }, [issues]); // Recalculate options only when the main issues list changes

        // Handle changes for checkboxes (multi-select filters)
        const handleMultiSelectChange = (field, value) => {
            setFilters(prev => ({
                ...prev,
                [field]: prev[field].includes(value) 
                    ? prev[field].filter(v => v !== value) // Remove value if already selected
                    : [...prev[field], value] // Add value if not selected
            }));
        };
        
        // Handle changes for the 'Due Date End' input
        const handleDateChange = (e) => {
          setFilters(prev => ({ ...prev, dueDateEnd: e.target.value }));
        };

        // Reset all filters back to their initial empty state
        const resetFilters = () => {
            setFilters({
                status: [],
                author: [],
                assignedTo: [],
                priority: [],
                technology: [],
                dueDateEnd: ''
            });
        };

        // Reusable component for rendering a filter group (checkbox list)
        const FilterGroup = ({ title, field, options }) => (
            <div>
                <h4 className="font-semibold mb-2 text-gray-700">{title}</h4>
                <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50 space-y-1">
                    {/* Render a checkbox for each available option */}
                    {options.map(option => (
                        <label key={option} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded">
                            <input
                                type="checkbox"
                                className="rounded text-blue-600 focus:ring-blue-500"
                                checked={filters[field].includes(option)}
                                onChange={() => handleMultiSelectChange(field, option)}
                            />
                            <span>{option || '(Blank)'}</span> {/* Show (Blank) for empty values */}
                        </label>
                    ))}
                </div>
            </div>
        );
        
        return (
            // Modal overlay
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                {/* Modal content */}
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 animate-fade-in-up">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Filter Issues</h2>
                    {/* Grid layout for filter groups */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2 pb-4">
                        <FilterGroup title="Progress" field="status" options={filterOptions.status} />
                        <FilterGroup title="Created by" field="author" options={filterOptions.author} />
                        <FilterGroup title="Assigned To" field="assignedTo" options={filterOptions.assignedTo} />
                        <FilterGroup title="Priority" field="priority" options={filterOptions.priority} />
                        <FilterGroup title="Technology" field="technology" options={filterOptions.technology} />
                        {/* Due Date filter */}
                        <div>
                            <h4 className="font-semibold mb-2 text-gray-700">Due Date</h4>
                            <label className="text-sm block mb-1">Show issues due on or before:</label>
                            <input 
                                type="date" 
                                value={filters.dueDateEnd} 
                                onChange={handleDateChange} 
                                className="w-full mt-1 form-field" // Reuse form-field styling
                            />
                        </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex justify-end mt-6 space-x-3 pt-4 border-t">
                        <button onClick={resetFilters} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Reset Filters</button>
                        <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Done</button>
                    </div>
                </div>
            </div>
        );
    };

    export default FilterPanel;
    
