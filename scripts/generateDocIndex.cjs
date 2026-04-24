const fs = require('fs');
const path = require('path');

function scanDir(dir, basePath = '') {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relPath = path.join(basePath, item.name);
    if (item.isDirectory()) {
      results.push(...scanDir(fullPath, relPath));
    } else if (item.name.toLowerCase().endsWith('.pdf')) {
      const stat = fs.statSync(fullPath);
      results.push({
        filename: item.name,
        relativePath: relPath.replace(/\\/g, '/'),
        size: stat.size,
        sizeHuman: stat.size > 1024 * 1024 * 1024 
          ? (stat.size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
          : (stat.size / 1024 / 1024).toFixed(2) + ' MB'
      });
    }
  }
  return results;
}

function classifyDoc(doc) {
  const f = doc.filename;
  const p = doc.relativePath;
  
  // Detect standard codes
  const standardMatch = f.match(/(GB[\/T\s]*\d{4,5}[-\.]\d{4}|GA[\/T\s]*\d{4}[-\.]\d{4}|SF[\/T\s]*\d{4}|GBT\s*\d+[-\.]\d{4}|GAT\s*\d+[-\.]\d{4}|GA_T\s*\d+[-\.]\d{4})/i);
  const standardCode = standardMatch ? standardMatch[1].replace(/\s/g, '') : null;
  
  // Category detection
  let category = '其他';
  let subCategory = '';
  let tags = [];
  
  if (p.includes('临床诊疗指南')) {
    category = '临床诊疗指南';
    if (f.includes('传染病')) subCategory = '感染科';
    else if (f.includes('急诊') || f.includes('灾难')) subCategory = '急诊医学';
    else if (f.includes('呼吸') || f.includes('结核')) subCategory = '呼吸科';
    else if (f.includes('神经') || f.includes('精神')) subCategory = '神经精神科';
    else if (f.includes('心血管') || f.includes('循环') || f.includes('高血压') || f.includes('血脂')) subCategory = '心血管科';
    else if (f.includes('消化') || f.includes('肝胆') || f.includes('内镜')) subCategory = '消化科';
    else if (f.includes('内分泌') || f.includes('代谢') || f.includes('糖尿病')) subCategory = '内分泌科';
    else if (f.includes('肾脏') || f.includes('肾病') || f.includes('泌尿')) subCategory = '肾内科/泌尿科';
    else if (f.includes('血液') || f.includes('造血')) subCategory = '血液科';
    else if (f.includes('风湿') || f.includes('免疫')) subCategory = '风湿免疫科';
    else if (f.includes('肿瘤') || f.includes('癌症') || f.includes('癌')) subCategory = '肿瘤科';
    else if (f.includes('皮肤') || f.includes('性病') || f.includes('皮炎')) subCategory = '皮肤科';
    else if (f.includes('眼科') || f.includes('视') || f.includes('屈光')) subCategory = '眼科';
    else if (f.includes('耳鼻') || f.includes('咽喉') || f.includes('头颈') || f.includes('听力') || f.includes('眩晕') || f.includes('鼻')) subCategory = '耳鼻咽喉头颈外科';
    else if (f.includes('口腔') || f.includes('牙') || f.includes('颌面') || f.includes('正畸') || f.includes('种植') || f.includes('黏膜') || f.includes('修复') || f.includes('牙周')) subCategory = '口腔科';
    else if (f.includes('骨科') || f.includes('创伤') || f.includes('手外') || f.includes('脊柱') || f.includes('关节') || f.includes('运医') || f.includes('骨松') || f.includes('骨矿')) subCategory = '骨科/运动医学';
    else if (f.includes('妇产') || f.includes('产科') || f.includes('妇科') || f.includes('生殖') || f.includes('围产') || f.includes('盆底') || f.includes('母胎')) subCategory = '妇产科';
    else if (f.includes('儿科') || f.includes('小儿') || f.includes('新生儿') || f.includes('儿童') || f.includes('先心') || f.includes('遗尿') || f.includes('川崎') || f.includes('遗传') || f.includes(' Vaccine ')) subCategory = '儿科';
    else if (f.includes('胸外') || f.includes('肺') || f.includes('食管') || f.includes('纵隔') || f.includes('胸')) subCategory = '胸外科';
    else if (f.includes('麻醉') || f.includes('疼痛') || f.includes('镇痛') || f.includes('分娩镇痛')) subCategory = '麻醉科/疼痛科';
    else if (f.includes('重症') || f.includes('ICU') || f.includes('脓毒') || f.includes('休克') || f.includes('营养') || f.includes('镇静') || f.includes('血流') || f.includes('机械通气') || f.includes('血液净化') || f.includes('超声') || f.includes('气管')) subCategory = '重症医学科';
    else if (f.includes('放射') || f.includes('影像') || f.includes('核医学') || f.includes('介入') || f.includes('CT') || f.includes('MRI') || f.includes('超声') || f.includes('PET') || f.includes('造影')) subCategory = '影像/放射科';
    else if (f.includes('检验') || f.includes('病理') || f.includes('分子') || f.includes('细胞') || f.includes('免疫') || f.includes('生化') || f.includes('微生物') || f.includes('流式') || f.includes('质谱') || f.includes('输血') || f.includes('凝血') || f.includes('抗凝') || f.includes('脂') || f.includes('糖化') || f.includes('激素') || f.includes('肿瘤标志物') || f.includes('基因') || f.includes('测序') || f.includes('PCR') || f.includes('流式') || f.includes('质谱') || f.includes('染色体') || f.includes('fish') || f.includes('FISH')) subCategory = '检验/病理科';
    else if (f.includes('康复') || f.includes('物理治疗') || f.includes('作业治疗') || f.includes('言语') || f.includes('吞咽') || f.includes('心肺') || f.includes('脊髓') || f.includes('脑外伤') || f.includes('截肢') || f.includes('烧伤') || f.includes('骨质疏松') || f.includes('运动') || f.includes('儿童康复') || f.includes('老年') || f.includes('肿瘤康复') || f.includes('盆底') || f.includes('姿势') || f.includes('平衡') || f.includes('步态') || f.includes('矫形') || f.includes('假肢') || f.includes('辅具') || f.includes('轮椅') || f.includes('环境') || f.includes('职业') || f.includes('社会') || f.includes('心理') || f.includes('认知') || f.includes('记忆') || f.includes('注意') || f.includes('执行') || f.includes('知觉') || f.includes('失认') || f.includes('失用') || f.includes('构音') || f.includes('失语') || f.includes('吞咽') || f.includes('呼吸') || f.includes('排痰') || f.includes('体位') || f.includes('引流') || f.includes('压力') || f.includes('瘢痕') || f.includes('挛缩') || f.includes('粘连') || f.includes('僵硬') || f.includes('疼痛') || f.includes('痉挛') || f.includes('肌张力') || f.includes('肌力') || f.includes('关节') || f.includes('活动度') || f.includes('协调') || f.includes('灵活') || f.includes('耐') || f.includes('速度') || f.includes('反应') || f.includes('感觉') || f.includes('本体') || f.includes('前庭') || f.includes('视觉') || f.includes('听觉') || f.includes('触觉') || f.includes('温度') || f.includes('痛觉') || f.includes('压觉') || f.includes('两点') || f.includes('振动') || f.includes('位置') || f.includes('运动觉') || f.includes('平衡觉') || f.includes('空间') || f.includes('时间') || f.includes('身体')) subCategory = '康复科';
    else subCategory = '综合';
    
    if (f.includes('指南')) tags.push('指南');
    if (f.includes('共识')) tags.push('共识');
    if (f.includes('规范')) tags.push('规范');
  }
  else if (p.includes('标准规范')) {
    category = '标准规范';
    if (f.includes('临床') || f.includes('关节') || f.includes('护理') || f.includes('营养') || f.includes('误工') || f.includes('伤残') || f.includes('损伤') || f.includes('视力') || f.includes('听觉') || f.includes('视觉') || f.includes('听力') || f.includes('道路交通事故') || f.includes('法医临床')) {
      subCategory = '法医临床学标准';
      tags.push('法医临床');
    }
    else if (f.includes('毒物') || f.includes('酒精') || f.includes('药物') || f.includes('毒化') || f.includes('毒理') || f.includes('中毒') || f.includes('血液') || f.includes('体液') || f.includes('气相') || f.includes('液相') || f.includes('色谱') || f.includes('质谱')) {
      subCategory = '法医毒物学标准';
      tags.push('法医毒物');
    }
    else if (f.includes('DNA') || f.includes('物证') || f.includes('遗传') || f.includes('STR') || f.includes('基因') || f.includes('亲子') || f.includes('个体') || f.includes('识别') || f.includes('种属') || f.includes('性别') || f.includes('血型') || f.includes('血清') || f.includes('酶型') || f.includes('人类学') || f.includes('骨骼') || f.includes('牙齿') || f.includes('指纹') || f.includes('掌纹') || f.includes('足迹') || f.includes('痕迹') || f.includes('文书') || f.includes('笔迹') || f.includes('印章') || f.includes('文件') || f.includes('声纹') || f.includes('画像') || f.includes('人像') || f.includes('面貌')) {
      subCategory = '法医物证学标准';
      tags.push('法医物证');
    }
    else if (f.includes('病理') || f.includes('尸') || f.includes('死亡') || f.includes('损伤') || f.includes('器官') || f.includes('组织') || f.includes('切片') || f.includes('显微镜') || f.includes('染色') || f.includes('免疫组化') || f.includes('电镜') || f.includes('超微')) {
      subCategory = '法医病理学标准';
      tags.push('法医病理');
    }
    else if (f.includes('司法') || f.includes('鉴定') || f.includes('程序') || f.includes('通则') || f.includes('资质') || f.includes('质量') || f.includes('管理') || f.includes('认证') || f.includes('认可') || f.includes('CNAS') || f.includes('CMA') || f.includes('实验室') || f.includes('能力验证') || f.includes('比对') || f.includes('盲测')) {
      subCategory = '司法鉴定管理标准';
      tags.push('司法鉴定');
    }
    else subCategory = '其他标准';
    
    if (standardCode) tags.push(standardCode);
  }
  else if (p.includes('法医学图谱')) {
    category = '法医学图谱';
    if (f.includes('尸')) subCategory = '尸体变化图谱';
    else if (f.includes('X线') || f.includes('CT') || f.includes('影像') || f.includes('放射')) subCategory = '影像学图谱';
    else if (f.includes('彩色') || f.includes('照片') || f.includes('图片')) subCategory = '彩色图谱';
    else subCategory = '综合图谱';
    tags.push('图谱');
  }
  else if (p.includes('法医学本科教材')) {
    category = '法医学教材';
    if (f.includes('病理')) { subCategory = '法医病理学'; tags.push('法医病理'); }
    else if (f.includes('临床')) { subCategory = '法医临床学'; tags.push('法医临床'); }
    else if (f.includes('毒物') || f.includes('毒化') || f.includes('毒理')) { subCategory = '法医毒物学'; tags.push('法医毒物'); }
    else if (f.includes('物证') || f.includes('遗传') || f.includes('DNA')) { subCategory = '法医物证学'; tags.push('法医物证'); }
    else if (f.includes('精神病')) { subCategory = '法医精神病学'; tags.push('法医精神病'); }
    else if (f.includes('人类学')) { subCategory = '法医人类学'; tags.push('法医人类学'); }
    else if (f.includes('鉴定') || f.includes('概论') || f.includes('导论')) { subCategory = '法医学概论'; tags.push('法医学概论'); }
    else { subCategory = '法医学综合'; tags.push('法医学'); }
    tags.push('教材');
  }
  else if (p.includes('第10版') || p.includes('renwei')) {
    category = '人卫医学教材';
    if (f.includes('病理')) subCategory = '病理学';
    else if (f.includes('药理')) subCategory = '药理学';
    else if (f.includes('内科')) subCategory = '内科学';
    else if (f.includes('外科')) subCategory = '外科学';
    else if (f.includes('诊断')) subCategory = '诊断学';
    else if (f.includes('影像') || f.includes('放射') || f.includes('超声')) subCategory = '医学影像学';
    else if (f.includes('生物') || f.includes('生化')) subCategory = '医学生物化学';
    else if (f.includes('微生物') || f.includes('免疫')) subCategory = '医学微生物学与免疫学';
    else if (f.includes('生理')) subCategory = '生理学';
    else if (f.includes('解剖')) subCategory = '系统解剖学/局部解剖学';
    else if (f.includes('组织') || f.includes('胚胎')) subCategory = '组织学与胚胎学';
    else if (f.includes('细胞') || f.includes('分子')) subCategory = '医学细胞生物学/分子生物学';
    else if (f.includes('遗传')) subCategory = '医学遗传学';
    else if (f.includes('寄生虫')) subCategory = '人体寄生虫学';
    else if (f.includes('病生') || f.includes('病理生理')) subCategory = '病理生理学';
    else if (f.includes('流行病') || f.includes('统计')) subCategory = '流行病学/医学统计学';
    else if (f.includes('预防') || f.includes('卫生') || f.includes('营养') || f.includes('环境') || f.includes('职业')) subCategory = '预防医学/卫生学';
    else if (f.includes('心理') || f.includes('精神')) subCategory = '医学心理学/精神病学';
    else if (f.includes('伦理') || f.includes('法律') || f.includes('法规')) subCategory = '医学伦理学/卫生法';
    else if (f.includes('导论') || f.includes('概论') || f.includes('基础') || f.includes('通论')) subCategory = '医学导论';
    else subCategory = '医学综合';
    tags.push('教材');
    tags.push('第10版');
  }
  
  // Extract title from filename (remove .pdf)
  let title = f.replace(/\.pdf$/i, '');
  
  return {
    ...doc,
    id: 'doc_' + Math.random().toString(36).substr(2, 9),
    category,
    subCategory,
    standardCode,
    title,
    tags: [...new Set(tags)]
  };
}

const rawDocs = scanDir('文档');
const classifiedDocs = rawDocs.map(classifyDoc);

// Generate summary
const summary = {
  total: classifiedDocs.length,
  byCategory: {}
};
for (const doc of classifiedDocs) {
  summary.byCategory[doc.category] = (summary.byCategory[doc.category] || 0) + 1;
}

const output = {
  generatedAt: new Date().toISOString(),
  summary,
  documents: classifiedDocs
};

fs.writeFileSync('src/data/documentIndex.json', JSON.stringify(output, null, 2), 'utf-8');
console.log('Generated documentIndex.json with', classifiedDocs.length, 'documents');
console.log('By category:', summary.byCategory);
