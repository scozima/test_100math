import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { manageSubscription } from '@/lib/subscription';
import { useState } from 'react';

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
    return <div className="animate-pulse h-6 w-24 bg-muted rounded" />;
  }

  if (!subscription || subscription.plan === 'standard') {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline">{t('subscription.freePlan', 'スタンダードプラン')}</Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-primary">
          {t('subscription.premiumPlan', 'プレミアムプラン')}
        </Badge>
        
        {subscription.isCanceled && (
          <Badge variant="destructive">
            {t('subscription.canceled', 'キャンセル済み')}
          </Badge>
        )}
      </div>
      
      {subscription.currentPeriodEnd && (
        <p className="text-xs text-muted-foreground">
          {subscription.isCanceled 
            ? t('subscription.expiresOn', { date: new Date(subscription.currentPeriodEnd).toLocaleDateString() }, `${new Date(subscription.currentPeriodEnd).toLocaleDateString()}に終了します`)
            : t('subscription.renewsOn', { date: new Date(subscription.currentPeriodEnd).toLocaleDateString() }, `${new Date(subscription.currentPeriodEnd).toLocaleDateString()}に更新されます`)
          }
        </p>
      )}
      
      <div className="mt-2">
        <Button 
          onClick={handleManageSubscription} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? t('common.processing', '処理中...') : t('subscription.manage', 'サブスクリプション管理')}
        </Button>
      </div>
    </div>
  );
} 