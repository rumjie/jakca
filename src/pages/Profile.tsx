import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, MapPin, Calendar, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ReviewService } from '@/services/review';
import type { Review, LikedCafe } from '@/types/review';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [likedCafes, setLikedCafes] = useState<LikedCafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 사용자 리뷰 가져오기
      const { reviews: userReviews, error: reviewsError } = await ReviewService.getUserReviews(user.id);
      
      if (reviewsError) {
        console.error('리뷰 로딩 실패:', reviewsError);
        setError('리뷰를 불러오는데 실패했습니다.');
      } else {
        setReviews(userReviews);
      }

      // 사용자가 좋아요한 카페 가져오기
      const { cafes: userLikedCafes, error: likesError } = await ReviewService.getUserLikedCafes(user.id);
      
      if (likesError) {
        console.error('좋아요 카페 로딩 실패:', likesError);
        setError('좋아요한 카페를 불러오는데 실패했습니다.');
      } else {
        setLikedCafes(userLikedCafes);
      }
    } catch (error) {
      console.error('사용자 데이터 로딩 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (cafeId: string) => {
    if (!user) return;
    
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await ReviewService.deleteReview(cafeId, user.id);
      
      if (error) {
        console.error('리뷰 삭제 실패:', error);
        alert('리뷰 삭제에 실패했습니다.');
      } else {
        // 리뷰 목록에서 제거
        setReviews(reviews.filter(review => review.cafe_id !== cafeId));
        alert('리뷰가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('리뷰 삭제 중 오류:', error);
      alert('리뷰 삭제 중 오류가 발생했습니다- 관리자에게 문의해주세요.');
    }
  };

  const handleUnlikeCafe = async (cafeId: string) => {
    if (!user) return;
    
    if (!confirm('정말로 이 카페의 좋아요를 취소하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await ReviewService.unlikeCafe(cafeId, user.id);
      
      if (error) {
        console.error('좋아요 취소 실패:', error);
        alert('좋아요 취소에 실패했습니다.');
      } else {
        // 좋아요 목록에서 제거
        setLikedCafes(likedCafes.filter(cafe => cafe.id !== cafeId));
        alert('좋아요가 취소되었습니다.');
      }
    } catch (error) {
      console.error('좋아요 취소 중 오류:', error);
      alert('좋아요 취소 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← 홈으로
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">내 프로필</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* User Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {user.nickname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{user.nickname}</CardTitle>
                  <CardDescription>
                    {user.email && (
                      <div className="text-sm text-gray-600">{user.email}</div>
                    )}
                    <Badge variant="secondary" className="mt-1">
                      {user.platform === 'web' ? '이메일 로그인' : 
                       user.platform === 'google' ? 'Google 로그인' :
                       user.platform === 'kakao' ? 'Kakao 로그인' : '소셜 로그인'}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="mb-4 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadUserData}
                  className="mt-2"
                >
                  다시 시도
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reviews" className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>내가 쓴 리뷰</span>
                <Badge variant="secondary">{reviews.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="likes" className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>좋아요한 카페</span>
                <Badge variant="secondary">{likedCafes.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : reviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">아직 작성한 리뷰가 없습니다.</p>
                    <Button
                      onClick={() => navigate('/')}
                      className="mt-4"
                    >
                      카페 찾아보기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={`${review.user_id}-${review.cafe_id}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{review.cafe_name}</h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReview(review.cafe_id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-3">{review.comment}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(review.date)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Likes Tab */}
            <TabsContent value="likes" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : likedCafes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">아직 좋아요한 카페가 없습니다.</p>
                    <Button
                      onClick={() => navigate('/')}
                      className="mt-4"
                    >
                      카페 찾아보기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {likedCafes.map((cafe) => (
                    <Card key={cafe.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{cafe.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnlikeCafe(cafe.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Heart className="w-5 h-5 fill-red-500" />
                          </Button>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="truncate">{cafe.address}</span>
                        </div>
                        {cafe.rating && (
                          <div className="flex items-center space-x-1 mb-2">
                            {renderStars(Math.round(cafe.rating))}
                            <span className="text-sm text-gray-500">({cafe.rating})</span>
                          </div>
                        )}
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(cafe.liked_at)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
} 