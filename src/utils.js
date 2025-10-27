    import { useState, useEffect } from 'react';

    export const getStatusClass = (status) => {
        switch (status) {
            case 'Open': return 'bg-red-500 text-white';
            case 'Work In Progress': return 'bg-yellow-500 text-gray-800';
            case 'Closed': return 'bg-green-600 text-white';
            default: return 'bg-gray-400 text-white';
        }
    };

    export const getPriorityClass = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-600 font-semibold';
            case 'Medium': return 'text-yellow-600 font-semibold';
            case 'Low': return 'text-green-600 font-semibold';
            default: return 'text-gray-500';
        }
    };

    export const getDueDateInfo = (dueDateString) => {
        if (!dueDateString) return { className: 'text-gray-500', isPastDue: false, days: null };

        const now = new Date();
        const dueDate = new Date(dueDateString);
        now.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { className: 'bg-red-600 text-white px-2 py-0.5 text-xs font-semibold rounded-full', isPastDue: true, days: diffDays };
        }
        if (diffDays <= 7) {
            return { className: 'text-red-600 font-semibold', isPastDue: false, days: diffDays };
        }
        if (diffDays <= 30) {
            return { className: 'text-yellow-600 font-semibold', isPastDue: false, days: diffDays };
        }
        return { className: 'text-green-600 font-semibold', isPastDue: false, days: diffDays };
    };
    
    export const getAssignedToClass = (name, assignedToList) => {
        // Ensure assignedToList is an array of objects with a 'name' property
        if (!Array.isArray(assignedToList) || assignedToList.length === 0) {
            return 'text-gray-900';
        }
        const person = assignedToList.find(p => p && typeof p === 'object' && p.name === name);
        if (person && person.email) {
            return 'text-blue-600 font-semibold';
        }
        return 'text-gray-900';
    };


    export const useMediaQuery = (query) => {
        const [matches, setMatches] = useState(false);
        useEffect(() => {
            if (typeof window !== 'undefined') { // Check if window is defined (for server-side rendering safety)
                const media = window.matchMedia(query);
                if (media.matches !== matches) {
                    setMatches(media.matches);
                }
                const listener = () => setMatches(media.matches);
                // Use addEventListener for modern browsers
                media.addEventListener('change', listener);
                return () => media.removeEventListener('change', listener);
            }
        }, [matches, query]);
        return matches;
    };
