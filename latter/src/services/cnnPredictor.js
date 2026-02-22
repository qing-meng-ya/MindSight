const { PythonShell } = require('python-shell');
const path = require('path');

const CNN_SCRIPT_PATH = path.join(__dirname, '../../../组织病理CNN/main.py');

const predictImage = (imagePath) => {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'json',
      pythonPath: 'python',
      scriptPath: path.dirname(CNN_SCRIPT_PATH),
      args: [imagePath]
    };

    PythonShell.run('main.py', options, (err, results) => {
      if (err) {
        console.error('Python脚本错误:', err);
        return reject(new Error('模型预测失败，请确保CNN模型已正确配置'));
      }

      try {
        const result = results[results.length - 1];
        
        if (!result || !result.predicted_class) {
          return reject(new Error('模型返回结果无效'));
        }

        resolve({
          result: result.predicted_class,
          confidence: result.confidence || result.probability || 0,
          all_predictions: result.all_predictions || [],
          diagnosis_type: result.category || getCategoryByClass(result.predicted_class),
          details: {
            top_predictions: result.top_k || []
          }
        });
      } catch (parseError) {
        console.error('解析结果错误:', parseError);
        reject(new Error('解析预测结果失败'));
      }
    });
  });
};

const getCategoryByClass = (className) => {
  const categories = {
    '肺出血': '肺部病变',
    '肺水肿': '肺部病变', 
    '肺血栓': '肺部病变',
    '肺炎': '肺部病变',
    '冠心病': '心血管病变',
    '心肌纤维断裂': '心血管病变',
    '心肌炎': '心血管病变',
    '脑出血': '脑部病变',
    '脑水肿': '脑部病变',
    '脑血管畸形': '脑部病变',
    '脑蛛网膜下腔淤血': '脑部病变',
    '肝脂肪变性': '肝脏病变',
    '脾小动脉玻璃样改变': '脾脏病变',
    '肾小球纤维化': '肾脏病变',
    '胰腺炎': '胰腺病变'
  };
  return categories[className] || '其他病变';
};

const checkModelStatus = () => {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'json',
      pythonPath: 'python',
      scriptPath: path.dirname(CNN_SCRIPT_PATH)
    };

    PythonShell.run('main.py', options, (err, results) => {
      if (err) {
        return resolve({ loaded: false, error: err.message });
      }
      resolve({ loaded: true });
    });
  });
};

module.exports = { predictImage, checkModelStatus };
