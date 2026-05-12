const admin = require('firebase-admin');

class FirebaseService {
  constructor() {
    this.db = admin.firestore();
  }

  async getFirestoreFavorites(userId) {
    const snapshot = await this.db.collection('favorites')
      .where('userId', '==', userId)
      .get();
      
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addFirestoreFavorite(userId, productId) {
    const product = await getProductFromDB(productId); // Implement this
    
    const docRef = await this.db.collection('favorites').add({
      userId,
      productId,
      name: product.name,
      image: product.image,
      price: product.price,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { id: docRef.id, ...product };
  }
}

module.exports = new FirebaseService();