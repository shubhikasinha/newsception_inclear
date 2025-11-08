import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, PieChart, Pie } from "recharts";
import { Info, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EnhancedHeatmap({ articles, distribution, dividingCriteria, topic }) {
  const [viewMode, setViewMode] = useState("distribution"); // distribution, scatter, articles

  // Categorize articles into bins
  const categorizeArticles = () => {
    if (!articles || articles.length === 0) return [];

    const bins = [
      { range: "Strong A", min: -100, max: -60, color: "#059669", articles: [] },
      { range: "Moderate A", min: -60, max: -20, color: "#10b981", articles: [] },
      { range: "Lean A", min: -20, max: -5, color: "#6ee7b7", articles: [] },
      { range: "Neutral", min: -5, max: 5, color: "#94a3b8", articles: [] },
      { range: "Lean B", min: 5, max: 20, color: "#fca5a5", articles: [] },
      { range: "Moderate B", min: 20, max: 60, color: "#ef4444", articles: [] },
      { range: "Strong B", min: 60, max: 100, color: "#dc2626", articles: [] }
    ];

    articles.forEach(article => {
      // Calculate position based on perspective type and credibility
      let position = 0;
      if (article.perspective_type === "positive") {
        position = -(article.credibility_score || 75);
      } else if (article.perspective_type === "negative") {
        position = (article.credibility_score || 75);
      }

      const bin = bins.find(b => position >= b.min && position < b.max);
      if (bin) {
        bin.articles.push({ ...article, position });
      }
    });

    return bins;
  };

  const bins = categorizeArticles();
  const totalArticles = articles?.length || 0;

  const chartData = bins.map(bin => ({
    name: bin.range,
    count: bin.articles.length,
    percentage: totalArticles > 0 ? Math.round((bin.articles.length / totalArticles) * 100) : 0,
    color: bin.color
  }));

  // Scatter data for bubble chart
  const scatterData = bins.flatMap(bin => 
    bin.articles.map((article, idx) => ({
      x: bin.articles.indexOf(article),
      y: article.position,
      z: article.credibility_score || 75,
      name: article.title,
      source: article.source,
      color: bin.color
    }))
  );

  const criteria = dividingCriteria || {
    axis_name: "Coverage Spectrum",
    perspective_a_label: "Perspective A",
    perspective_b_label: "Perspective B"
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#1a1a1a] border-2 border-[#d4af37] p-3 shadow-lg">
          <p className="font-serif font-bold text-sm mb-1">{data.name}</p>
          <p className="font-serif text-xs">Articles: {data.count}</p>
          <p className="font-serif text-xs">Coverage: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#1a1a1a] border-2 border-[#d4af37] p-3 shadow-lg max-w-xs">
          <p className="font-serif font-bold text-xs mb-1 line-clamp-2">{data.name}</p>
          <p className="font-serif text-xs text-gray-600 dark:text-gray-400">{data.source}</p>
          <p className="font-serif text-xs mt-1">Credibility: {data.z}/100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-[#1a1a1a] border-2 border-[#1a1a1a] dark:border-[#333] p-6 md:p-8"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-2xl text-[#1a1a1a] dark:text-white mb-2">
              Coverage Analysis: {totalArticles} Sources
            </h3>
            <p className="font-serif text-sm text-gray-600 dark:text-gray-400">
              Distribution across: <span className="font-bold text-[#d4af37]">{criteria.axis_name}</span>
            </p>
          </div>
          <Badge className="bg-[#d4af37] text-black font-serif">
            AI Analyzed
          </Badge>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setViewMode("distribution")}
            variant={viewMode === "distribution" ? "default" : "outline"}
            size="sm"
            className="font-serif"
          >
            Distribution
          </Button>
          <Button
            onClick={() => setViewMode("scatter")}
            variant={viewMode === "scatter" ? "default" : "outline"}
            size="sm"
            className="font-serif"
          >
            Source Map
          </Button>
          <Button
            onClick={() => setViewMode("articles")}
            variant={viewMode === "articles" ? "default" : "outline"}
            size="sm"
            className="font-serif"
          >
            Article List
          </Button>
        </div>
      </div>

      {/* Distribution Bar Chart */}
      {viewMode === "distribution" && (
        <div className="mb-8">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fontFamily: 'serif' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                tick={{ fontSize: 12, fontFamily: 'serif' }}
                label={{ value: 'Number of Articles', angle: -90, position: 'insideLeft', style: { fontFamily: 'serif' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Percentage Summary */}
          <div className="grid grid-cols-7 gap-2 mt-4">
            {chartData.map((item, idx) => (
              <div key={idx} className="text-center">
                <div 
                  className="h-2 rounded-full mb-1"
                  style={{ backgroundColor: item.color }}
                />
                <p className="font-serif text-xs font-bold">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scatter Plot */}
      {viewMode === "scatter" && (
        <div className="mb-8">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Source Group"
                tick={{ fontSize: 12, fontFamily: 'serif' }}
                label={{ value: 'Source Distribution', position: 'bottom', style: { fontFamily: 'serif' } }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Position"
                domain={[-100, 100]}
                tick={{ fontSize: 12, fontFamily: 'serif' }}
                label={{ value: `${criteria.perspective_a_label} ← → ${criteria.perspective_b_label}`, angle: -90, position: 'insideLeft', style: { fontFamily: 'serif', fontSize: 11 } }}
              />
              <ZAxis type="number" dataKey="z" range={[100, 400]} name="Credibility" />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter data={scatterData} fill="#d4af37">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs font-serif text-gray-600 dark:text-gray-400 text-center mt-2">
            Bubble size represents credibility score • Y-axis shows perspective position
          </p>
        </div>
      )}

      {/* Article List View */}
      {viewMode === "articles" && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {bins.map((bin, binIdx) => (
            bin.articles.length > 0 && (
              <div key={binIdx}>
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: bin.color }}
                  />
                  <h4 className="font-serif font-bold text-sm">{bin.range}</h4>
                  <Badge variant="outline" className="text-xs">{bin.articles.length}</Badge>
                </div>
                <div className="space-y-2 ml-6">
                  {bin.articles.map((article, artIdx) => (
                    <a
                      key={artIdx}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border border-gray-200 dark:border-gray-800 hover:border-[#d4af37] transition-colors"
                    >
                      <p className="font-serif text-sm font-semibold line-clamp-2 mb-1">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-serif">{article.source}</span>
                        <span>•</span>
                        <span className="font-serif">Credibility: {article.credibility_score}/100</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Analysis Summary */}
      <div className="border-t-2 border-gray-200 dark:border-gray-800 pt-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Coverage Balance */}
          <div className="border-l-4 border-[#d4af37] pl-4">
            <div className="flex items-center gap-2 mb-2">
              {Math.abs(chartData[0]?.percentage - chartData[6]?.percentage) < 15 ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600" />
              )}
              <h4 className="font-serif font-bold text-sm">Coverage Balance</h4>
            </div>
            <p className="font-serif text-sm text-gray-700 dark:text-gray-300">
              {Math.abs(chartData[0]?.percentage - chartData[6]?.percentage) < 15 ? (
                "Sources are relatively balanced across perspectives."
              ) : (
                `Coverage shows a notable lean toward ${chartData[0]?.percentage > chartData[6]?.percentage ? criteria.perspective_a_label : criteria.perspective_b_label}.`
              )}
            </p>
          </div>

          {/* Source Diversity */}
          <div className="border-l-4 border-[#d4af37] pl-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#d4af37]" />
              <h4 className="font-serif font-bold text-sm">Source Diversity</h4>
            </div>
            <p className="font-serif text-sm text-gray-700 dark:text-gray-300">
              Analysis based on {totalArticles} sources with average credibility of{" "}
              {Math.round(articles?.reduce((acc, a) => acc + (a.credibility_score || 75), 0) / totalArticles || 75)}/100
            </p>
          </div>
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="mt-6 bg-gray-50 dark:bg-[#0a0a0a] p-4 rounded">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[#b8860b] dark:text-[#d4af37] mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="font-serif font-semibold text-sm mb-1">How to Read This</h5>
            <p className="font-serif text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              This visualization shows how {totalArticles} news sources covering "{topic}" distribute across the 
              <span className="font-bold"> {criteria.axis_name.toLowerCase()}</span>. 
              Each source is positioned based on its perspective and weighted by credibility score.
              A balanced story should show sources distributed across multiple categories.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}