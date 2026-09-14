import { getStore, setStore } from '../utils/mockStore';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const incentiveService = {
  getIncentiveRules: async () => {
    await delay();
    const mockIncentiveRules = getStore('mockIncentiveRules');
    const today = new Date().setHours(0, 0, 0, 0);

    // Sort descending by effective date
    let rules = [...mockIncentiveRules].sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    
    // Determine dynamic statuses
    const currentFlags = {};
    rules = rules.map(rule => {
      const effectiveDate = new Date(rule.effectiveFrom).setHours(0, 0, 0, 0);
      let dynamicStatus = 'Historical';

      if (rule.status === 'Inactive') {
        dynamicStatus = 'Inactive';
      } else if (effectiveDate > today) {
        dynamicStatus = 'Scheduled';
      } else {
        const key = `${rule.type}_${rule.category}`;
        if (!currentFlags[key]) {
          dynamicStatus = 'Active';
          currentFlags[key] = true;
        }
      }

      return { ...rule, displayStatus: dynamicStatus };
    });

    return { success: true, rules };
  },

  createIncentiveRule: async (ruleData) => {
    await delay();
    const mockIncentiveRules = getStore('mockIncentiveRules');
    
    // Check for exact duplicate active rule (same type, category, effectiveFrom, status: Active)
    const duplicate = mockIncentiveRules.find(r => 
      r.type === ruleData.type &&
      r.category === ruleData.category &&
      r.effectiveFrom === ruleData.effectiveFrom &&
      r.status === 'Active'
    );

    if (duplicate) {
      return { success: false, message: 'An active rule already exists for this category on the selected effective date.' };
    }

    const newRule = {
      _id: 'rule_' + Date.now(),
      ...ruleData,
      createdAt: Date.now(),
      createdBy: 'Admin'
    };

    mockIncentiveRules.push(newRule);
    setStore('mockIncentiveRules', mockIncentiveRules);
    
    return { success: true, rule: newRule, message: 'Incentive rule created successfully' };
  },

  updateIncentiveRule: async (id, updateData) => {
    await delay();
    const mockIncentiveRules = getStore('mockIncentiveRules');
    const existingIndex = mockIncentiveRules.findIndex(r => r._id === id);
    
    if (existingIndex === -1) {
      return { success: false, message: 'Rule not found' };
    }

    const existingRule = mockIncentiveRules[existingIndex];
    
    // If core values change, create a new rule instead of overwriting history
    if (
      String(existingRule.value) !== String(updateData.value) || 
      existingRule.effectiveFrom !== updateData.effectiveFrom
    ) {
      // Just create the new rule, don't touch the old one unless they specifically deactivate it.
      // Or we can deactivate the old one if it's the exact same effective date, but business rule says 
      // "If changing percentage/flat amount/effective date would change the historical meaning, preserve the old record and create appropriate new effective record."
      // Since it's an update, let's just create a new record and deactivate the old one. Wait, if we deactivate the old one, it loses its historical value!
      // Actually, if we just push a new one with a newer effective date, the old one naturally becomes 'Historical'.
      const newRule = {
        _id: 'rule_' + Date.now(),
        type: existingRule.type,
        category: existingRule.category,
        value: Number(updateData.value),
        effectiveFrom: updateData.effectiveFrom,
        status: updateData.status,
        createdAt: Date.now(),
        createdBy: 'Admin'
      };
      mockIncentiveRules.push(newRule);
      setStore('mockIncentiveRules', mockIncentiveRules);
      return { success: true, rule: newRule, message: 'New incentive rule created to preserve history.' };
    }

    // Simple status change
    mockIncentiveRules[existingIndex] = { ...existingRule, ...updateData };
    setStore('mockIncentiveRules', mockIncentiveRules);
    return { success: true, rule: mockIncentiveRules[existingIndex], message: 'Rule updated successfully' };
  },

  deactivateIncentiveRule: async (id) => {
    await delay();
    const mockIncentiveRules = getStore('mockIncentiveRules');
    const existingIndex = mockIncentiveRules.findIndex(r => r._id === id);
    
    if (existingIndex === -1) {
      return { success: false, message: 'Rule not found' };
    }

    mockIncentiveRules[existingIndex].status = 'Inactive';
    setStore('mockIncentiveRules', mockIncentiveRules);
    
    return { success: true, message: 'Rule deactivated successfully' };
  }
};
