import React, { useEffect, useState } from 'react';
import { diagnosisAPI } from '../services/api';
import fileDownload from 'js-file-download';

const History = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const res = await diagnosisAPI.list();
      setRecords(res.data.data);
    } catch (error) {
      console.error('加载记录失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (id, reportType) => {
    try {
      const res = await diagnosisAPI.generateReport(id, reportType);
      const response = await fetch(res.data.download_url);
      const blob = await response.blob();
      fileDownload(blob, `诊断报告_${id}.${reportType}`);
    } catch (err) {
      alert('生成报告失败');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const parseResult = (resultStr) => {
    try {
      return JSON.parse(resultStr);
    } catch {
      return resultStr;
    }
  };

  return (
    <div className="history-page">
      <h2>诊断历史记录</h2>

      {loading ? (
        <p>加载中...</p>
      ) : records.length > 0 ? (
        <div className="records-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>编号</th>
                <th>患者姓名</th>
                <th>患者ID</th>
                <th>诊断结果</th>
                <th>置信度</th>
                <th>诊断类型</th>
                <th>日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.patient_name || '-'}</td>
                  <td>{record.patient_id || '-'}</td>
                  <td>{record.prediction_result}</td>
                  <td>{(record.confidence * 100).toFixed(1)}%</td>
                  <td>{record.diagnosis_type || '-'}</td>
                  <td>{formatDate(record.created_at)}</td>
                  <td className="actions">
                    <button onClick={() => setSelectedRecord(record)}>查看</button>
                    <button onClick={() => handleGenerateReport(record.id, 'pdf')}>PDF</button>
                    <button onClick={() => handleGenerateReport(record.id, 'word')}>Word</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">暂无诊断记录</p>
      )}

      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>诊断详情</h3>
            <div className="detail-content">
              <div className="detail-row">
                <span className="label">诊断编号:</span>
                <span>{selectedRecord.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">患者姓名:</span>
                <span>{selectedRecord.patient_name || '未填写'}</span>
              </div>
              <div className="detail-row">
                <span className="label">患者ID:</span>
                <span>{selectedRecord.patient_id || '未填写'}</span>
              </div>
              <div className="detail-row">
                <span className="label">诊断结果:</span>
                <span>{selectedRecord.prediction_result}</span>
              </div>
              <div className="detail-row">
                <span className="label">置信度:</span>
                <span>{(selectedRecord.confidence * 100).toFixed(2)}%</span>
              </div>
              <div className="detail-row">
                <span className="label">诊断类型:</span>
                <span>{selectedRecord.diagnosis_type || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="label">医师备注:</span>
                <span>{selectedRecord.notes || '无'}</span>
              </div>
              <div className="detail-row">
                <span className="label">诊断时间:</span>
                <span>{formatDate(selectedRecord.created_at)}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => handleGenerateReport(selectedRecord.id, 'pdf')}>下载PDF</button>
              <button onClick={() => handleGenerateReport(selectedRecord.id, 'word')} className="secondary">下载Word</button>
              <button onClick={() => setSelectedRecord(null)} className="secondary">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
