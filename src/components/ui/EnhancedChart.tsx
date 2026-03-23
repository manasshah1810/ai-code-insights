import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Label,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { motion } from 'framer-motion';

interface EnhancedChartProps {
    type: 'area' | 'bar' | 'line';
    data: any[];
    index: string;
    categories: string[];
    colors?: string[];
    valueFormatter?: (value: number) => string;
    className?: string;
    height?: number;
    xAxisLabel?: string;
    yAxisLabel?: string;
}

const CustomTooltip = ({ active, payload, label, valueFormatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <div className="space-y-1.5">
                    {payload.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium text-slate-600">{item.name}</span>
                            </div>
                            <span className="font-metric text-sm font-bold text-slate-900">
                                {valueFormatter ? valueFormatter(item.value) : item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export const EnhancedChart: React.FC<EnhancedChartProps> = ({
    type,
    data,
    index,
    categories,
    colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'],
    valueFormatter,
    className,
    height = 300,
    xAxisLabel,
    yAxisLabel,
}) => {
    const renderChart = () => {
        const chartMargin = { top: 10, right: 10, left: yAxisLabel ? 20 : 0, bottom: xAxisLabel ? 20 : 0 };

        switch (type) {
            case 'area':
                return (
                    <AreaChart data={data} margin={chartMargin}>
                        <defs>
                            {categories.map((cat, i) => (
                                <linearGradient key={cat} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey={index}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        >
                            {xAxisLabel && (
                                <Label
                                    value={xAxisLabel}
                                    offset={-10}
                                    position="insideBottom"
                                    style={{ fill: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}
                                />
                            )}
                        </XAxis>
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={valueFormatter}
                        >
                            {yAxisLabel && (
                                <Label
                                    value={yAxisLabel}
                                    angle={-90}
                                    position="insideLeft"
                                    offset={10}
                                    style={{ fill: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, textAnchor: 'middle', letterSpacing: '0.05em' }}
                                />
                            )}
                        </YAxis>
                        <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
                        {categories.map((cat, i) => (
                            <Area
                                key={cat}
                                type="monotone"
                                dataKey={cat}
                                stroke={colors[i % colors.length]}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#gradient-${i})`}
                                animationDuration={1500}
                                animationEasing="ease-in-out"
                            />
                        ))}
                    </AreaChart>
                );
            case 'bar':
                return (
                    <BarChart data={data} margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey={index}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        >
                            {xAxisLabel && (
                                <Label
                                    value={xAxisLabel}
                                    offset={-10}
                                    position="insideBottom"
                                    style={{ fill: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}
                                />
                            )}
                        </XAxis>
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={valueFormatter}
                        >
                            {yAxisLabel && (
                                <Label
                                    value={yAxisLabel}
                                    angle={-90}
                                    position="insideLeft"
                                    offset={10}
                                    style={{ fill: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, textAnchor: 'middle', letterSpacing: '0.05em' }}
                                />
                            )}
                        </YAxis>
                        <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip valueFormatter={valueFormatter} />} />
                        {categories.map((cat, i) => (
                            <Bar
                                key={cat}
                                dataKey={cat}
                                radius={[4, 4, 0, 0]}
                                animationDuration={1500}
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[i % colors.length]} fillOpacity={0.8} />
                                ))}
                            </Bar>
                        ))}
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={data} margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey={index}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        >
                            {xAxisLabel && (
                                <Label
                                    value={xAxisLabel}
                                    offset={-10}
                                    position="insideBottom"
                                    style={{ fill: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}
                                />
                            )}
                        </XAxis>
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={valueFormatter}
                        >
                            {yAxisLabel && (
                                <Label
                                    value={yAxisLabel}
                                    angle={-90}
                                    position="insideLeft"
                                    offset={10}
                                    style={{ fill: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, textAnchor: 'middle', letterSpacing: '0.05em' }}
                                />
                            )}
                        </YAxis>
                        <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
                        {categories.map((cat, i) => (
                            <Line
                                key={cat}
                                type="monotone"
                                dataKey={cat}
                                stroke={colors[i % colors.length]}
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                animationDuration={1500}
                            />
                        ))}
                    </LineChart>
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={className}
            style={{ height }}
        >
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </motion.div>
    );
};
