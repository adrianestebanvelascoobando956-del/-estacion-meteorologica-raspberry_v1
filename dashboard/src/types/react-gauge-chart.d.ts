declare module 'react-gauge-chart' {
    import { FC } from 'react';

    interface GaugeChartProps {
        id: string;
        nrOfLevels?: number;
        percent?: number;
        colors?: string[];
        arcWidth?: number;
        arcPadding?: number;
        cornerRadius?: number;
        percentPrecision?: number;
        percentPrecisionSmall?: number;
        digitPadding?: number;
        textColor?: string;
        needleColor?: string;
        needleBaseColor?: string;
        hideText?: boolean;
        animate?: boolean;
        animDelay?: number;
        animateDuration?: number;
        marginInPercent?: number;
    }

    const GaugeChart: FC<GaugeChartProps>;
    export default GaugeChart;
}
