
import React from 'react';
import { MapPin } from 'lucide-react';

interface SimpleCafe {
  name: string;
  address: string;
  distance: string;
}

interface SimpleCafeListProps {
  cafes: SimpleCafe[];
  onWriteReview?: (cafe: any) => void;
}

const SimpleCafeList: React.FC<SimpleCafeListProps> = ({ cafes, onWriteReview }) => {
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
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm text-gray-500">{cafe.distance}</span>
                {onWriteReview && (
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    onClick={() => onWriteReview(cafe)}
                  >
                    리뷰쓰기
                  </button>
                )}
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleCafeList;
