    import { useState, useEffect, useRef } from 'react';

    const ColumnToggle = ({ columns, setColumns }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        const toggleColumn = (id) => {
            const newColumns = columns.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c);
            setColumns(newColumns);
        };

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        return (
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsOpen(!isOpen)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs font-bold">
                    Columns
                </button>
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                        <ul className="py-1">
                            {columns.map(col => (
                                <li key={col.id} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={col.isVisible} onChange={() => toggleColumn(col.id)} />
                                        <span>{col.label}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    export default ColumnToggle;
    
