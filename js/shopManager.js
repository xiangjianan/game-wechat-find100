export default class ShopManager {
  constructor() {
    this.products = new Map();
    this.initProducts();
  }

  initProducts() {
    this.products.set('hint_1', {
      id: 'hint_1',
      itemId: 'hint',
      name: '提示道具 x1',
      description: '获得1个提示道具',
      icon: '💡',
      price: 50,
      quantity: 1
    });

    this.products.set('hint_5', {
      id: 'hint_5',
      itemId: 'hint',
      name: '提示道具 x5',
      description: '获得5个提示道具',
      icon: '💡',
      price: 200,
      quantity: 5
    });

    this.products.set('hint_10', {
      id: 'hint_10',
      itemId: 'hint',
      name: '提示道具 x10',
      description: '获得10个提示道具',
      icon: '💡',
      price: 350,
      quantity: 10
    });
  }

  init(coinManager, itemManager) {
    this.coinManager = coinManager;
    this.itemManager = itemManager;
  }

  getProduct(productId) {
    return this.products.get(productId);
  }

  getAllProducts() {
    return Array.from(this.products.values());
  }

  canBuy(productId) {
    const product = this.products.get(productId);
    if (!product) return false;

    return this.coinManager.hasEnoughCoins(product.price);
  }

  buy(productId) {
    const product = this.products.get(productId);
    if (!product) return { success: false, reason: 'product_not_found' };

    if (!this.coinManager.hasEnoughCoins(product.price)) {
      return { success: false, reason: 'not_enough_coins' };
    }

    const spent = this.coinManager.spendCoins(product.price);
    if (!spent) {
      return { success: false, reason: 'spend_failed' };
    }

    const added = this.itemManager.addItem(product.itemId, product.quantity);
    if (!added) {
      this.coinManager.addCoins(product.price);
      return { success: false, reason: 'add_item_failed' };
    }

    return { 
      success: true, 
      product: product,
      coinsSpent: product.price,
      itemsAdded: product.quantity
    };
  }

  getProductPrice(productId) {
    const product = this.products.get(productId);
    return product ? product.price : 0;
  }

  getProductsByItem(itemId) {
    return this.getAllProducts().filter(p => p.itemId === itemId);
  }
}
