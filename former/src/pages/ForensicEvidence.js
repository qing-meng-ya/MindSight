import React, { useState } from 'react';

const ForensicEvidence = () => {
  const [activeSection, setActiveSection] = useState('dna-basic');

  const sections = [
    { id: 'dna-basic', label: 'DNA检验基础知识', icon: '🧬' },
    { id: 'str', label: 'STR分型', icon: '📊' },
    { id: 'paternity', label: '亲子鉴定', icon: '👨‍👩‍👧' },
    { id: 'mixed', label: '混合斑解读', icon: '🔬' },
    { id: 'standards', label: '技术标准', icon: '📚' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dna-basic':
        return <DNABasics />;
      case 'str':
        return <STRAnalysis />;
      case 'paternity':
        return <PaternityTest />;
      case 'mixed':
        return <MixedStainAnalysis />;
      case 'standards':
        return <EvidenceStandards />;
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-with-sidebar">
        <aside className="sidebar">
          <h3 className="sidebar-title">法医物证</h3>
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

const DNABasics = () => {
  return (
    <div className="form-card">
      <h2>🧬 DNA检验基础知识</h2>
      
      <div className="standard-card">
        <h3>什么是DNA？</h3>
        <p>DNA（脱氧核糖核酸）是携带遗传信息的分子，每个人的DNA序列都是独一无二的（除同卵双胞胎外）。法医物证鉴定利用DNA进行个体识别和亲缘关系鉴定。</p>
      </div>

      <div className="standard-card">
        <h3>法医DNA检材类型</h3>
        <ul style={{ marginLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li><strong>血液</strong> - 最常用的检材，DNA含量丰富</li>
          <li><strong>口腔拭子</strong> - 无创采样，适用于活体采样</li>
          <li><strong>毛发</strong> - 必须带毛囊才能提取DNA</li>
          <li><strong>精液/阴道分泌物</strong> - 性犯罪案件中的关键证据</li>
          <li><strong>组织/骨骼</strong> - 高度腐败或白骨化尸体</li>
          <li><strong>指甲/皮屑</strong> - 接触性检材</li>
        </ul>
      </div>

      <div className="standard-card">
        <h3>DNA提取方法</h3>
        <ul style={{ marginLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li><strong> Chelex-100法</strong> - 快速简便，适用于少量检材</li>
          <li><strong>酚/氯仿法</strong> - DNA纯度高，回收率高</li>
          <li><strong>磁珠法</strong> - 自动化程度高，结果稳定</li>
          <li><strong>硅柱法</strong> - DNA纯度和浓度高</li>
        </ul>
      </div>
    </div>
  );
};

const STRAnalysis = () => {
  return (
    <div className="form-card">
      <h2>📊 STR分型</h2>
      
      <div className="standard-card">
        <h3>什么是STR？</h3>
        <p>短串联重复序列（Short Tandem Repeat，STR）是DNA上由2-6个碱基组成的重复单元，重复次数在个体间存在差异，具有高度多态性，是法医DNA鉴定的核心技术。</p>
      </div>

      <div className="standard-card">
        <h3>常用STR基因座</h3>
        <table className="toxin-table" style={{ marginTop: '10px' }}>
          <thead>
            <tr>
              <th>基因座</th>
              <th>位置</th>
              <th>等位基因范围</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>D3S1358</td><td>3p21</td><td>8-19</td></tr>
            <tr><td>vWA</td><td>12p12-pter</td><td>10-22</td></tr>
            <tr><td>FGA</td><td>4q28</td><td>17-51.2</td></tr>
            <tr><td>TH01</td><td>11p15.5</td><td>3-14</td></tr>
            <tr><td>TPOX</td><td>2p23.2</td><td>6-14</td></tr>
            <tr><td>CSF1PO</td><td>5q33.1</td><td>7-15</td></tr>
            <tr><td>D5S818</td><td>5q21</td><td>7-16</td></tr>
            <tr><td>D13S317</td><td>13q22-31</td><td>7-15</td></tr>
            <tr><td>D7S820</td><td>7q11</td><td>6-15</td></tr>
            <tr><td>D8S1179</td><td>8q11.1-13</td><td>8-19</td></tr>
          </tbody>
        </table>
      </div>

      <div className="standard-card">
        <h3>STR分型结果解读</h3>
        <p>每个基因座可能出现1-2个峰（纯合子或杂合子），峰的高度反映DNA量。检测到多个来源的DNA时会出现混合分型。</p>
      </div>
    </div>
  );
};

const PaternityTest = () => {
  const [form, setForm] = useState({ child: '', father: '', mother: '' });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const pi = (Math.random() * 10 + 100).toFixed(2);
    const cpi = (pi * 10000).toFixed(0);
    const isMatch = Math.random() > 0.1;
    setResult({ 
      pi: parseFloat(pi), 
      cpi: parseFloat(cpi),
      conclusion: isMatch ? '支持存在亲缘关系' : '排除亲缘关系'
    });
  };

  return (
    <div className="form-card">
      <h2>👨‍👩‍👧 亲子鉴定</h2>
      
      <div className="standard-card">
        <h3>亲子鉴定原理</h3>
        <p>根据孟德尔遗传规律，子代的DNA一半来自父亲，一半来自母亲。通过比对可疑父亲与孩子的STR分型，计算亲权指数（PI）和累计亲权指数（CPI），判断是否存在亲缘关系。</p>
      </div>

      <div className="standard-card">
        <h3>亲权指数计算</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>孩子匹配基因座数</label>
            <input type="number" value={form.child} onChange={(e) => setForm({ ...form, child: e.target.value })} placeholder="如：16" />
          </div>
          <div className="form-group">
            <label>父亲匹配基因座数</label>
            <input type="number" value={form.father} onChange={(e) => setForm({ ...form, father: e.target.value })} placeholder="如：15" />
          </div>
        </div>
        <div className="form-actions">
          <button onClick={calculate}>计算（模拟）</button>
        </div>
        {result && (
          <div className="calculator-result">
            <div className="result-item">
              <span className="label">亲权指数(PI)</span>
              <span className="value">{result.pi}</span>
            </div>
            <div className="result-item">
              <span className="label">累计亲权指数(CPI)</span>
              <span className="value">{result.cpi}</span>
            </div>
            <div className="result-item">
              <span className="label">结论</span>
              <span className="value">{result.conclusion}</span>
            </div>
          </div>
        )}
      </div>

      <div className="standard-card">
        <h3>判断标准</h3>
        <ul style={{ marginLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li><strong>CPI ≥ 10000</strong> - 肯定生物学父亲关系</li>
          <li><strong>1000 ≤ CPI < 10000</strong> - 强烈支持生物学父亲关系</li>
          <li><strong>100 ≤ CPI < 1000</strong> - 支持生物学父亲关系</li>
          <li><strong>CPI < 0.0001</strong> - 排除生物学父亲关系</li>
        </ul>
      </div>
    </div>
  );
};

const MixedStainAnalysis = () => {
  return (
    <div className="form-card">
      <h2>🔬 混合斑解读</h2>
      
      <div className="standard-card">
        <h3>什么是混合斑？</h3>
        <p>混合斑是指由两个或两个以上个体的DNA混合形成的检材。常见于性犯罪案件中的精液与阴道分泌物混合，以及多人接触的物品表面。</p>
      </div>

      <div className="standard-card">
        <h3>混合斑分析步骤</h3>
        <ol style={{ marginLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li><strong>初步判断</strong> - 观察峰的数量和分布，初步判断贡献者人数</li>
          <li><strong>分型拆分</strong> - 使用专业软件或手工分析拆分各组分</li>
          <li><strong>参照比对</strong> - 与已知样本进行比对</li>
          <li><strong>结论出具</strong> - 根据分析结果出具鉴定意见</li>
        </ol>
      </div>

      <div className="standard-card">
        <h3>混合比例估算</h3>
        <p>当两个个体的DNA贡献比例约为1:1时最难分离。当比例大于10:1时，可能只能检测到主要贡献者的分型。</p>
      </div>

      <div className="standard-card">
        <h3>注意事项</h3>
        <ul style={{ marginLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li>混合斑检材需要更高的DNA质量要求</li>
          <li>结果解读需谨慎，避免主观臆断</li>
          <li>必要时进行多次实验验证</li>
        </ul>
      </div>
    </div>
  );
};

const EvidenceStandards = () => {
  const standards = [
    { title: '《法医DNA检验规范》', content: 'GA/T 1163-2014 法医DNA检验规范' },
    { title: '《亲子鉴定技术规范》', content: 'GB/T 37223-2018 亲子鉴定技术规范' },
    { title: '《生物检材中DNA的提取和纯化方法》', content: 'GA/T 1164-2014 DNA提取纯化规范' },
    { title: '《法医物证鉴定标准编写规范》', content: 'SF/T 002-2017 物证鉴定规范编写' },
  ];

  return (
    <div className="form-card">
      <h2>📚 法医物证技术标准</h2>
      {standards.map((s, i) => (
        <div key={i} className="standard-card">
          <h3>{s.title}</h3>
          <p>{s.content}</p>
        </div>
      ))}
    </div>
  );
};

export default ForensicEvidence;
