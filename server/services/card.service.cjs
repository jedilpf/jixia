/**
 * 卡牌服务层
 * 处理卡牌相关的业务逻辑
 */

class CardService {
  constructor(models) {
    this.models = models;
  }

  /**
   * 获取卡牌列表
   * @param {Object} filters - 筛选条件
   * @returns {Object} 卡牌列表和分页信息
   */
  getCardList(filters = {}) {
    const { faction, type, rarity, tier, page = 1, limit = 20 } = filters;

    // 构建筛选条件
    const queryFilters = {};
    if (faction) queryFilters.faction = faction;
    if (type) queryFilters.type = type;
    if (rarity) queryFilters.rarity = rarity;
    if (tier) queryFilters.tier = parseInt(tier, 10);

    // 获取所有符合条件的卡牌
    const allCards = this.models.card.findAll(queryFilters);

    // 分页
    const total = allCards.length;
    const offset = (page - 1) * limit;
    const cards = allCards.slice(offset, offset + limit);

    return {
      cards: cards.map(card => ({
        id: card.id,
        name: card.name,
        faction: card.faction,
        type: card.type,
        rarity: card.rarity,
        tier: card.tier,
        cost: card.cost,
        attack: card.attack,
        hp: card.hp,
        shield: card.shield,
        skill: card.skill,
        unlockLevel: card.unlockLevel
      })),
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取卡牌详情
   * @param {string} cardId - 卡牌ID
   * @returns {Object} 卡牌详情
   */
  getCardDetail(cardId) {
    const card = this.models.card.findById(cardId);
    if (!card) {
      throw new Error('CARD_NOT_FOUND');
    }

    return {
      id: card.id,
      name: card.name,
      faction: card.faction,
      type: card.type,
      rarity: card.rarity,
      tier: card.tier,
      cost: card.cost,
      attack: card.attack,
      hp: card.hp,
      shield: card.shield,
      skill: card.skill,
      background: card.background,
      unlockLevel: card.unlockLevel,
      isActive: card.isActive
    };
  }

  /**
   * 获取用户的卡牌收藏
   * @param {string} userId - 用户ID
   * @returns {Array} 用户卡牌列表
   */
  getUserCards(userId) {
    // 获取所有可用卡牌
    const allCards = this.models.card.findAll();
    
    // TODO: 从 user_cards 表获取用户实际拥有的卡牌数量
    // 目前返回所有卡牌，数量为2（模拟已拥有）
    return {
      cards: allCards.map(card => ({
        cardId: card.id,
        name: card.name,
        faction: card.faction,
        type: card.type,
        rarity: card.rarity,
        tier: card.tier,
        count: 2, // 模拟数据，实际应从 user_cards 表获取
        unlockedAt: new Date().toISOString()
      })),
      total: allCards.length
    };
  }

  // ==================== 牌组管理 ====================

  /**
   * 获取用户的牌组列表
   * @param {string} userId - 用户ID
   * @returns {Object} 牌组列表
   */
  getUserDecks(userId) {
    const decks = this.models.deck.findByUser(userId);
    
    return {
      decks: decks.map(deck => ({
        id: deck.id,
        name: deck.name,
        faction: deck.faction,
        cardCount: deck.cards.length,
        isDefault: deck.isDefault,
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt
      })),
      total: decks.length
    };
  }

  /**
   * 获取牌组详情
   * @param {string} userId - 用户ID
   * @param {string} deckId - 牌组ID
   * @returns {Object} 牌组详情
   */
  getDeckDetail(userId, deckId) {
    const deck = this.models.deck.findById(deckId);
    if (!deck) {
      throw new Error('DECK_NOT_FOUND');
    }

    // 验证所有权
    if (deck.userId !== userId) {
      throw new Error('DECK_NOT_OWNED');
    }

    // 获取卡牌详细信息
    const cardDetails = deck.cards.map(cardId => {
      const card = this.models.card.findById(cardId);
      return card ? {
        id: card.id,
        name: card.name,
        faction: card.faction,
        type: card.type,
        rarity: card.rarity,
        tier: card.tier,
        cost: card.cost,
        attack: card.attack,
        hp: card.hp,
        shield: card.shield,
        skill: card.skill
      } : null;
    }).filter(Boolean);

    return {
      id: deck.id,
      name: deck.name,
      faction: deck.faction,
      cards: cardDetails,
      isDefault: deck.isDefault,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt
    };
  }

  /**
   * 创建牌组
   * @param {string} userId - 用户ID
   * @param {Object} deckData - 牌组数据
   * @returns {Object} 创建的牌组
   */
  createDeck(userId, deckData) {
    const { name, faction, cards } = deckData;

    // 验证牌组名称
    if (!name || name.trim().length === 0) {
      throw new Error('DECK_NAME_REQUIRED');
    }

    // 验证牌组规则
    if (!cards || cards.length !== 24) {
      throw new Error('DECK_MUST_HAVE_24_CARDS');
    }

    // 验证所有卡牌是否存在
    for (const cardId of cards) {
      const card = this.models.card.findById(cardId);
      if (!card) {
        throw new Error(`CARD_NOT_FOUND: ${cardId}`);
      }
      // 验证卡牌是否属于指定门派
      if (card.faction !== faction) {
        throw new Error(`CARD_FACTION_MISMATCH: ${cardId} is not ${faction}`);
      }
    }

    // 验证二阶/三阶卡牌数量限制
    const tier2Count = cards.filter(cardId => {
      const card = this.models.card.findById(cardId);
      return card && card.tier === 2;
    }).length;
    const tier3Count = cards.filter(cardId => {
      const card = this.models.card.findById(cardId);
      return card && card.tier === 3;
    }).length;

    if (tier2Count > 8) {
      throw new Error('TIER2_CARDS_EXCEED_LIMIT');
    }
    if (tier3Count > 4) {
      throw new Error('TIER3_CARDS_EXCEED_LIMIT');
    }

    // 检查用户是否已有默认牌组
    const existingDecks = this.models.deck.findByUser(userId);
    const isDefault = existingDecks.length === 0;

    // 创建牌组
    const deck = this.models.deck.create({
      userId,
      name: name.trim(),
      faction,
      cards,
      isDefault
    });

    return {
      id: deck.id,
      name: deck.name,
      faction: deck.faction,
      cardCount: deck.cards.length,
      isDefault: deck.isDefault,
      createdAt: deck.createdAt
    };
  }

  /**
   * 更新牌组
   * @param {string} userId - 用户ID
   * @param {string} deckId - 牌组ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的牌组
   */
  updateDeck(userId, deckId, updates) {
    // 查找牌组
    const deck = this.models.deck.findById(deckId);
    if (!deck) {
      throw new Error('DECK_NOT_FOUND');
    }

    // 验证所有权
    if (deck.userId !== userId) {
      throw new Error('DECK_NOT_OWNED');
    }

    const { name, faction, cards } = updates;

    // 如果更新卡牌，验证规则
    if (cards) {
      if (cards.length !== 24) {
        throw new Error('DECK_MUST_HAVE_24_CARDS');
      }

      const actualFaction = faction || deck.faction;
      for (const cardId of cards) {
        const card = this.models.card.findById(cardId);
        if (!card) {
          throw new Error(`CARD_NOT_FOUND: ${cardId}`);
        }
        if (card.faction !== actualFaction) {
          throw new Error(`CARD_FACTION_MISMATCH: ${cardId} is not ${actualFaction}`);
        }
      }

      // 验证二阶/三阶卡牌数量
      const tier2Count = cards.filter(cardId => {
        const card = this.models.card.findById(cardId);
        return card && card.tier === 2;
      }).length;
      const tier3Count = cards.filter(cardId => {
        const card = this.models.card.findById(cardId);
        return card && card.tier === 3;
      }).length;

      if (tier2Count > 8) {
        throw new Error('TIER2_CARDS_EXCEED_LIMIT');
      }
      if (tier3Count > 4) {
        throw new Error('TIER3_CARDS_EXCEED_LIMIT');
      }
    }

    // 更新牌组
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (faction) updateData.faction = faction;
    if (cards) updateData.cards = cards;

    const updatedDeck = this.models.deck.update(deckId, updateData);

    return {
      id: updatedDeck.id,
      name: updatedDeck.name,
      faction: updatedDeck.faction,
      cardCount: updatedDeck.cards.length,
      isDefault: updatedDeck.isDefault,
      updatedAt: updatedDeck.updatedAt
    };
  }

  /**
   * 删除牌组
   * @param {string} userId - 用户ID
   * @param {string} deckId - 牌组ID
   * @returns {boolean} 是否成功删除
   */
  deleteDeck(userId, deckId) {
    // 查找牌组
    const deck = this.models.deck.findById(deckId);
    if (!deck) {
      throw new Error('DECK_NOT_FOUND');
    }

    // 验证所有权
    if (deck.userId !== userId) {
      throw new Error('DECK_NOT_OWNED');
    }

    // 不能删除默认牌组
    if (deck.isDefault) {
      throw new Error('CANNOT_DELETE_DEFAULT_DECK');
    }

    return this.models.deck.deleteByUser(userId, deckId);
  }

  /**
   * 设置默认牌组
   * @param {string} userId - 用户ID
   * @param {string} deckId - 牌组ID
   * @returns {Object} 更新后的牌组
   */
  setDefaultDeck(userId, deckId) {
    // 查找牌组
    const deck = this.models.deck.findById(deckId);
    if (!deck) {
      throw new Error('DECK_NOT_FOUND');
    }

    // 验证所有权
    if (deck.userId !== userId) {
      throw new Error('DECK_NOT_OWNED');
    }

    const updatedDeck = this.models.deck.setDefault(userId, deckId);

    return {
      id: updatedDeck.id,
      name: updatedDeck.name,
      faction: updatedDeck.faction,
      isDefault: updatedDeck.isDefault,
      updatedAt: updatedDeck.updatedAt
    };
  }
}

module.exports = { CardService };
