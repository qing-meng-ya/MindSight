const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb, createDiagnosis, getDiagnoses, getDiagnosisById, createReport } = require('../services/database');
const { predictImage } = require('../services/cnnPredictor');
const { generatePDFReport, generateWordReport } = require('../services/reportGenerator');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|tiff|bmp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('只支持图像文件'));
    }
  }
});

router.post('/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图像文件' });
    }

    const { patient_name, patient_id, notes } = req.body;
    const imagePath = req.file.path;

    const prediction = await predictImage(imagePath);

    const diagnosisData = {
      user_id: req.user.id,
      patient_name,
      patient_id,
      image_path: imagePath,
      prediction_result: prediction.result,
      confidence: prediction.confidence,
      diagnosis_type: prediction.diagnosis_type,
      notes
    };

    const result = createDiagnosis(diagnosisData);
    const diagnosisId = result.lastInsertRowid;

    res.json({
      success: true,
      diagnosis_id: diagnosisId,
      prediction: prediction,
      message: '诊断完成'
    });
  } catch (error) {
    console.error('预测错误:', error);
    res.status(500).json({ error: error.message || '预测失败' });
  }
});

router.get('/list', (req, res) => {
  try {
    const diagnoses = getDiagnoses(req.user.id, req.user.role);
    res.json({ success: true, data: diagnoses });
  } catch (error) {
    res.status(500).json({ error: '获取记录失败' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const diagnosis = getDiagnosisById(req.params.id);
    if (!diagnosis) {
      return res.status(404).json({ error: '记录不存在' });
    }
    
    if (diagnosis.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权查看此记录' });
    }

    res.json({ success: true, data: diagnosis });
  } catch (error) {
    res.status(500).json({ error: '获取详情失败' });
  }
});

router.post('/:id/report', async (req, res) => {
  try {
    const { report_type } = req.body;
    const diagnosis = getDiagnosisById(req.params.id);
    
    if (!diagnosis) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (diagnosis.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权生成此报告' });
    }

    const diagnosisData = {
      ...diagnosis,
      prediction_result: JSON.parse(diagnosis.prediction_result)
    };

    let filePath;
    if (report_type === 'pdf') {
      filePath = await generatePDFReport(diagnosisData, req.user);
    } else if (report_type === 'word') {
      filePath = await generateWordReport(diagnosisData, req.user);
    } else {
      return res.status(400).json({ error: '不支持的报告类型' });
    }

    createReport(diagnosis.id, req.user.id, report_type, filePath);

    res.json({
      success: true,
      download_url: `/api/reports/${path.basename(filePath)}`
    });
  } catch (error) {
    console.error('生成报告错误:', error);
    res.status(500).json({ error: '生成报告失败' });
  }
});

module.exports = router;
