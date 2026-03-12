type MetricType = 'tests' | 'score' | 'accuracy' | 'time' | null;

export const getInsight = (metric: MetricType, attemptsLength: number, chartData: any[]) => {
    if (attemptsLength < 2) return "Complete more tests to unlock deep AI trend analysis and personalized strategies.";

    const last = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];

    switch (metric) {
        case 'score':
            return last.score > prev.score
                ? `Brilliant progress! You've jumped ${last.score - prev.score} points since the last test. Keep riding this upward momentum.`
                : `A slight dip of ${prev.score - last.score} points. Don't worry, analyze your mistakes and you'll bounce back stronger.`;
        case 'accuracy':
            return last.accuracy > 80
                ? "Exceptional precision! Your high accuracy minimizes negative marking, which is crucial for CUET."
                : "Your speed is good, but focus on precision. Skipping doubtful questions is better than losing marks to negative scoring.";
        case 'time':
            return "Your pacing is solid. The next step is maintaining this speed while scaling up the difficulty of questions you attempt early on.";
        case 'tests':
            return "Momentum is everything. Try to hit one full mock every 3-4 days to internalize the exam pattern completely.";
        default:
            return "Select a metric card above to dive deep into targeted AI insights.";
    }
};
