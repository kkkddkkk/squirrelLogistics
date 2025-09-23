import { useTheme } from "@emotion/react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const ReportPieChart = ({ data, colorState, dataKey }) => {

    const safeData = Array.isArray(data) ? data : [];

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart style={{ pointerEvents: "none" }} margin={{left: 0}}>
                <Pie
                    data={safeData}
                    innerRadius={0}   // 도넛 구멍 크기
                    outerRadius={125}  // 반지름
                    stroke="none !important"
                    dataKey={dataKey}
                    labelLine={false} 
                >
                    {safeData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={typeof colorState === "function" ? colorState(entry) : colorState[index % colorState.length]}
                            stroke="none"
                        />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};



export const ReportBarChart = ({ data, nameKey, valueKey }) => {

    const thisTheme = useTheme();

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart
                data={data}
                margin={{ left: 30 }}
                style={{ pointerEvents: "none" }}
                layout="vertical"
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" reversed
                    tick={{ fill: thisTheme.palette.text.primary, fontSize: 14, fontWeight: 500 }}
                />
                <YAxis dataKey={nameKey} type="category" orientation="right"
                    tick={{ fill: thisTheme.palette.text.primary, fontSize: 14, fontWeight: 500 }}
                    tickFormatter={(v) => v.length > 3 ? v.slice(0, 3) + '…' : v}
                />
                <Bar dataKey={valueKey} fill={thisTheme.palette.primary.main}>
                    여기서 값 표시
                    <LabelList dataKey={valueKey} position="insideLeft" style={{ fill: thisTheme.palette.background.default }} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}


export const ReportLineChart = ({ data, valueKey }) => {
    const thisTheme = useTheme();
    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month"
                    tick={{ fill: thisTheme.palette.text.primary, fontSize: 14, fontWeight: 500 }} />
                <YAxis
                    tick={{ fill: thisTheme.palette.text.primary, fontSize: 14, fontWeight: 500 }} />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey={valueKey}
                    stroke={thisTheme.palette.primary.main}
                    strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    );
}