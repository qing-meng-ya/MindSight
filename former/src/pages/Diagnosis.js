import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { diagnosisAPI } from '../services/api';
import fileDownload from 'js-file-download';

const Diagnosis = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [patientInfo, setPatientInfo] = useState({ patient_name: '', patient_id: '', notes: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const f = acceptedFiles[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.tiff', '.bmp'] },
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('请上传病理切片图像');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('patient_name', patientInfo.patient_name);
    formData.append('patient_id', patientInfo.patient_id);
    formData.append('notes', patientInfo.notes);

    try {
      const res = await diagnosisAPI.predict(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || '预测失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType) => {
    if (!result?.diagnosis_id) return;
    
    try {
      const res = await diagnosisAPI.generateReport(result.diagnosis_id, reportType);
      const response = await fetch(res.data.download_url);
      const blob = await response.blob();
      fileDownload(blob, `诊断报告_${result.diagnosis_id}.${reportType}`);
    } catch (err) {
      setError('生成报告失败');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setPatientInfo({ patient_name: '', patient_id: '', notes: '' });
  };

  return (
    <div className="diagnosis-page">
      <h2>病理切片诊断</h2>
      
      <form onSubmit={handleSubmit} className="diagnosis-form">
        <div className="form-section">
          <h3>1. 上传病理切片图像</h3>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} alt="预览" className="preview-image" />
            ) : (
              <p>{isDragActive ? '释放以上传' : '拖拽图像到此处，或点击选择'}</p>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>2. 患者信息（可选）</h3>
          <div className="form-row">
            <div className="form-group">
              <label>患者姓名</label>
              <input
                type="text"
                value={patientInfo.patient_name}
                onChange={(e) => setPatientInfo({ ...patientInfo, patient_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>患者ID</label>
              <input
                type="text"
                value={patientInfo.patient_id}
                onChange={(e) => setPatientInfo({ ...patientInfo, patient_id: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>备注</label>
            <textarea
              value={patientInfo.notes}
              onChange={(e) => setPatientInfo({ ...patientInfo, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="submit" disabled={loading || !file}>
            {loading ? '分析中...' : '开始分析'}
          </button>
          {result && <button type="button" onClick={reset} className="secondary">重置</button>}
        </div>
      </form>

      {result && (
        <div className="result-section">
          <h3>诊断结果</h3>
          <div className="result-card">
            <div className="result-main">
              <h4>主要诊断: {result.prediction?.result}</h4>
              <p className="confidence">置信度: {(result.prediction?.confidence * 100).toFixed(2)}%</p>
              <p className="diagnosis-type">诊断类型: {result.prediction?.diagnosis_type}</p>
            </div>
            
            {result.prediction?.all_predictions?.length > 0 && (
              <div className="result-details">
                <h5>其他可能结果:</h5>
                <ul>
                  {result.prediction.all_predictions.slice(0, 5).map((item, idx) => (
                    <li key={idx}>
                      {item.class}: {(item.probability * 100).toFixed(2)}%
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="result-actions">
              <button onClick={() => handleGenerateReport('pdf')}>下载PDF报告</button>
              <button onClick={() => handleGenerateReport('word')} className="secondary">下载Word报告</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnosis;
