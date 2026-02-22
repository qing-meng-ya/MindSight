import React, { useState } from 'react';

const ForensicPsychiatry = () => {
  const [activeSection, setActiveSection] = useState('self-care');

  const sections = [
    { id: 'self-care', label: '精神障碍生活自理评估', icon: '🧠' },
    { id: 'standards', label: '技术标准', icon: '📚' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'self-care':
        return <SelfCareAssessment />;
      case 'standards':
        return <PsychiatryStandards />;
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-with-sidebar">
        <aside className="sidebar">
          <h3 className="sidebar-title">法医精神病</h3>
          <ul className="sidebar-menu">
            {sections.map(section => (
              <li key={section.id}>
                <a 
                  href="#" 
                  className={activeSection === section.id ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setActiveSection(section.id); }}
                >
                  <span>{section.icon}</span> {section.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
        <div className="page-content">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

const SelfCareAssessment = () => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const questions = [
    { id: 'eating', label: '进食', options: ['完全自理', '部分需帮助', '完全依赖'] },
    { id: 'dressing', label: '穿衣', options: ['完全自理', '部分需帮助', '完全依赖'] },
    { id: 'bathing', label: '沐浴', options: ['完全自理', '部分需帮助', '完全依赖'] },
    { id: 'toilet', label: '如厕', options: ['完全自理', '部分需帮助', '完全依赖'] },
    { id: 'grooming', label: '梳洗', options: ['完全自理', '部分需帮助', '完全依赖'] },
    { id: 'mobility', label: '行走', options: ['完全自理', '部分需帮助', '完全依赖'] },
    { id: 'communication', label: '交流', options: ['完全自理', '部分需帮助', '完全依赖'] },
    { id: 'decision', label: '日常决策', options: ['完全自理', '部分需帮助', '完全依赖'] },
  ];

  const scores = { '完全自理': 2, '部分需帮助': 1, '完全依赖': 0 };

  const calculate = () => {
    const total = Object.values(answers).reduce((sum, v) => sum + (scores[v] || 0), 0);
    let level = '';
    if (total >= 14) level = '轻度障碍 - 基本自理';
    else if (total >= 8) level = '中度障碍 - 部分依赖';
    else level = '重度障碍 - 完全依赖';
    setResult({ total, level });
  };

  return (
    <div className="form-card">
      <h2>🧠 精神障碍生活自理能力评估</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        评估精神障碍患者的日常生活自理能力
      </p>

      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {questions.map(q => (
          <div key={q.id} className="form-group">
            <label>{q.label}</label>
            <select value={answers[q.id] || ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}>
              <option value="">请选择</option>
              {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button onClick={calculate} disabled={Object.keys(answers).length < questions.length}>计算评估</button>
        <button className="secondary" onClick={() => { setAnswers({}); setResult(null); }}>重置</button>
      </div>

      {result && (
        <div className="calculator-result">
          <h4>📊 评估结果</h4>
          <div className="result-item">
            <span className="label">总分</span>
            <span className="value">{result.total} / 16</span>
          </div>
          <div className="result-item">
            <span className="label">自理能力等级</span>
            <span className="value">{result.level}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const PsychiatryStandards = () => {
  const standards = [
    { title: '《精神障碍者民事行为能力评定指南》', content: 'SF/T 009-2021 精神障碍民事行为能力评定' },
    { title: '《精神障碍者刑事责任能力评定指南》', content: 'SF/T 010-2021 精神障碍刑事责任能力评定' },
    { title: '《法医精神病学检验规范》', content: 'GA/T 1029-2016 法医精神病检验规范' },
    { title: '《精神损伤致残评定》', content: 'GB/T 31148-2014 精神损伤致残评定' },
  ];

  return (
    <div className="form-card">
      <h2>📚 法医精神病技术标准</h2>
      {standards.map((s, i) => (
        <div key={i} className="standard-card">
          <h3>{s.title}</h3>
          <p>{s.content}</p>
        </div>
      ))}
    </div>
  );
};

export default ForensicPsychiatry;
