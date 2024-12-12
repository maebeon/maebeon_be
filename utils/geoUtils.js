// utils/geoUtils.js
class GeoUtils {
    static calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // 지구의 반경 (km)
      const dLat = this.toRad(lat2 - lat1);
      const dLon = this.toRad(lon2 - lon1);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
  
    static toRad(value) {
      return value * Math.PI / 180;
    }
  
    static isWithinRadius(lat1, lon1, lat2, lon2, radius) {
      const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
      return distance <= radius;
    }
  }
  
  module.exports = GeoUtils;