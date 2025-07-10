
import React from 'react';
import { MapPin } from 'lucide-react';

interface SimpleCafe {
  name: string;
  address: string;
  distance: string;
}

interface SimpleCafeListProps {
  cafes: SimpleCafe[];
}

const SimpleCafeList: React.FC<SimpleCafeListProps> = ({ cafes }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="text-center mb-6">
        <p className="text-gray-600 text-lg">근처의 카페에 리뷰를 등록해보세요!</p>
      </div>
      
      <div className="space-y-3">
        {cafes.map((cafe, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{cafe.name}</h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {cafe.address}
              </div>
            </div>
            <span className="text-sm text-gray-500">{cafe.distance}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleCafeList;
