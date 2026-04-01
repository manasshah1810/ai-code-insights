import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DataTableColumn<T> {
    header: string;
    accessorKey: keyof T;
    cell?: (value: any, row: T) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    className?: string;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    className
}: DataTableProps<T>) {
    return (
        <div className={cn("overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm", className)}>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/80 backdrop-blur-md">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={cn(
                                        "px-6 py-4 font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px]",
                                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {data.map((row, rowIdx) => (
                            <motion.tr
                                key={row.id || rowIdx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: rowIdx * 0.05, duration: 0.3 }}
                                className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
                            >
                                {columns.map((col, colIdx) => (
                                    <td
                                        key={colIdx}
                                        className={cn(
                                            "px-6 py-4 align-middle",
                                            col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                                            col.className
                                        )}
                                    >
                                        {col.cell ? col.cell(row[col.accessorKey], row) : (row[col.accessorKey] as any)}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
