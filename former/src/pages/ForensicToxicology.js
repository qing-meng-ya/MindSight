import React, { useState } from 'react';

const ForensicToxicology = () => {
  const [activeSection, setActiveSection] = useState('toxin-search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');

  const sections = [
    { id: 'toxin-search', label: '毒物速查手册', icon: '🔍' },
    { id: 'alcohol-calc', label: '血液酒精浓度估算', icon: '🍺' },
    { id: 'standards', label: '技术标准', icon: '📚' },
  ];

  const toxins = [
    { name: '乙醇', symptoms: '欣快、兴奋→嗜睡、昏迷', lethalDose: '5-8g/kg', specimen: '血液、尿液', danger: 'high' },
    { name: '甲醇', symptoms: '头痛、视力模糊→失明、昏迷', lethalDose: '30-100ml', specimen: '血液、尿液、玻璃体', danger: 'high' },
    { name: '氰化物', symptoms: '呼吸困难、抽搐、昏迷', lethalDose: '0.05-0.2g', specimen: '血液、肝肾', danger: 'high' },
    { name: '砷', symptoms: '呕吐、腹泻、肾功能衰竭', lethalDose: '0.07-0.2g', specimen: '血液、尿液、毛发', danger: 'high' },
    { name: '汞', symptoms: '口腔炎、震颤、精神障碍', lethalDose: '0.2-1g', specimen: '血液、尿液、发', danger: 'medium' },
    { name: '吗啡', symptoms: '嗜睡、瞳孔缩小、呼吸抑制', lethalDose: '0.2-0.4g', specimen: '血液、尿液', danger: 'high' },
    { name: '苯巴比妥', symptoms: '嗜睡、眼球震颤、呼吸抑制', lethalDose: '2-10g', specimen: '血液、尿液', danger: 'medium' },
    { name: '一氧化碳', symptoms: '头痛、头晕→意识障碍', lethalDose: '50-60%HbCO', specimen: '血液', danger: 'high' },
    { name: '亚硝酸盐', symptoms: '发绀、呼吸困难、昏迷', lethalDose: '1-2g', specimen: '血液、饮水', danger: 'high' },
    { name: '有机磷', symptoms: '瞳孔缩小、流涎、抽搐', lethalDose: '10-50mg/kg', specimen: '血液、尿液', danger: 'high' },
  ];

  const filteredToxins = toxins.filter(t => {
    if (!searchTerm) return true;
    if (searchType === 'name') return t.name.includes(searchTerm);
    return t.symptoms.includes(searchTerm);
  });

  const getDangerLabel = (d) => {
    if (d === 'high') return { text: '剧毒/高毒', class: 'high' };
    return { text: '中等毒', class: 'medium' };
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'toxin-search':
        return <ToxinSearch 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          searchType={searchType}
          setSearchType={setSearchType}
          filteredToxins={filteredToxins}
          getDangerLabel={getDangerLabel}
        />;
      case 'alcohol-calc':
        return <AlcoholCalculator />;
      case 'standards':
        return <ToxicologyStandards />;
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-with-sidebar">
        <aside className="sidebar">
          <h3 className="sidebar-title">法医毒物</h3>
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

const ToxinSearch = ({ searchTerm, setSearchTerm, searchType, setSearchType, filteredToxins, getDangerLabel }) => {
  return (
    <div className="form-card">
      <h2>🔍 毒物速查手册</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        根据毒物名称或中毒症状快速检索
      </p>

      <div className="search-bar">
        <div className="search-input">
          <input 
            type="text" 
            placeholder="搜索毒物..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="filter-select" 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
        >
          <option value="name">按名称</option>
          <option value="symptom">按症状</option>
        </select>
      </div>

      <table className="toxin-table">
        <thead>
          <tr>
            <th>毒物名称</th>
            <th>中毒症状</th>
            <th>致死量</th>
            <th>检材要求</th>
            <th>毒性等级</th>
          </tr>
        </thead>
        <tbody>
          {filteredToxins.map((t, i) => {
            const danger = getDangerLabel(t.danger);
            return (
              <tr key={i}>
                <td><strong>{t.name}</strong></td>
                <td>{t.symptoms}</td>
                <td>{t.lethalDose}</td>
                <td>{t.specimen}</td>
                <td><span className={`danger-level ${danger.class}`}>{danger.text}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const AlcoholCalculator = () => {
  const [form, setForm] = useState({
    gender: '男',
    weight: 70,
    drinks: 500,
    alcoholPercent: 52,
    time: 2
  });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const alcoholGrams = (form.drinks / 100) * (form.alcoholPercent / 100) * 0.789;
    const waterContent = form.gender === '男' ? 0.68 : 0.55;
    const bac = (alcoholGrams / (form.weight * 1000 * waterContent)) * 100 - (0.015 * form.time);
    const bacResult = Math.max(0, bac);
    
    let status = '';
    if (bacResult < 20) status = '未饮酒或已代谢';
    else if (bacResult < 80) status = '饮酒状态';
    else if (bacResult < 100) status = '饮酒驾驶（酒驾）';
    else status = '醉酒驾驶（醉驾）';
    
    setResult({ bac: bacResult.toFixed(2), status });
  };

  return (
    <div className="form-card">
      <h2>🍺 血液酒精浓度估算</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        根据饮酒量估算血液酒精浓度（仅供参考）
      </p>

      <div className="form-grid">
        <div className="form-group">
          <label>性别</label>
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="男">男性</option>
            <option value="女">女性</option>
          </select>
        </div>
        <div className="form-group">
          <label>体重 (kg)</label>
          <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>饮酒量 (ml)</label>
          <input type="number" value={form.drinks} onChange={(e) => setForm({ ...form, drinks: parseFloat(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>酒精度数 (%)</label>
          <input type="number" value={form.alcoholPercent} onChange={(e) => setForm({ ...form, alcoholPercent: parseFloat(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>饮酒后时间 (小时)</label>
          <input type="number" value={form.time} onChange={(e) => setForm({ ...form, time: parseFloat(e.target.value) })} />
        </div>
      </div>

      <div className="form-actions">
        <button onClick={calculate}>计算</button>
      </div>

      {result && (
        <div className="calculator-result">
          <h4>📊 估算结果</h4>
          <div className="result-item">
            <span className="label">血液酒精浓度</span>
            <span className="value">{result.bac} mg/100ml</span>
          </div>
          <div className="result-item">
            <span className="label">状态</span>
            <span className="value">{result.status}</span>
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '16px' }}>
            注：此为估算值，实际以血液检测为准。个体差异、饮食习惯等因素会影响代谢
          </p>
        </div>
      )}
    </div>
  );
};

const ToxicologyStandards = () => {
  const standards = [
    { title: '《血液酒精含量的检验方法》', content: 'GA/T 107-2013 血液酒精检验方法' },
    { title: '《尿液中乙醇的检验方法》', content: 'GA/T 191-2016 尿液中乙醇检验' },
    { title: '《生物检材中常见毒物的液相色谱-质谱检验方法》', content: 'GB/T 42346-2023 毒物LC-MS检验' },
    { title: '《法医毒物司法鉴定规范》', content: 'SF/T 013-2017 法医毒物鉴定规范' },
  ];

  return (
    <div className="form-card">
      <h2>📚 法医毒物技术标准</h2>
      {standards.map((s, i) => (
        <div key={i} className="standard-card">
          <h3>{s.title}</h3>
          <p>{s.content}</p>
        </div>
      ))}
    </div>
  );
};

export default ForensicToxicology;
