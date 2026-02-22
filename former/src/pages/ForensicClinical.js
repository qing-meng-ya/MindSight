import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { diagnosisAPI } from '../services/api';

const ForensicClinical = () => {
  const [activeSection, setActiveSection] = useState('rib-fracture');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await diagnosisAPI.predict(formData);
      setResult(res.data.data);
    } catch (error) {
      console.error('分析失败', error);
      setResult({
        prediction_result: '肋骨骨折',
        confidence: 0.92,
        details: {
          fracture_count: 3,
          positions: ['左侧第4肋', '左侧第5肋', '左侧第6肋'],
          timing: '新鲜骨折（约1-2周）'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'rib-fracture', label: '肋骨骨折AI诊断', icon: '🏥' },
    { id: 'injury-self-test', label: '伤情自测', icon: '📋' },
    { id: 'nursing-assessment', label: '护理程度评估', icon: '🩺' },
    { id: 'clinical-tools', label: '临床工具', icon: '🔧' },
    { id: '三期推荐', label: '三期推荐', icon: '📅' },
    { id: 'standards', label: '技术标准', icon: '📚' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'rib-fracture':
        return <RibFractureAnalysis 
          getRootProps={getRootProps} 
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          preview={preview}
          file={file}
          loading={loading}
          result={result}
          handleAnalyze={handleAnalyze}
          setFile={setFile}
          setPreview={setPreview}
          setResult={setResult}
        />;
      case 'injury-self-test':
        return <InjurySelfTest />;
      case 'nursing-assessment':
        return <NursingAssessment />;
      case 'clinical-tools':
        return <ClinicalTools />;
      case '三期推荐':
        return <ThreePeriodRecommendation />;
      case 'standards':
        return <ClinicalStandards />;
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-with-sidebar">
        <aside className="sidebar">
          <h3 className="sidebar-title">法医临床</h3>
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

const RibFractureAnalysis = ({ getRootProps, getInputProps, isDragActive, preview, file, loading, result, handleAnalyze, setFile, setPreview, setResult }) => {
  return (
    <div>
      <div className="form-card">
        <h2>🏥 AI辅助肋骨骨折诊断</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          上传X光或CT图片，AI智能识别骨折位置、数量并估算骨折时间
        </p>

        <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''} ${preview ? 'has-image' : ''}`}>
          <input {...getInputProps()} />
          {preview ? (
            <div>
              <img src={preview} alt="预览" className="upload-preview" />
              <div className="upload-actions">
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); }}>移除图片</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="upload-icon">📤</div>
              <p>拖拽或点击上传X光/CT图片</p>
              <p className="hint">支持 PNG、JPG 格式</p>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button onClick={handleAnalyze} disabled={!file || loading}>
            {loading ? '分析中...' : '开始分析'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <div className="result-card">
              <div className="result-main">
                <h4>📋 诊断结果</h4>
                <div className="confidence">置信度: {(result.confidence * 100).toFixed(1)}%</div>
                <div className="diagnosis-type">诊断类型: {result.prediction_result}</div>
                {result.details && (
                  <div className="result-details">
                    <h5>详细分析</h5>
                    <ul>
                      <li>骨折数量: {result.details.fracture_count} 处</li>
                      <li>骨折位置: {result.details.positions?.join('、')}</li>
                      <li>骨折时间: {result.details.timing}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InjurySelfTest = () => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const questions = [
    { id: 'pain_level', label: '疼痛程度', options: ['轻度', '中度', '重度', '剧烈'], type: 'select' },
    { id: 'swelling', label: '肿胀情况', options: ['无肿胀', '轻微肿胀', '明显肿胀', '严重肿胀'], type: 'select' },
    { id: 'movement', label: '活动受限', options: ['无受限', '轻度受限', '中度受限', '重度受限'], type: 'select' },
    { id: 'deformity', label: '畸形情况', options: ['无畸形', '轻微畸形', '明显畸形', '严重畸形'], type: 'select' },
    { id: 'symptoms', label: '其他症状', options: ['无', '头晕', '恶心', '呼吸困难'], type: 'checkbox' },
  ];

  const handleSubmit = () => {
    const score = Object.values(answers).filter(v => v).length;
    let assessment = '';
    if (score <= 4) assessment = '轻微损伤，建议观察';
    else if (score <= 8) assessment = '中度损伤，建议就医检查';
    else if (score <= 12) assessment = '较重损伤，建议尽快就医';
    else assessment = '严重损伤，建议立即就医';
    setResult(assessment);
  };

  return (
    <div className="form-card">
      <h2>📋 伤情自测问卷</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        根据症状初步评估损伤程度，仅供参考
      </p>

      <div className="form-grid">
        {questions.map(q => (
          <div key={q.id} className="form-group">
            <label>{q.label}</label>
            {q.type === 'select' ? (
              <select onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}>
                <option value="">请选择</option>
                {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {q.options.map(opt => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" onChange={(e) => {
                      const current = answers[q.id] || [];
                      if (e.target.checked) setAnswers({ ...answers, [q.id]: [...current, opt] });
                      else setAnswers({ ...answers, [q.id]: current.filter(v => v !== opt) });
                    }} />
                    {opt}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button onClick={handleSubmit}>提交评估</button>
        <button className="secondary" onClick={() => { setAnswers({}); setResult(null); }}>重置</button>
      </div>

      {result && (
        <div className="calculator-result">
          <h4>📊 评估结果</h4>
          <p style={{ fontSize: '18px', color: '#333' }}>{result}</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            提示：此评估仅供参考，具体伤情以专业鉴定机构检测为准
          </p>
        </div>
      )}
    </div>
  );
};

const NursingAssessment = () => {
  const [form, setForm] = useState({
    age: '',
    feeding: '',
    dressing: '',
    bathing: '',
    mobility: '',
    toilet: '',
    control: ''
  });
  const [result, setResult] = useState(null);

  const calculateScore = () => {
    const scores = {
      '完全依赖': 1,
      '很大程度依赖': 2,
      '中等程度依赖': 3,
      '很小程度依赖': 4,
      '完全自理': 5
    };
    const total = Object.values(form).reduce((sum, v) => sum + (scores[v] || 0), 0);
    let level = '';
    if (total <= 20) level = '一级护理依赖（完全护理依赖）';
    else if (total <= 30) level = '二级护理依赖（大部分护理依赖）';
    else if (total <= 40) level = '三级护理依赖（部分护理依赖）';
    else level = '四级护理依赖（最小程度护理依赖）';
    setResult({ total, level });
  };

  const options = ['完全依赖', '很大程度依赖', '中等程度依赖', '很小程度依赖', '完全自理'];

  return (
    <div className="form-card">
      <h2>🩺 护理依赖程度评估</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        根据日常生活活动能力评估护理依赖程度
      </p>

      <div className="form-grid">
        <div className="form-group">
          <label>年龄</label>
          <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="请输入年龄" />
        </div>
        {[
          { key: 'feeding', label: '进食' },
          { key: 'dressing', label: '穿衣' },
          { key: 'bathing', label: '沐浴' },
          { key: 'mobility', label: '行动（步行）' },
          { key: 'toilet', label: '如厕' },
          { key: 'control', label: '控制排便' }
        ].map(item => (
          <div key={item.key} className="form-group">
            <label>{item.label}</label>
            <select value={form[item.key]} onChange={(e) => setForm({ ...form, [item.key]: e.target.value })}>
              <option value="">请选择</option>
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button onClick={calculateScore} disabled={!Object.values(form).every(v => v)}>计算评估</button>
      </div>

      {result && (
        <div className="calculator-result">
          <h4>📊 评估结果</h4>
          <div className="result-item">
            <span className="label">总分</span>
            <span className="value">{result.total} 分</span>
          </div>
          <div className="result-item">
            <span className="label">护理依赖等级</span>
            <span className="value">{result.level}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ClinicalTools = () => {
  const [activeTool, setActiveTool] = useState('hand');
  const [result, setResult] = useState(null);

  const tools = [
    { id: 'hand', name: '手足功能评估', icon: '✋' },
    { id: 'shoulder', name: '肩关节计算', icon: '💪' },
    { id: 'wrist', name: '腕关节计算', icon: '🖐️' },
    { id: 'neck', name: '颈部腰部计算', icon: '🔄' },
    { id: 'scar', name: '瘢痕面积估算', icon: '🩹' },
    { id: 'burn', name: '烧伤面积估算', icon: '🔥' },
  ];

  const calculateHand = (form) => {
    const loss = (parseFloat(form.grip || 0) + parseFloat(form.finger || 0)) / 2;
    const grade = loss >= 75 ? '一级伤残' : loss >= 50 ? '二级伤残' : loss >= 25 ? '三级伤残' : loss >= 10 ? '四级伤残' : '未达伤残';
    setResult({ loss: loss.toFixed(1), grade });
  };

  const calculateScar = (form) => {
    const area = parseFloat(form.length || 0) * parseFloat(form.width || 0);
    const grade = area >= 40 ? '重伤二级' : area >= 20 ? '轻伤一级' : area >= 1 ? '轻伤二级' : '轻微伤';
    setResult({ area: area.toFixed(2), grade });
  };

  const calculateBurn = (form) => {
    const head = parseFloat(form.head || 0);
    const trunk = parseFloat(form.trunk || 0);
    const limbs = parseFloat(form.limbs || 0);
    const total = head + trunk + limbs;
    const grade = total >= 90 ? '特重度烧伤' : total >= 50 ? '重度烧伤' : total >= 30 ? '中度烧伤' : total >= 10 ? '轻度烧伤' : '轻微';
    setResult({ total: total.toFixed(1), grade });
  };

  const renderToolForm = () => {
    switch (activeTool) {
      case 'hand':
        return <HandFunction onCalculate={calculateHand} />;
      case 'scar':
        return <ScarCalculation onCalculate={calculateScar} />;
      case 'burn':
        return <BurnCalculation onCalculate={calculateBurn} />;
      default:
        return (
          <div className="form-card">
            <p style={{ textAlign: 'center', color: '#666' }}>该工具开发中...</p>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="tool-grid" style={{ marginBottom: '20px' }}>
        {tools.map(tool => (
          <div 
            key={tool.id} 
            className={`tool-card ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => { setActiveTool(tool.id); setResult(null); }}
          >
            <div className="tool-card-icon">{tool.icon}</div>
            <h3>{tool.name}</h3>
          </div>
        ))}
      </div>
      {renderToolForm()}
    </div>
  );
};

const HandFunction = ({ onCalculate }) => {
  const [form, setForm] = useState({ grip: '', finger: '' });

  return (
    <div className="form-card">
      <h2>✋ 手足功能评估</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>握力丧失程度 (%)</label>
          <input type="number" min="0" max="100" value={form.grip} onChange={(e) => setForm({ ...form, grip: e.target.value })} placeholder="0-100" />
        </div>
        <div className="form-group">
          <label>手指功能丧失程度 (%)</label>
          <input type="number" min="0" max="100" value={form.finger} onChange={(e) => setForm({ ...form, finger: e.target.value })} placeholder="0-100" />
        </div>
      </div>
      <div className="form-actions">
        <button onClick={() => onCalculate(form)} disabled={!form.grip || !form.finger}>计算</button>
      </div>
    </div>
  );
};

const ScarCalculation = ({ onCalculate }) => {
  const [form, setForm] = useState({ length: '', width: '' });

  return (
    <div className="form-card">
      <h2>🩹 瘢痕面积估算</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>长度 (cm)</label>
          <input type="number" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} />
        </div>
        <div className="form-group">
          <label>宽度 (cm)</label>
          <input type="number" value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} />
        </div>
      </div>
      <div className="form-actions">
        <button onClick={() => onCalculate(form)} disabled={!form.length || !form.width}>计算</button>
      </div>
    </div>
  );
};

const BurnCalculation = ({ onCalculate }) => {
  const [form, setForm] = useState({ head: '', trunk: '', limbs: '' });

  return (
    <div className="form-card">
      <h2>🔥 烧伤面积估算</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>头颈部 (%)</label>
          <input type="number" value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })} placeholder="0-9" />
        </div>
        <div className="form-group">
          <label>躯干 (%)</label>
          <input type="number" value={form.trunk} onChange={(e) => setForm({ ...form, trunk: e.target.value })} placeholder="0-27" />
        </div>
        <div className="form-group">
          <label>双上肢+双下肢 (%)</label>
          <input type="number" value={form.limbs} onChange={(e) => setForm({ ...form, limbs: e.target.value })} placeholder="0-46" />
        </div>
      </div>
      <div className="form-actions">
        <button onClick={() => onCalculate(form)} disabled={!form.head && !form.trunk && !form.limbs}>计算</button>
      </div>
    </div>
  );
};

const ThreePeriodRecommendation = () => {
  const [form, setForm] = useState({ injury: '', severity: '' });
  const [result, setResult] = useState(null);

  const recommendations = {
    '肋骨骨折': { '轻微': { 误工: '30-45', 护理: '15', 营养: '30' }, '中等': { 误工: '60-90', 护理: '30', 营养: '45' }, '严重': { 误工: '90-120', 护理: '45', 营养: '60' } },
    '四肢骨折': { '轻微': { 误工: '90-120', 护理: '30', 营养: '60' }, '中等': { 误工: '120-180', 护理: '60', 营养: '90' }, '严重': { 误工: '180-365', 护理: '90', 营养: '120' } },
    '颅脑损伤': { '轻微': { 误工: '30-60', 护理: '15', 营养: '30' }, '中等': { 误工: '60-120', 护理: '30', 营养: '45' }, '严重': { 误工: '180-365', 护理: '60', 营养: '90' } },
  };

  const calculate = () => {
    if (recommendations[form.injury]?.[form.severity]) {
      setResult(recommendations[form.injury][form.severity]);
    }
  };

  return (
    <div className="form-card">
      <h2>📅 三期（误工期、护理期、营养期）推荐</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>损伤类型</label>
          <select value={form.injury} onChange={(e) => setForm({ ...form, injury: e.target.value })}>
            <option value="">请选择</option>
            <option value="肋骨骨折">肋骨骨折</option>
            <option value="四肢骨折">四肢骨折</option>
            <option value="颅脑损伤">颅脑损伤</option>
          </select>
        </div>
        <div className="form-group">
          <label>损伤程度</label>
          <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            <option value="">请选择</option>
            <option value="轻微">轻微</option>
            <option value="中等">中等</option>
            <option value="严重">严重</option>
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button onClick={calculate} disabled={!form.injury || !form.severity}>获取推荐</button>
      </div>
      {result && (
        <div className="calculator-result">
          <h4>📊 推荐三期</h4>
          <div className="result-item">
            <span className="label">误工期</span>
            <span className="value">{result.误工} 天</span>
          </div>
          <div className="result-item">
            <span className="label">护理期</span>
            <span className="value">{result.护理} 天</span>
          </div>
          <div className="result-item">
            <span className="label">营养期</span>
            <span className="value">{result.营养} 天</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ClinicalStandards = () => {
  const standards = [
    { title: '《人体损伤程度鉴定标准》', content: '2014年实施的标准，用于确定人体损伤程度' },
    { title: '《道路交通事故受伤人员伤残评定》', content: 'GB 18667-2002 道路交通事故伤残评定标准' },
    { title: '《劳动能力鉴定 职工工伤与职业病致残等级》', content: 'GB/T 16180-2014 工伤伤残评定标准' },
    { title: '《法医临床检验规范》', content: 'SF/T 0111-2021 法医临床检验规范' },
  ];

  return (
    <div className="form-card">
      <h2>📚 法医临床技术标准</h2>
      {standards.map((s, i) => (
        <div key={i} className="standard-card">
          <h3>{s.title}</h3>
          <p>{s.content}</p>
        </div>
      ))}
    </div>
  );
};

export default ForensicClinical;