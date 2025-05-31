import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { manageSubscription } from '@/lib/subscription';
import { useState } from 'react';
import { CreditCard, Calendar } from 'lucide-react';

export function SubscriptionStatus() {
  const { subscription, loading } = useSubscription();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      await manageSubscription();
    } catch (error) {
      console.error('Error managing subscription:', error);
      alert(t('errors.portalAccessFailed', 'サブスクリプション管理ページへのアクセスに失敗しました'));
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse h-6 w-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription || subscription.plan === 'standard') {
    return (
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {t('subscription.freePlan', 'スタンダードプラン')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-primary text-primary-foreground">
            {t('subscription.premiumPlan', 'プレミアムプラン')}
          </Badge>
          
          {subscription.isCanceled && (
            <Badge variant="destructive">
              {t('subscription.canceled', 'キャンセル済み')}
            </Badge>
          )}
        </div>
        
        {subscription.currentPeriodEnd && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>
              {subscription.isCanceled 
                ? t('subscription.expiresOn', { date: new Date(subscription.currentPeriodEnd).toLocaleDateString() }, `${new Date(subscription.currentPeriodEnd).toLocaleDateString()}に終了します`)
                : t('subscription.renewsOn', { date: new Date(subscription.currentPeriodEnd).toLocaleDateString() }, `${new Date(subscription.currentPeriodEnd).toLocaleDateString()}に更新されます`)
              }
            </span>
          </div>
        )}
        
        <Button 
          onClick={handleManageSubscription} 
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full mt-3 gap-2"
        >
          <CreditCard className="w-4 h-4" />
          {isLoading ? t('common.processing', '処理中...') : t('subscription.manage', 'サブスクリプション管理')}
        </Button>
      </CardContent>
    </Card>
  );
} 