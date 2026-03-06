const buildJointLoss = () => ({
  slug: 'joint-loss',
  title: '关节活动损失',
  description: '分关节部位评估活动受限程度。',
  children: [
    {
      slug: 'shoulder',
      title: '肩关节',
      description: '肩关节活动范围损失评估。',
    },
    {
      slug: 'wrist',
      title: '腕关节',
      description: '腕关节活动范围损失评估。',
    },
    {
      slug: 'waist-neck',
      title: '腰/颈部',
      description: '腰椎与颈椎活动损失评估。',
    },
  ],
});

const buildSharedEstimationTools = () => ({
  slug: 'calculation-tools',
  title: '计算估算工具',
  description: '常见法医估算与赔偿计算工具集合。',
  children: [
    buildJointLoss(),
    {
      slug: 'death-event-estimation',
      title: '死亡事件估算',
      description: '基于线索进行死亡事件相关估算。',
    },
    {
      slug: 'height-estimation',
      title: '推算身高',
      description: '根据骨骼参数推算身高区间。',
    },
    {
      slug: 'body-surface-area',
      title: '体表面积估算',
      description: '按输入参数计算体表面积。',
    },
    {
      slug: 'burn-area',
      title: '烧伤面积计算',
      description: '按规则快速计算烧伤面积比例。',
    },
    {
      slug: 'blood-alcohol',
      title: '血液酒精浓度估算',
      description: '估算血液酒精浓度变化。',
    },
    {
      slug: 'traffic-compensation',
      title: '车祸赔偿金额计算',
      description: '交通事故损害赔偿辅助计算。',
    },
    {
      slug: 'work-injury-compensation',
      title: '工伤赔偿金额计算',
      description: '工伤场景赔偿辅助计算。',
    },
    {
      slug: 'scar-area',
      title: '瘢痕面计算',
      description: '体表瘢痕面积量化计算。',
    },
  ],
});

const buildPredictionTools = () => ({
  slug: 'prediction-tools',
  title: '预测工具',
  description: '图像和特征输入的辅助预测模块。',
  children: [
    {
      slug: 'fracture-prediction',
      title: '骨折预测',
      description: '基于影像线索进行骨折预测。',
    },
    {
      slug: 'slice-prediction',
      title: '切片预测',
      description: '基于病理切片特征进行预测。',
    },
  ],
});

const buildSharedToolLibrary = (slug, title, description) => ({
  slug,
  title,
  description,
  children: [buildPredictionTools(), buildSharedEstimationTools()],
});

export const ROLE_PORTALS = {
  learner: {
    key: 'learner',
    title: '法医学习者',
    subtitle: '学习与训练路径',
    description: '聚焦知识学习、案例回顾和基础工具训练。',
    children: [
      {
        slug: 'knowledge-base',
        title: '知识库',
        description: '提供相关法律文件和专业书籍。',
      },
      {
        slug: 'historical-cases',
        title: '过往案例',
        description: '查阅经典与近期案例资料。',
      },
      {
        slug: 'community',
        title: '社区',
        description: '学习者交流与经验分享。',
      },
      buildSharedToolLibrary('common-tools', '常用工具', '常用预测和计算估算工具。'),
    ],
  },
  worker: {
    key: 'worker',
    title: '法医工作者',
    subtitle: '工作与专业支持路径',
    description: '聚焦工作场景下的工具、资料、答疑和护理计算。',
    children: [
      buildSharedToolLibrary('tool-library', '常用工具库', '执业场景高频工具集。'),
      {
        slug: 'material-library',
        title: '常用资料库',
        description: '标准文件、书籍和案件资料。',
        children: [
          {
            slug: 'standard-files',
            title: '标准文件',
            description: '法医相关标准与规范文件。',
          },
          {
            slug: 'professional-books',
            title: '专业书籍',
            description: '执业常用专业参考书籍。',
          },
          {
            slug: 'related-cases',
            title: '相关案件',
            description: '与当前工作相关的案件检索。',
          },
        ],
      },
      {
        slug: 'online-qa',
        title: '在线答疑',
        description: '社区与专业渠道在线答疑。',
        children: [
          {
            slug: 'community-qa',
            title: '社区答疑',
            description: '社区经验交流式答疑。',
          },
          {
            slug: 'professional-answers',
            title: '专业解答',
            description: '专家级专业问答支持。',
          },
        ],
      },
      {
        slug: 'nursing',
        title: '护理',
        description: '护理相关周期与依赖程度计算。',
        children: [
          {
            slug: 'work-nursing-nutrition',
            title: '误工、护理、营养期计算',
            description: '误工与护理营养期综合计算。',
          },
          {
            slug: 'nursing-dependency',
            title: '护理依赖程度计算',
            description: '护理依赖等级辅助评估。',
          },
        ],
      },
    ],
  },
  consultant: {
    key: 'consultant',
    title: '法医咨询者',
    subtitle: '自检与咨询路径',
    description: '聚焦初步检测、在线咨询和基础知识获取。',
    children: [
      {
        slug: 'initial-check',
        title: '初步检测',
        description: '咨询者可使用的基础自检模块。',
        children: [
          {
            slug: 'fracture-analysis',
            title: '骨折分析',
            description: '根据输入信息进行初步骨折分析。',
          },
          {
            slug: 'joint-loss-level',
            title: '关节活动损失程度',
            description: '关节活动受限程度初步评估。',
          },
          {
            slug: 'burn-area-check',
            title: '烧伤面积计算',
            description: '烧伤面积快速计算。',
          },
          {
            slug: 'hand-foot-assessment',
            title: '手足功能评估',
            description: '手足功能状态初步评估。',
          },
        ],
      },
      {
        slug: 'online-consult',
        title: '在线咨询',
        description: '在线预约、问答与鉴定师信息。',
        children: [
          {
            slug: 'appointment',
            title: '预约咨询',
            description: '预约法医咨询服务。',
          },
          {
            slug: 'qa-online',
            title: '在线问答',
            description: '在线提交问题并获得回复。',
          },
          {
            slug: 'specialist-list',
            title: '鉴定师列表',
            description: '可选鉴定师与专业方向列表。',
          },
        ],
      },
      {
        slug: 'knowledge-base',
        title: '知识库',
        description: '面向咨询者的基础知识和常见问题。',
        children: [
          {
            slug: 'forensic-basics',
            title: '法医基础知识',
            description: '法医流程与术语基础知识。',
          },
          {
            slug: 'standard-documents',
            title: '标准规范文件',
            description: '咨询者可读的标准规范文件。',
          },
          {
            slug: 'faq',
            title: '常见问题解答',
            description: '高频问题与标准解答。',
          },
        ],
      },
    ],
  },
};

export const roleList = Object.values(ROLE_PORTALS);

export const buildPortalPath = (roleKey, segments = []) => {
  if (!segments.length) {
    return `/portal/${roleKey}`;
  }
  return `/portal/${roleKey}/${segments.join('/')}`;
};

export const getRolePortal = (roleKey) => ROLE_PORTALS[roleKey] || null;

export const findPortalNode = (roleKey, segments = []) => {
  const role = getRolePortal(roleKey);
  if (!role) {
    return null;
  }

  if (!segments.length) {
    return role;
  }

  let current = role;
  for (const segment of segments) {
    if (!current.children) {
      return null;
    }
    current = current.children.find((item) => item.slug === segment);
    if (!current) {
      return null;
    }
  }

  return current;
};

export const resolvePortalTrail = (roleKey, segments = []) => {
  const role = getRolePortal(roleKey);
  if (!role) {
    return [];
  }

  const trail = [{ slug: '', title: role.title, roleKey, segments: [] }];
  let current = role;
  const activeSegments = [];

  for (const segment of segments) {
    if (!current.children) {
      return trail;
    }
    const next = current.children.find((item) => item.slug === segment);
    if (!next) {
      return trail;
    }
    activeSegments.push(segment);
    trail.push({
      slug: segment,
      title: next.title,
      roleKey,
      segments: [...activeSegments],
    });
    current = next;
  }

  return trail;
};

export const countLeafModules = (node) => {
  if (!node.children || !node.children.length) {
    return 1;
  }
  return node.children.reduce((total, child) => total + countLeafModules(child), 0);
};
